const db = require('./index');
const CashFlowTypeEnum = require('../models/cashFlowTypeEnum');

function mapRecurrent(recurrent) {
    if (recurrent)
        recurrent.cashFlowType = CashFlowTypeEnum.getById(recurrent.cashFlowType); 
    return recurrent;
}

function filter({where, limit, offset} = {}) {
    const query = db(tablename);
    if (where)
        query.where(where);
    if (limit)
        query.limit(limit);
    if (offset)
        query.offset(offset)
    return query
}

const tablename = 'recurrents';
const recurrentRepository = {
    count({where}) {
        return filter({where})
                .count('*')
                .then(res => res[0].count)
    },
    list({where, limit, offset} = {}) {
        return filter({where, limit, offset})
                .then(result => result.map(mapRecurrent));
    },
    create({users_id, description, cashFlowType, value, day}) {
        return db(tablename)
                .insert({users_id, description, cashFlowType, value, day}, '*')
                .then(data => mapRecurrent(data[0]));
    },
    delete({id, users_id}) {
        return db(tablename)
                .where({ id, users_id })
                .del('*')
                .then(data => mapRecurrent(data[0]));
    }
};

module.exports = recurrentRepository;