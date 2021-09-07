class DomainException extends Error {
    constructor(message, httpErrorCode){
        super(message);
        this.name = 'DomainException';
        this.httpErrorCode = httpErrorCode || 400;
    }
}

module.exports = DomainException;