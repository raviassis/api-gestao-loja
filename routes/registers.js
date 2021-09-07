const router = require('express').Router();
const db = require('../data');
const { body } = require('express-validator');
const validationMiddleware = require('../middlewares/validationMiddleware');
const registerService = require('../services/registerService'); 
const constants = require('../util/constants');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('express-async-handler')

router.use(authMiddleware);

router.get(
    '/', 
    asyncHandler(async (req, res) => {
        const {id} = req.loggedUser;
        let { q, limit, offset } = req.query;
        q = q || '';
        limit = limit || 10;
        offset = offset || 0;
        const registers = await db('registers')
                                .where({users_id: id})
                                .whereRaw(`UPPER(CONCAT(code, ' ', name)) like '%${ q.toUpperCase() }%'`)
                                .limit(limit)
                                .offset(offset);
        res.status(constants.http.OK).json({
          q,
          limit,
          offset,
          data: registers
        });
    })
);

// router.post(
//   '/', 
//   validationMiddleware([
//     body('code').notEmpty(),
//     body('name').notEmpty()
//   ]), 
//   async (req, res) => {
//     const {code, name} = req.body;
//     const result = await registerService
//                             .createRegister(req.loggedUser, {code, name});
//     res.status(constants.http.CREATED).json(result);
//   }
// );

module.exports = router;
