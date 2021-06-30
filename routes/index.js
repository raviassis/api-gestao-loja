var router = require('express').Router();
const cashflow = require('./cashflow');

router.use('/cashflow', cashflow);

module.exports = router;
