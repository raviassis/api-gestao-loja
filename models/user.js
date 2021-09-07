const crypto = require('crypto'); 

class User {
    constructor({id, name, email, balance, salt, hash, password}){
        this.id = id;
        this.name = name;
        this.email = email;
        this.balance = balance || 0;
        if ( password ) 
            this.setPassword(password);
        else {
            this.salt = salt;
            this.hash = hash;
        }
    }

    setPassword(password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = this.hashPassword(this.salt, password);
    }

    hashPassword(salt, password) {
        return crypto.pbkdf2Sync(
            password,
            salt,
            1000,
            64,
            `sha512`
        ).toString(`hex`);
    }

    validPassword(password) {
        return this.hash && 
                this.salt && 
                password && 
                this.hash === this.hashPassword(this.salt, password);
    }
}

module.exports = User;