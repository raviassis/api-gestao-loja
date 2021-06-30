const { validationResult } = require('express-validator');
const constants = require('../util/constants');

const valid = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(constants.http.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
};

const validationMiddleware = (arr) => {
    arr.push(valid);
    return arr;
};
module.exports = validationMiddleware;