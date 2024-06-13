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

module.exports = {
    validate,
    validateUser,
    validateDrug,
};
