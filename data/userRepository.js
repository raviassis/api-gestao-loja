const db = require('./index'); 
const User = require('../models/user');

const tablename = 'users';
const userRepository = {
    getUserById(id) {
        return db(tablename).where({id}).first('*').then(res => res ? new User(res): res);
    },
};

module.exports = userRepository;