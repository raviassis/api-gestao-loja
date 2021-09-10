const BaseEnum = require('./BaseEnum');
module.exports = class TypeRegisterDescriptionEnum extends BaseEnum {
    static FREE_DESCRIPTIONS = new TypeRegisterDescriptionEnum(1, 'FREE_DESCRIPTIONS');
    static DEFINED_DESCRIPTIONS = new TypeRegisterDescriptionEnum(2, 'DEFINED_DESCRIPTIONS');

    static getById(id) {
        return TypeRegisterDescriptionEnum.list().find(e => e.id === id);
    }

    static list() {
        return [
            TypeRegisterDescriptionEnum.FREE_DESCRIPTIONS,
            TypeRegisterDescriptionEnum.DEFINED_DESCRIPTIONS
        ];
    }
};