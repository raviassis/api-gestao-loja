const env = process.env.NODE_ENV || 'development';
const pg = require('pg');
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
const db = require('knex')(require('../knexfile')[env]);

module.exports = db;