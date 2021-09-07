
const tablename = 'reset_password_requests'
exports.up = function(knex) {
    return knex.schema.createTable(tablename, function(table) {
        table.integer('users_id').unsigned();
        table.foreign('users_id').references('users.id');
        table.string('reset_token');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable(tablename);
};
