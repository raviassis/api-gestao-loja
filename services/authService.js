const jwt = require('jsonwebtoken');
const User = require('../models/user');
const db = require('../data/index');
const constants = require('../util/constants');
const DomainException = require('../util/exceptions/domainException');
const userRepository = require('../data/userRepository');
const crypto = require('crypto');
const emailConfirmationService = require('./emailConfirmationService');
const mailSerice = require('./mailService');

function authenticatedUser({id, name, email}) {
    return {id, name, email};
}

function getUserAndResetPasswordRequestsByResetToken(reset_token) {
    return db('reset_password_requests')
            .innerJoin('users', 'reset_password_requests.users_id', 'users.id')
            .where({reset_token})
            .first('*')
            .then(res => res ? new User(res) : res);
}

async function saveUserAndDeleteResetPasswordRequest(user, trx) {
        await trx('users').where({id: user.id}).update(user);
        await trx('reset_password_requests').where({users_id: user.id}).del();
}

const authService = {
    async authenticate({email, password}) {
        const user = await db('users')
                            .where({email})
                            .first('*')
                            .then(res => res ? new User(res): res);
        if (user && user.validPassword(password)) {
            const email_confirmation = await db('email_confirmation')
                                                .where({
                                                    users_id: user.id
                                                })
                                                .whereNotNull('confirmation_date')
                                                .first('*');
            if (!email_confirmation) 
                throw new DomainException('A conta ainda não foi confirmada', constants.http.UNAUTHORIZED);
            const token = jwt.sign(
                authenticatedUser(user), 
                process.env.APP_SECRET, 
                {
                    expiresIn: constants.JWT_VALID_TIME_SECONDS
                }
            );
            return {token}
        } else {
            throw new DomainException('Credenciais inválidas', constants.http.UNAUTHORIZED);
        }
    },
    async changePassword({id, password, newPassword}) {
        const user = await userRepository.getUserById(id);
        if (!(user && user.validPassword(password))) 
            throw new DomainException('Invalid credentials', constants.http.BAD_REQUEST);
        if (user.validPassword(newPassword))
            throw new DomainException('password not be the same', constants.http.BAD_REQUEST);
        user.setPassword(newPassword);
        await db('users').where({id}).update(user);
    },
    async requestResetPassword({ email }) {
        const user = await db('users').where({ email }).first('*');
        if (!user) return;
        const reset_password_request = {
            users_id: user.id,
            reset_token: crypto.randomBytes(16).toString('hex')
        };
        await mailSerice.sendEmail({
            to: email, 
            subject: 'Reset de senha',
            text: `
                Olá ${user.name}.
                Recebemos uma solicitação para redefinir sua senha.
                Clique no link abaixo para configurar sua nova senha.
                ${process.env.APP_FRONTEND_URL}/reset_password/${reset_password_request.reset_token}                    
            `
        });
        await db('reset_password_requests')
                .insert(reset_password_request);
    },
    async resetPassword({reset_token, newPassword}) {
        const userResetPassword = await getUserAndResetPasswordRequestsByResetToken(reset_token);
        if (!userResetPassword)
            throw new DomainException('request not found', constants.http.NOT_FOUND);
        userResetPassword.setPassword(newPassword);
        await db.transaction(saveUserAndDeleteResetPasswordRequest.bind(null, userResetPassword));
    },
    async confirmEmail(confirmation_token) {
        const email_confirmation = await db('email_confirmation')
                                            .where({
                                                confirmation_token
                                            })
                                            .first('*');
        if(!email_confirmation)
            throw new DomainException('Email not found', constants.http.NOT_FOUND);
        if (email_confirmation.confirmation_date) return;
        email_confirmation.confirmation_date = new Date();
        await db('email_confirmation')
                .where({users_id: email_confirmation.users_id, confirmation_token})
                .update(email_confirmation);
    },
    async resendEmail(email) {
        const email_confirmation = db('users')
                                    .innerJoin('email_confirmation', 'users.id', 'email_confirmation.users_id')
                                    .where({email})
                                    .first('*');
        if (!email_confirmation)
            throw new DomainException('Email não encontrado', constants.http.NOT_FOUND);
        const {name, confirmation_token} = email_confirmation;
        await emailConfirmationService.send({email, name, confirmation_token});
    }
};

module.exports=authService;