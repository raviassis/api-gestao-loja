const db = require('./index');
const CashFlowTypeEnum = require('../models/cashFlowTypeEnum');
function mapRecurrent(recurrent) {
    if (recurrent)
        recurrent.cashFlowType = CashFlowTypeEnum.getById(recurrent.cashFlowType); 
    return recurrent;
}
const tablename = 'recurrents';
const recurrentRepository = {
    count() {
        return db(tablename)
                .count('*')
                .then(res => res[0].count)
    },
    list({where, limit, offset} = {}) {
        const query = db(tablename);
        if (where)
            query.where(where);
        if (limit)
            query.limit(limit);
        if (offset)
            query.offset(offset)
        return query
                .then(result => result.map(mapRecurrent));
    },
    create({description, cashFlowType, value, day}) {
        return db(tablename)
                .insert({description, cashFlowType, value, day}, '*')
                .then(data => mapRecurrent(data[0]));
    },
    delete(id) {
        return db(tablename)
                .where({ id })
                .del('*')
                .then(data => mapRecurrent(data[0]));
    }
};

module.exports = recurrentRepository;