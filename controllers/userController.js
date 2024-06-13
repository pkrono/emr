const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validateUser } = require('../models/validation');

exports.register = async (req, res) => {
    const user = req.body;
    const { error } = validateUser(user);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    const client = await pool.connect();

    try {
        const userCheckResult = await client.query('SELECT * FROM users WHERE email = $1', [user.email]);
        if (userCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed_pass = await bcrypt.hash(user.password, salt);
        await client.query('BEGIN');
        const result = await client.query(
            'INSERT INTO users (name, password, email, role_id, create_date) VALUES ($1, $2, $3, $4, now())',
            [user.name, hashed_pass, user.email, user.role_id]
        );
        await client.query('COMMIT');
        const token = jwt.sign({ _id: result.rows[0] }, process.env.PrivateKey);
        res.header('x-auth-token', token).json({ status: 'success', message: 'User created Successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};
