var router = require('express').Router();
const DomainException = require('../util/exceptions/domainException');

router.use('/cashflow', require('./cashflow'));
router.use('/recurrents', require('./recurrents'));
router.use('/account', require('./account'));
router.use('/auth', require('./auth'));
router.use('/registers', require('./registers'));

router.use((err, req, res, next) => {
    if (err instanceof DomainException) {
        res.status(err.httpErrorCode)
            .json({
                errors: [
                    {
                        msg: err.message
                    }
                ]
            });
    } else {
        return next(err);
    }
});

module.exports = router;
