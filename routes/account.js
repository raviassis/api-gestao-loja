const asyncHandler = require('express-async-handler')
const router = require('express').Router();
const { body } = require('express-validator');
const constants = require('../util/constants');
const userService = require('../services/userServices');
const validationMiddleware = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const authService = require('../services/authService');
const db = require('../data/index');
const UserConfig = require('../models/UserConfig');
const userRepository = require('../data/userRepository');

router.use(authMiddleware);

router.get(
    '/me', 
    asyncHandler(async (req, res) => {
        const { id, name, email, balance } = await userService.getUserById(req.loggedUser.id);
        res.status(constants.http.OK).json({ id, name, email, balance });
    })
);

router.get(
    '/me/config', 
    asyncHandler(async (req, res) => {
        res.status(constants.http.OK)
            .json(
                await userRepository.getUserConfig(req.loggedUser.id)
            );
    })
);

router.put(
    '/update',
    validationMiddleware([
        body('name').notEmpty().withMessage('not be empty')
    ]),
    asyncHandler(async (req, res) => {
        const {name} = req.body;
        const { id } = req.loggedUser;
        const user = await userService.update({id, name});
        res.status(constants.http.OK).json(user);
    })
);

router.put(
    '/change_password',
    validationMiddleware([
        body('password').notEmpty().withMessage('not be empty'),
        body('newPassword').isStrongPassword().withMessage('password is not strong enough')
    ]),
    asyncHandler(async (req, res) => {
        const {password, newPassword} = req.body;
        const { id } = req.loggedUser;
        await authService.changePassword({id, password, newPassword});
        res.sendStatus(constants.http.OK);
    })
);

module.exports = router;