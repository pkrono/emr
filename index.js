const Joi = require('joi');
const express = require('express');


const bodyParser = require('body-parser');
const { Pool } = require('pg');
const uuid = require('uuid');
require('dotenv').config();

const app = express();

app.use(express.json()); //parsing Json Objects


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
  // Implement your authentication logic here
  next();
};

const drugs = [
    { id: 1, name: 'drug1' },
    { id: 2, name: 'drug2' },
    { id: 3, name: 'drug3' }
];

app.get('/', (req, resp) => {
    resp.send('OK')
});

//Get all drugs
app.get('/api/drugs', (req, res) =>  { 

    res.send(drugs);
});

/**
 *@apiDescription This endpoint retrieves the details of a specific drug identified by its ID, 
 * including its name, quantity on hand (QoH), and a list of alternative drugs. The user must be 
 * authenticated to access this endpoint.
 */
app.get('/api/drugs/:id', authenticate, async (req, res) => {
    const drug_id = req.params.id
    try {
        const drug_result = await pool.query('SELECT id, name, qoh FROM drugs WHERE id = $1', [drug_id]);
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

app.put('/api/drugs/:id', (req, res) => {
    //check if exist

    const drug = drugs.find(c => c.id === parseInt(req.params.id));
    if (!drug) { 
        return res.status(404).send('Drug with the given id not found!');
    }
   
    //Validate
   const result = validateDrug(req.body)

    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    //Update drug
    drug.name = req.body.name;
    res.send(drug);
});

app.delete('/api/drugs/:id', (req, res) => {
    //check if exists
    const drug = drugs.find(c => c.id === parseInt(req.params.id));
    if (!drug) { 
        return res.status(404).send('Drug with the given id not found');
    }

    //Delete
    const index = drugs.indexOf(drug);
    drugs.splice(index, 1);

    res.send(drug)
});

function validateDrug(drug) { 
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(drug);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`))