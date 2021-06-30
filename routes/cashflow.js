const router = require('express').Router();
const { body, query, param } = require('express-validator');
const db = require('../data');
const constants = require('../util/constants');
const validationMiddleware = require('../middlewares/validationMiddleware');

class CashFlowTypeEnum {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    static INCOMING = new CashFlowTypeEnum(0, 'Entrada');
    static OUTGOING = new CashFlowTypeEnum(1, 'Saída');

    static getById(id) {
        switch(id) {
            case CashFlowTypeEnum.INCOMING.id:
                return CashFlowTypeEnum.INCOMING;
            case CashFlowTypeEnum.OUTGOING.id:
                return CashFlowTypeEnum.OUTGOING;
        }
    }
}

router.get('/',
    validationMiddleware([
        query('limit').toInt(),
        query('offset').toInt()
    ]),
    async (req, res) => {
        let { limit, offset } = req.query;
        limit = limit || constants.LIMIT;
        offset = offset || constants.OFFSET;
        let total = (await db('cashflow').count('*'))[0].count;
        let cashflow = await db('cashflow')
                                .orderBy([{column: 'datetime', order: 'desc'}])
                                .limit(limit)
                                .offset(offset);
        cashflow.forEach(c => c.cashFlowType = CashFlowTypeEnum.getById(c.cashFlowType));
        res.status(200).json({
            limit,
            offset,
            total,
            data: cashflow
        });  
    }
);

const createCashFlowValidations = [
    body('description').notEmpty().trim().escape().withMessage('Not be empty'),
    body('cashFlowType')
        .isIn([CashFlowTypeEnum.INCOMING.id, CashFlowTypeEnum.OUTGOING.id])
        .toInt()
        .withMessage(`should be in [${[CashFlowTypeEnum.INCOMING.id, CashFlowTypeEnum.OUTGOING.id].toString()}]`),
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
