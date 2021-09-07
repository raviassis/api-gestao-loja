const db = require('../data/index'); 
const DomainException = require('../util/exceptions/domainException');
const User = require('../models/user');

const registerService = {
    createRegister(loggedUser, register) {
        const {code, name} = register;
        const { id } = loggedUser;
        return db('registers')
                .insert({ code, name, users_id: id }, '*')
                .then(res => res[0]);
    }
};

module.exports = registerService;