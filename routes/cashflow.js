const asyncHandler = require('express-async-handler')
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
    static INCOMING = new CashFlowTypeEnum(1, 'Entrada');
    static OUTGOING = new CashFlowTypeEnum(2, 'Saída');

    static getById(id) {
        switch(id) {
            case CashFlowTypeEnum.INCOMING.id:
                return CashFlowTypeEnum.INCOMING;
            case CashFlowTypeEnum.OUTGOING.id:
                return CashFlowTypeEnum.OUTGOING;
        }
    }

    static list() {
        return [
            CashFlowTypeEnum.INCOMING,
            CashFlowTypeEnum.OUTGOING
        ];
    }
}

const createCashFlowValidations = [
    body('description').notEmpty().trim().escape().withMessage('Not be empty'),
    body('cashFlowType')
        .isIn(CashFlowTypeEnum.list().map(c => c.id))
        .toInt()
        .withMessage(`should be in [${CashFlowTypeEnum.list().map(c => c.id).toString()}]`),
    body('value').isFloat({min: 0}).toFloat().withMessage('should be a number greater than 0.0'),
    body('datetime').isISO8601().toDate().withMessage('should be a datetime in ISO 8601 UTC format')
];

const updateCashFlowValidations = [
    param('id').toInt(),
    ...createCashFlowValidations
];

const filteredCashFlow = ({begin, end, cashFlowType}) => {
    const query = db('cashflow');
    if (begin && end)    
        query.whereBetween('datetime', [begin, end]);
    else if (begin)
        query.where('datetime', '>=', begin);
    else if (end)
        query.where('datetime', '<=', end);

    if (typeof cashFlowType === 'number')
        query.where({cashFlowType})

    return query;
};

router.get('/',
    validationMiddleware([
        query('cashFlowType')
            .if(query('cashFlowType').exists())
            .isIn(CashFlowTypeEnum.list().map(c => c.id))
            .toInt()
            .withMessage(`should be in [${CashFlowTypeEnum.list().map(c => c.id).toString()}]`),
        query('begin').if(query('begin').exists()).isISO8601().toDate(),
        query('end').if(query('end').exists()).isISO8601().toDate(),
        query('limit').toInt(),
        query('offset').toInt()
    ]),
    asyncHandler(async (req, res) => {
        let { limit, offset, begin, end, cashFlowType } = req.query;
        limit = limit || constants.LIMIT;
        offset = offset || constants.OFFSET;
        const cashflowquery = filteredCashFlow({begin, end, cashFlowType});
        let total = (await cashflowquery.clone().count('*'))[0].count;
        let cashflow = await cashflowquery.clone()
                                .orderBy([{column: 'datetime', order: 'desc'}, {column: 'id', order: 'desc'}])
                                .limit(limit)
                                .offset(offset);
        cashflow.forEach(c => c.cashFlowType = CashFlowTypeEnum.getById(c.cashFlowType));
        res.status(constants.http.OK).json({
            limit,
            offset,
            total,
            begin,
            end,
            cashFlowType,
            data: cashflow
        });  
    })
);

router.get('/balance', 
    validationMiddleware([
        query('cashFlowType')
            .if(query('cashFlowType').exists())
            .isIn(CashFlowTypeEnum.list().map(c => c.id))
            .toInt()
            .withMessage(`should be in [${CashFlowTypeEnum.list().map(c => c.id).toString()}]`),
        query('begin').if(query('begin').exists()).isISO8601().toDate(),
        query('end').if(query('end').exists()).isISO8601().toDate(),
    ]),
    asyncHandler(async (req, res) => {
        let { begin, end, cashFlowType } = req.query;
        const cashflowquery = filteredCashFlow({begin, end, cashFlowType});
        const incoming = (await cashflowquery.clone().where('cashFlowType', CashFlowTypeEnum.INCOMING.id).sum('value'))[0].sum;
        const outgoing = (await cashflowquery.clone().where('cashFlowType', CashFlowTypeEnum.OUTGOING.id).sum('value'))[0].sum;
        const balance = incoming - outgoing;
        res.status(constants.http.OK).json({
            begin,
            end,
            cashFlowType,
            balance
        });  
    })
);

router.post(
  '/', 
  validationMiddleware(createCashFlowValidations), 
  asyncHandler(async (req, res) => {
    const {description, cashFlowType, value, datetime} = req.body;
    const result = (await db('cashflow').insert({description, cashFlowType, value, datetime}, '*'))[0];
    res.status(constants.http.CREATED).json(result);
  })
);

router.put(
    '/:id',
    validationMiddleware(updateCashFlowValidations),
    asyncHandler(async (req, res) => {
        const {description, cashFlowType, value, datetime} = req.body;
        const {id} = req.params;
        const result = (await db('cashflow').where({ id }).update({description, cashFlowType, value, datetime}, '*'))[0];
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    })
);

router.delete(
    '/:id',
    validationMiddleware([
        param('id').toInt(),
    ]),
    asyncHandler(async (req, res) => {
        const {id} = req.params;
        const result = (await db('cashflow').where({ id }).del('*'))[0];
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    })
);

module.exports = router;
