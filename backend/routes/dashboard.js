const express = require('express');
const router = express.Router();
const Response = require('../lib/Response');
const Enums = require('../config/Enums');
const auth = require('../lib/auth')();

// Modelleri import et
const Users = require('../db/models/Users');
const Roles = require('../db/models/Roles');
const Categories = require('../db/models/Categories'); 

/* GET Dashboard Stats */
router.get('/', auth.authenticate(), async (req, res, next) => {
    /*
        #swagger.tags = ['Stats']
        #swagger.summary = 'Get Dashboard Statistics'
    */
    try {
        // Promise.all ile tüm sayımları PARALEL başlatıyoruz (Performans için kritik)
        const [userCount, roleCount, categoryCount] = await Promise.all([
            Users.countDocuments({}), // İstersen { is_active: true } gibi filtre de verebilirsin
            Roles.countDocuments({}),
            Categories.countDocuments({})
        ]);

        res.json(Response.successResponse({
            users: userCount,
            roles: roleCount,
            categories: categoryCount
        }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

module.exports = router;