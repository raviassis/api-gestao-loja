const db = require('../data/index');

const registerService = {
    createRegister(loggedUser, register) {
        const {code, name} = register;
        const { id } = loggedUser;
        return db('registers')
                .insert({ code, name, users_id: id }, '*')
                .then(res => res[0]);
    },
    listRegisters({users_id, q, limit, offset}) {
        return db('registers')
          .where({users_id})
          .whereRaw(`UPPER(CONCAT(code, ' ', name)) like '%${ q.toUpperCase() }%'`)
          .orderBy([{ column: 'code' }, { column: 'name' }])
          .limit(limit)
          .offset(offset);
    },
    deleteRegister({users_id, code}) {
        return db('registers').where({users_id, code}).del();
    }
};

module.exports = registerService;