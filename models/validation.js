const Joi = require('joi');

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(225).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });

    return schema.validate(user);
}

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(225).required(),
        email: Joi.string().min(5).max(225).required().email(),
        password: Joi.string().min(5).max(255).required(),
        role_id: Joi.number(),
    });

    return schema.validate(user);
}

function validateDrug(drug) {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
    });

    return schema.validate(drug);
}

function validateCheckout(data) {
    const schema = Joi.object({
        user_id: Joi.number().required(),
        total_amount: Joi.number().required(),
        items: Joi.array().items(
            Joi.object({
                drug_id: Joi.number().required(),
                qty: Joi.number().required(),
                price: Joi.number().required(),
            })
        ).required(),
    });

    return schema.validate(data);
}

module.exports = {
    validate,
    validateUser,
    validateDrug,
    validateCheckout,
};
