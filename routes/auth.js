const asyncHandler = require('express-async-handler')
const router = require('express').Router();
const { body, param } = require('express-validator');
const constants = require('../util/constants');
const userService = require('../services/userServices');
const validationMiddleware = require('../middlewares/validationMiddleware');
const authService = require('../services/authService');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', 
    validationMiddleware([
        body('email').isEmail().withMessage('should be a email'),
        body('name').notEmpty().withMessage('not be empty'),
        body('password').isStrongPassword().withMessage('password is not strong enough')
    ]),
    asyncHandler(async (req, res) => {
        const {name, email, password} = req.body;
        const user = await userService.register({name, email, password});
        res.status(constants.http.CREATED).json(user);
    })
);

router.post('/resend_email_confirmation',
    validationMiddleware([
        body('email').isEmail().withMessage('should be a email'),
    ]),
    asyncHandler(async (req, res) => {
        const { email } = req.body;
        await authService.resendEmail(email);
        res.sendStatus(constants.http.OK);
    })
);

router.post('/email_confirmation/:confirmation_token',
    validationMiddleware([
        param('confirmation_token').notEmpty().withMessage('not be empty'),
    ]),
    asyncHandler(async (req, res) => {
        const { confirmation_token } = req.params;
        await authService.confirmEmail(confirmation_token);
        res.sendStatus(constants.http.OK);
    })
);

router.post('/login',
    validationMiddleware([
        body('email').isEmail().withMessage('should be a email'),
        body('password').isStrongPassword().withMessage('password is not strong enough')
    ]),
    asyncHandler(async (req, res) => {
        const {email, password} = req.body;
        const dataToken = await authService.authenticate({email, password});
        res.status(constants.http.OK).json(dataToken);
    })
);

router.post('/request_reset_password',
    validationMiddleware([
        body('email').isEmail().withMessage('should be a email'),
    ]),
    asyncHandler(async (req, res) => {
        const {email} = req.body;
        await authService.requestResetPassword({email});
        res.sendStatus(constants.http.OK);
    })
);

router.post('/reset_password/:reset_token',
    validationMiddleware([
        param('reset_token').notEmpty().withMessage('not be empty'),
        body('newPassword')
            .notEmpty().withMessage('not be empty')
            .isStrongPassword().withMessage('password is not strong enough')
    ]),
    asyncHandler(async (req, res) => {
        const { newPassword } = req.body;
        const { reset_token } = req.params;
        await authService.resetPassword({reset_token, newPassword});
        res.sendStatus(constants.http.OK);
    })
);

router.get('/verify_token', authMiddleware, (req, res) => {
    res.status(constants.http.OK).json(req.loggedUser);
});

module.exports = router;