const TypeRegisterDescriptionEnum = require('./TypeRegisterDescriptionEnum');
class UserConfig {
    constructor({users_id, typeRegisterDescription, created_at, updated_at}) {
        this.users_id = users_id;
        this.typeRegisterDescription = TypeRegisterDescriptionEnum.getById(typeRegisterDescription);
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = UserConfig;