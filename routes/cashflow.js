const router = require('express').Router();
const { body, query, param } = require('express-validator');
const db = require('../data');
const constants = require('../util/constants');
const validationMiddleware = require('../middlewares/validationMiddleware');

router.get('/',
    validationMiddleware([
        query('limit').toInt(),
        query('offset').toInt()
    ]),
    async (req, res) => {
        let { limit, offset } = req.query;
        limit = limit || constants.LIMIT;
        offset = offset || constants.OFFSET;
        const cashflow = await db('cashflow')
                                .orderBy([{column: 'datetime', order: 'desc'}])
                                .limit(limit)
                                .offset(offset);
        res.status(200).json({
            limit,
            offset,
            data: cashflow
        });  
    }
);

const createCashFlowValidations = [
    body('description').notEmpty().trim().escape().withMessage('Not be empty'),
    body('cashFlowType').isIn([0, 1]).toInt().withMessage(`should be in [${[0,1].toString()}]`),
    body('value').isFloat({min: 0}).toFloat().withMessage('should be a number greater than 0.0'),
    body('datetime').isISO8601().toDate().withMessage('should be a datetime in ISO 8601 UTC format')
];

const updateCashFlowValidations = [
    param('id').toInt(),
    ...createCashFlowValidations
];

router.post(
  '/', 
  validationMiddleware(createCashFlowValidations), 
  async (req, res) => {
    const {description, cashFlowType, value, datetime} = req.body;
    const result = (await db('cashflow').insert({description, cashFlowType, value, datetime}, '*'))[0];
    res.status(constants.http.CREATED).json(result);
  }
);

router.put(
    '/:id',
    validationMiddleware(updateCashFlowValidations),
    async (req, res) => {
        const {description, cashFlowType, value, datetime} = req.body;
        const {id} = req.params;
        const result = (await db('cashflow').where({ id }).update({description, cashFlowType, value, datetime}, '*'))[0];
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    }
);

router.delete(
    '/:id',
    validationMiddleware([
        param('id').toInt(),
    ]),
    async (req, res) => {
        const {id} = req.params;
        const result = (await db('cashflow').where({ id }).del('*'))[0];
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    }
);

module.exports = router;
