const db = require('./index');
const CashFlowTypeEnum = require('../models/cashFlowTypeEnum');

function mapCashFlow(cashFlowArray) {
    return cashFlowArray.map(c => {
        c.cashFlowType = CashFlowTypeEnum.getById(c.cashFlowType); 
        return c;
    });
}

const cashFlowRepository = {
    filteredCashFlow({begin, end, cashFlowType, users_id}) {
        const query = db('cashflow').where({users_id});
        if (begin && end)    
            query.whereBetween('datetime', [begin, end]);
        else if (begin)
            query.where('datetime', '>=', begin);
        else if (end)
            query.where('datetime', '<=', end);
    
        if (typeof cashFlowType === 'number')
            query.where({cashFlowType})
    
        return query;
    },
    consolidatedReport({begin, end, users_id}) {
        return this.filteredCashFlow({begin, end, users_id})
                .groupBy('description', 'cashFlowType')
                .select('description', 'cashFlowType', db.raw('SUM(value)'))
                .then(mapCashFlow);
    },
    createMany(cashFlowArray) {
        if(cashFlowArray && Array.isArray(cashFlowArray) && cashFlowArray.length > 0)
            return db('cashflow').insert(cashFlowArray, '*').then(mapCashFlow);
        else return new Promise((resolve) => resolve([]));
    }
};

module.exports = cashFlowRepository;