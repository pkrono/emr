const Joi = require('joi');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(express.json()); //parsing Json Objects

if (!process.env.PrivateKey) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined!');
    process.exit(1);
 }


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(bodyParser.json());

// Middleware for authentication (placeholder)
const authenticate = (req, res, next) => {
    const token = req.header('x-auth-token')
    if (!token) {
        res.status(401).send('Access denied. No token provided');
    }
    try {
        const decoded = jwt.verify(token, process.env.PrivateKey);
        req.user = decoded;
        next();
    }
    catch (ex) {
        res.status(400).send('Invalid token.')
    }
};


/**
 * @api {get} / Status Check
 */
app.get('/', (req, resp) => {
    resp.send('OK')
});

/**
 * @api {get} /api/users Register a new user
 */
app.post('/api/users', async (req, res) => {
    const user = req.body;
    const { error } = validateUser(user);
    if (error) {
      return res.status(400).json(error.details[0].message);
    }
    const client = await pool.connect();

    try {
        const userCheckResult = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
        );

        if (userCheckResult.rows.length > 0) {
            // If user already exists, return an error message
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed_pass = await bcrypt.hash(user.password, salt)
        await client.query('BEGIN');
        const result = await client.query(
                'INSERT INTO users (name, password,  email, role_id, create_date) VALUES ($1, $2, $3, $4, now())',
                [user.name, hashed_pass, user.email, user.role_id]
            );
        await client.query('COMMIT');
        const token = jwt.sign({_id: result.rows[0]}, process.env.PrivateKey,)
        res.header('x-auth-token', token).json({ status: 'success', message: 'User created Successfully' });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        client.release();
    }
});


app.post('/api/auth/', async (req, res) => {
    const user = req.body;
    const { error } = validate(user);
    if (error) {
      return res.status(400).json(error.details[0].message);
    }
    const client = await pool.connect();

    try {
        const userCheckResult = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
        );

        if (userCheckResult.rows.length === 0) {
            // If user already exists, return an error message
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const validPassword = await bcrypt.compare(req.body.password, userCheckResult.rows[0].password);
        if (!validPassword) { 
             return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const token = jwt.sign({_id: userCheckResult.rows[0].id}, process.env.PrivateKey,)
        res.json({ status: 'success', token: token });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        client.release();
    }
});


/**
 * @api {get} /api/drugs Get all active drugs
 */
app.get('/api/drugs', authenticate, async (req, res) => {
    try {
        const active_drugs_result = await pool.query('SELECT id, name, qoh FROM drugs WHERE is_active = True');
        if (active_drugs_result.rowCount === 0) {
            return res.status(404).json({ message: 'No active drugs found' });
        }
        res.json(active_drugs_result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 *@apiDescription This endpoint retrieves the details of a specific drug identified by its ID, 
 * including its name, quantity on hand (QoH), and a list of alternative drugs. The user must be 
 * authenticated to access this endpoint.
 */
app.get('/api/drugs/:id', authenticate, async (req, res) => {
    const drug_id = req.params.id
    try {
        const drug_result = await pool.query('SELECT id, name, qoh FROM drugs WHERE id = $1 AND is_active = True', [drug_id]);
        if (drug_result.rowCount.length === 0) {
            return res.status(400).json({ message: 'Drug not found' });
        }

        const altenatives = await pool.query(
            'SELECT d.id, d.name, d.qoh FROM alternative_drug ad JOIN drugs d ON ad.alternative_id = d.id WHERE ad.drug_id = $1',
            [drug_id]);
        res.json({
            drug: drug_result.rows[0],
            altenatives: altenatives.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Sever Error' });
    }
});

app.post('/api/drugs', authenticate, async (req, res) => {
    const drugs = req.body;
    const result = validateDrug(drugs);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        for (const drug of drugs) {
            await client.query(
                'INSERT INTO drugs (name, description, qoh, create_date, create_uid) VALUES ($1, $2, $3, now(), 1)',
                [drug.name, drug.description, drug.qoh]
            );
        }
        await client.query('COMMIT');
        res.json({ status: 'success', message: 'Drugs created Successfully' });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        client.release();
    }
});

/** 
*@api {put} /api/drugs/:id Update drug information
* @apiBody {Boolean} [is_active] Drug's activation status.
* @apiBody {Number} [qoh] Quantity on hand of the drug.
*/
app.put('/api/drugs/:id', authenticate, async (req, res) => {
    const drug_id = req.params.id;
    const { is_active, qoh } = req.body;

    if (is_active === undefined && qoh === undefined) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    let updateQuery = '';
    let updateValues = [];

    if (is_active !== undefined) {
        updateQuery = 'UPDATE drugs SET is_active = $1 WHERE id = $2';
        updateValues = [is_active, drug_id];
    } else if (qoh !== undefined) {
        updateQuery = 'UPDATE drugs SET qoh = $1 WHERE id = $2';
        updateValues = [qoh, drug_id];
    }

    try {
        const result = await pool.query(updateQuery, updateValues);
        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Drug not found' });
        }
        res.json({ status: 'success', message: 'Drug updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @api {delete} /api/drugs/:id Delete a drug
 */
app.delete('/api/drugs/:id', authenticate, async (req, res) => {
    const drug_id = req.params.id;

    try {
        // Execute the delete query
        const result = await pool.query('DELETE FROM drugs WHERE id = $1', [drug_id]);
        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Drug not found' });
        }
        // Send success response
        res.json({ status: 'success', message: 'Drug deleted successfully' });
    } catch (err) {
        console.error(err);
        // Send error response
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


function validate(user) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(225).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });

    return schema.validate(user)

}
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(225).required(),
        email: Joi.string().min(5).max(225).required().email(),
        password: Joi.string().min(5).max(255).required(),
        role_id: Joi.number()
    });

    return schema.validate(user)

}

function validateDrug(drug) { 
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(drug);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`))