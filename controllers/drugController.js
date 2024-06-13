const pool = require('../config/db');
const { validateDrug } = require('../models/validation');

exports.getAllDrugs = async (req, res) => {
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
};

exports.getDrugById = async (req, res) => {
    const drug_id = req.params.id;
    try {
        const drug_result = await pool.query('SELECT id, name, qoh FROM drugs WHERE id = $1 AND is_active = True', [drug_id]);
        if (drug_result.rowCount.length === 0) {
            return res.status(400).json({ message: 'Drug not found' });
        }
        const alternatives = await pool.query(
            'SELECT d.id, d.name, d.qoh FROM alternative_drug ad JOIN drugs d ON ad.alternative_id = d.id WHERE ad.drug_id = $1',
            [drug_id]
        );
        res.json({
            drug: drug_result.rows[0],
            alternatives: alternatives.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Sever Error' });
    }
};

exports.createDrugs = async (req, res) => {
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
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

exports.updateDrug = async (req, res) => {
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
};

exports.deleteDrug = async (req, res) => {
    const drug_id = req.params.id;

    try {
        const result = await pool.query('DELETE FROM drugs WHERE id = $1', [drug_id]);
        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Drug not found' });
        }
        res.json({ status: 'success', message: 'Drug deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
