const BaseEnum = require('./BaseEnum');
module.exports = class CashFlowTypeEnum extends BaseEnum {
    static INCOMING = new CashFlowTypeEnum(1, 'Incoming');
    static OUTGOING = new CashFlowTypeEnum(2, 'Outgoing');

    static getById(id) {
        switch(id) {
            case CashFlowTypeEnum.INCOMING.id:
                return CashFlowTypeEnum.INCOMING;
            case CashFlowTypeEnum.OUTGOING.id:
                return CashFlowTypeEnum.OUTGOING;
        }
    }

    static list() {
        return [
            CashFlowTypeEnum.INCOMING,
            CashFlowTypeEnum.OUTGOING
        ];
    }
};