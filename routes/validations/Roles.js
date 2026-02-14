const Joi = require('joi');

const create = Joi.object({
    role_name: Joi.string().required().min(3),
    is_active: Joi.boolean().optional(),
    permissions: Joi.array().items(Joi.string()).optional() // Rol oluştururken yetki de verilebilsin
});

const update = Joi.object({
    _id: Joi.string().required(),
    role_name: Joi.string().min(3).optional(),
    is_active: Joi.boolean().optional(),
    permissions: Joi.array().items(Joi.string()).optional()
});

module.exports = { create, update };