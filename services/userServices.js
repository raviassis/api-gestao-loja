const db = require('../data/index'); 
const DomainException = require('../util/exceptions/domainException');
const User = require('../models/user');
const userRepository = require('../data/userRepository');

class ConfigVM {
    constructor({users_id, typeRegisterDescription}){
        this.users_id = users_id;
        this.typeRegisterDescription = typeRegisterDescription;
    }
}

class UserVM {
    constructor({id, name, email, balance, config}) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.balance = balance;
        this.config = config;
    }
}

const userService = {
    getUserByIdWithUserConfig(id, trx) {
        const d = trx || db;
        return d('users')
                .leftJoin(
                    'users_configs', 
                    'users.id', 
                    'users_configs.users_id'
                )
                .where({id})
                .select('*')
                .then(res => {
                    const data = res[0];
                    data.config = new ConfigVM(data);
                    return new UserVM(data);
                });
    },
    getUserById(id) {
        return db('users').where({id}).first('*').then(res => res ? new User(res): res);
    },
    async _validEmailAlreadyExists(email) {
        const existEmail = await db('users').where({email}).first('email');
        if (existEmail) throw new DomainException('email is already in use');
    },
    async register({name, email, password}) {
        await this._validEmailAlreadyExists(email);
        const user = new User({name, email, password});
        return db.transaction(async (trx) => {
            const ids = await trx('users').insert(user, 'id');
            await trx('users_configs').insert({users_id: ids[0]});
            return await this.getUserByIdWithUserConfig(ids[0], trx);
        });
    },
    async update({id, name}) {
        const user = await userRepository.getUserById(id);
        user.name = name;
        return db('users').where({id}).update(user, '*').then(res => new UserVM(res[0]));
    },
};

module.exports = userService;