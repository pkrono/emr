const pool = require('../config/db');
const { validateCheckout } = require('../models/validation');
const { sendReplenishmentEmail } = require('../services/emailService');

exports.checkout = async (req, res) => {
    const checkoutData = req.body;
    const { error } = validateCheckout(checkoutData);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const item of checkoutData.items) {
            const drugResult = await client.query(
                'SELECT name, qoh, reorder_level FROM drugs WHERE id = $1',
                [item.drug_id]
            );
            const drug = drugResult.rows[0];

            if (!drug) {
                throw new Error(`No Drug with ID ${item.drug_id}`);
            }
            const newQoh = drug.qoh - item.qty;

            if (newQoh < 0) {
                throw new Error(`Insufficient stock for drug ID ${item.drug_id}`);
            }

            const updateResult = await client.query(
                'UPDATE drugs SET qoh = $1 WHERE id = $2 AND is_active = True RETURNING id, qoh, reorder_level, name',
                [newQoh, item.drug_id]
            );

            const updatedDrug = updateResult.rows[0];

            if (updatedDrug.qoh <= updatedDrug.reorder_level) {
                await sendReplenishmentEmail(updatedDrug);
            }
        }

        const result = await client.query(
            'INSERT INTO prescription (dispensed_by, patient_id, total_amount, create_date) VALUES ($1, $2, $3, now()) RETURNING id',
            [checkoutData.user_id, checkoutData.patient_id, checkoutData.total_amount]
        );

        const prescription_id = result.rows[0].id;

        for (const item of checkoutData.items) {
            await client.query(
                'INSERT INTO prescription_item (prescription_id, drug_id, qty, unit_price,create_date) VALUES ($1, $2, $3, $4,now())',
                [prescription_id, item.drug_id, item.quantity, item.unit_price]
            );
        }

        await client.query('COMMIT');
        res.json({ status: 'success', message: 'Checkout completed successfully ', prescription_id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    } finally {
        client.release();
    }
};
