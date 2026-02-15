var express = require('express');
var router = express.Router();

router.use('/users', require('./users'));
router.use('/roles', require('./roles'));
router.use('/categories', require('./categories'));
router.use('/auditlogs', require('./auditlogs'));
router.use('/routes', require('./routes'));  // upload
router.use('/email', require('./email'));

module.exports = router;