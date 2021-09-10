const router = require('express').Router();
const db = require('../data');
const { body, param } = require('express-validator');
const validationMiddleware = require('../middlewares/validationMiddleware');
const registerService = require('../services/registerService'); 
const constants = require('../util/constants');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('express-async-handler');
const userRepository = require('../data/userRepository');
const TypeRegisterDescriptionEnum = require('../models/TypeRegisterDescriptionEnum');
const DomainException = require('../util/exceptions/domainException');

router.use(authMiddleware);

/**
 * TypeRegisterDescriptionFeatureMiddle
 */
router.use(asyncHandler(async (req, res, next) => {
  const userConfig = await userRepository.getUserConfig(req.loggedUser.id);
  if (userConfig.typeRegisterDescription.id === TypeRegisterDescriptionEnum.DEFINED_DESCRIPTIONS.id )
    next();
  else 
    throw new DomainException("Feature DEFINED_DESCRIPTIONS is disabled!");
}));

router.get(
    '/', 
    asyncHandler(async (req, res) => {
        const {id} = req.loggedUser;
        let { q, limit, offset } = req.query;
        q = q || '';
        limit = limit || 10;
        offset = offset || 0;
        const registers = await registerService.listRegisters({users_id: id, q, limit, offset});
        
        res.status(constants.http.OK).json({
          q,
          limit,
          offset,
          data: registers
        });
    })
);

router.post(
  '/', 
  validationMiddleware([
    body('code')
      .notEmpty().withMessage('not be empty')
      .isLength({max: 10}).withMessage('should be less than 10 caracters'),
    body('name')
      .notEmpty().withMessage('not be empty')
  ]), 
  asyncHandler(async (req, res) => {
    res.status(constants.http.CREATED)
        .json(
          await registerService
                  .createRegister(req.loggedUser, req.body)
        );
  })
);

router.delete(
  '/:code', 
  validationMiddleware([
    param('code')
      .notEmpty().withMessage('not be empty')
      .isLength({max: 10}).withMessage('should be less than 10 caracters')
  ]), 
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    await registerService
                  .deleteRegister({ users_id: req.loggedUser.id, code})
    res.status(constants.http.OK);
  })
);

module.exports = router;
