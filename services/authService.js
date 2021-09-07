const jwt = require('jsonwebtoken');
const User = require('../models/user');
const db = require('../data/index');
const constants = require('../util/constants');
const DomainException = require('../util/exceptions/domainException');
const userRepository = require('../data/userRepository');
const crypto = require('crypto');

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
            const token = jwt.sign(
                authenticatedUser(user), 
                process.env.APP_SECRET, 
                {
                    expiresIn: constants.JWT_VALID_TIME_SECONDS
                }
            );
            return {token}
        } else {
            throw new DomainException('Invalid credentials', constants.http.UNAUTHORIZED);
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
    async generateResetPasswordToken({ email }) {
        const user = await db('users').where({ email }).first('*');
        if (!user) return {};
        const resetPasswordRequest = await db('reset_password_requests')
                                        .insert({
                                            users_id: user.id,
                                            reset_token: crypto.randomBytes(16).toString('hex')
                                        }, 'reset_token')
                                        .then(res => { return { reset_token: res[0] }; });
                                        
        return resetPasswordRequest;
    },
    async resetPassword({reset_token, newPassword}) {
        const userResetPassword = await getUserAndResetPasswordRequestsByResetToken(reset_token);
        if (!userResetPassword)
            throw new DomainException('request not found', constants.http.NOT_FOUND);
        userResetPassword.setPassword(newPassword);
        await db.transaction(saveUserAndDeleteResetPasswordRequest.bind(null, userResetPassword));
    }
};

module.exports=authService;