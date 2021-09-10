const db = require('./index'); 
const User = require('../models/user');
const UserConfig = require('../models/UserConfig');

const tablename = 'users';
const userRepository = {
    getUserById(id) {
        return db(tablename).where({id}).first('*').then(res => res ? new User(res): res);
    },
    getUserConfig(userId) {
        return db('users_configs')
                .where({ users_id: userId })
                .first('*').then(res => new UserConfig(res));
    }
};

module.exports = userRepository;