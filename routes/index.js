var router = require('express').Router();
const cashflow = require('./cashflow');

router.use('/cashflow', cashflow);
router.use('/recurrents', require('./recurrents'));

module.exports = router;
