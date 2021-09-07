const jwt = require('jsonwebtoken');
const constants = require('../util/constants');
const DomainException = require('../util/exceptions/domainException');

module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.APP_SECRET);
        req.loggedUser = decoded;
        next();
    } catch {
        throw new DomainException('Invalid token', constants.http.UNAUTHORIZED);
    }
};