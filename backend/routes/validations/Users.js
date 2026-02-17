const Joi = require('joi');
const Enums = require('../../config/Enums'); // Şifre uzunluğu sabiti için

const create = Joi.object({
    first_name: Joi.string().required().min(2),
    last_name: Joi.string().required().min(2),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(Enums.PASS_LENGTH || 8), // Config'deki sabit veya 8
    phone_number: Joi.string().optional(),
    roles: Joi.array().items(Joi.string()).optional() // Role ID'leri array olarak gelir
});

const update = Joi.object({
    _id: Joi.string().required(), // Güncellemek için ID şart
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(Enums.PASS_LENGTH || 8).optional(),
    phone_number: Joi.string().optional(),
    roles: Joi.array().items(Joi.string()).optional(),
    is_active: Joi.bool().optional()
});

const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const changePassword = Joi.object({
    password: Joi.string().required().min(Enums.PASS_LENGTH || 8)
});

module.exports = {
    create,
    update,
    login,
    changePassword
};