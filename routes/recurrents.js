const asyncHandler = require('express-async-handler')
const router = require('express').Router();
const { query, body, param } = require('express-validator');
const constants = require('../util/constants');
const validationMiddleware = require('../middlewares/validationMiddleware');
const recurrentRepository = require('../data/recurrentRepository');
const CashFlowTypeEnum = require('../models/cashFlowTypeEnum');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

/**
 * List recurrents
 */
router.get('/',
    validationMiddleware([
        query('limit').toInt(),
        query('offset').toInt()
    ]),
    asyncHandler(async (req, res) => {
        let { limit, offset } = req.query;
        limit = limit || constants.LIMIT;
        offset = offset || constants.OFFSET;
        const where = { users_id: req.loggedUser.id };
        const total = await recurrentRepository.count({where});
        const data = await recurrentRepository.list({
            where,
            limit, 
            offset
        });
        res.status(constants.http.OK).json({
            limit,
            offset,
            total,
            data
        });
    })
);

const createRecurrentValidations = [
    body('description').notEmpty().trim().escape().withMessage('Not be empty'),
    body('cashFlowType')
        .isIn(CashFlowTypeEnum.list().map(c => c.id))
        .toInt()
        .withMessage(`should be in [${CashFlowTypeEnum.list().map(c => c.id).toString()}]`),
    body('value').isFloat({min: 0}).toFloat().withMessage('should be a number greater than 0.0'),
    body('day')
        .isInt({min: 1, max: 28})
        .toInt()
        .withMessage(`should be between 1 and 28`)
];

/**
 * Create recurrent
 */
router.post('/', 
    validationMiddleware(createRecurrentValidations),
    asyncHandler(async (req, res) => {
        const {description, cashFlowType, value, day} = req.body;
        const result = await recurrentRepository.create({
            users_id: req.loggedUser.id,
            description, 
            cashFlowType, 
            value, 
            day
        });
        res.status(constants.http.CREATED).json(result);
    })
);

/**
 * Delete recurrent
 */
router.delete('/:id', 
    validationMiddleware([
        param('id').toInt()
    ]),
    asyncHandler(async (req, res) => {
        const {id} = req.params;
        const result = await recurrentRepository.delete({
            id,
            users_id: req.loggedUser.id
        });
        if (result)
            res.status(constants.http.OK).json(result);
        else 
            res.sendStatus(constants.http.NOT_FOUND)
    })
);

module.exports = router;