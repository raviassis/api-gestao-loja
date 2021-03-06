const asyncHandler = require('express-async-handler')
const router = require('express').Router();
const { body, query, param } = require('express-validator');
const db = require('../data');
const constants = require('../util/constants');
const validationMiddleware = require('../middlewares/validationMiddleware');
const cashFlowRepository = require('../data/cashFlowRepository');
const CashFlowTypeEnum = require('../models/cashFlowTypeEnum');
const authMiddleware = require('../middlewares/authMiddleware');

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

router.use(authMiddleware);

/**
 * List cashflow
 */
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
        const filter = {
            users_id: req.loggedUser.id,
            begin,
            end, 
            cashFlowType
        };
        let total = (await cashFlowRepository
                            .filteredCashFlow(filter)
                            .count('*'))[0].count;
        let cashflow = await cashFlowRepository
                                .filteredCashFlow(filter)
                                .orderBy([
                                    {column: 'datetime', order: 'desc'}, 
                                    {column: 'id', order: 'desc'}
                                ])
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

/**
 * Get balance
 */
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
        const filter = {
            users_id: req.loggedUser.id,
            begin,
            end, 
            cashFlowType
        };
        const cashflowquery = cashFlowRepository
                                .filteredCashFlow(filter);
        const incoming = (await cashflowquery
                                    .clone()
                                    .where('cashFlowType', CashFlowTypeEnum.INCOMING.id)
                                    .sum('value'))[0].sum;
        const outgoing = (await cashflowquery
                                    .clone()
                                    .where('cashFlowType', CashFlowTypeEnum.OUTGOING.id)
                                    .sum('value'))[0].sum;
        const balance = incoming - outgoing;
        res.status(constants.http.OK).json({
            begin,
            end,
            cashFlowType,
            balance
        });  
    })
);

router.get(
    '/consolidatedReport',
    validationMiddleware([
        query('begin').if(query('begin').exists()).isISO8601().toDate(),
        query('end').if(query('end').exists()).isISO8601().toDate(),
    ]),
    asyncHandler(async (req, res) => {
        let { begin, end } = req.query;
        const filter = {
            users_id: req.loggedUser.id,
            begin,
            end
        };
        const cashFlow = await cashFlowRepository
                            .consolidatedReport(filter);
        res.status(constants.http.OK)
            .json({
                begin,
                end,
                data: cashFlow
            });
    })
);

router.get('/suggestedDescriptions',
    validationMiddleware([
        query('description').trim()
    ]),
    asyncHandler(async (req, res) => {
        const { description } = req.query;
        const result = await db('cashflow')
                            .where({users_id: req.loggedUser.id})
                            .whereRaw(`UPPER(description) LIKE ?`, [`%${description.toUpperCase()}%`])
                            .distinct('description')
                            .orderBy('description')
                            .limit(constants.LIMIT);
        res.status(constants.http.OK)
            .json(result);
    })
);

/**
 * create cashflow
 */
router.post(
  '/',
  validationMiddleware(createCashFlowValidations), 
  asyncHandler(async (req, res) => {
    const {description, cashFlowType, value, datetime} = req.body;
    const result = (await db('cashflow')
                            .insert({
                                description, 
                                cashFlowType, 
                                value, 
                                datetime,
                                users_id: req.loggedUser.id
                            }, '*'))[0];
    res.status(constants.http.CREATED).json(result);
  })
);

/**
 * Edit cashflow
 */
router.put(
    '/:id',
    validationMiddleware(updateCashFlowValidations),
    asyncHandler(async (req, res) => {
        const {description, cashFlowType, value, datetime} = req.body;
        const { id } = req.params;
        const result = (await db('cashflow')
                                .where({ 
                                    users_id: req.loggedUser.id, 
                                    id 
                                }).update({description, cashFlowType, value, datetime}, '*'))[0];
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    })
);

/**
 * Delete cashflow
 */
router.delete(
    '/:id',
    validationMiddleware([
        param('id').toInt(),
    ]),
    asyncHandler(async (req, res) => {
        const {id} = req.params;
        const result = (await db('cashflow')
                            .where({ 
                                users_id: req.loggedUser.id, 
                                id 
                            }).del('*'))[0];
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    })
);

module.exports = router;
