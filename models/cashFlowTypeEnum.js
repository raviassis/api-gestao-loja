module.exports = class CashFlowTypeEnum {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
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