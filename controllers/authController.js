const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { validate } = require('../models/validation');

exports.login = async (req, res) => {
    const user = req.body;
    const { error } = validate(user);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    const client = await pool.connect();

    try {
        const userCheckResult = await client.query('SELECT * FROM users WHERE email = $1', [user.email]);
        if (userCheckResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const validPassword = await bcrypt.compare(req.body.password, userCheckResult.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const token = jwt.sign({ _id: userCheckResult.rows[0].id }, process.env.PrivateKey);
        res.json({ status: 'success', token: token });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};
