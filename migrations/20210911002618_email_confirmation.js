const tablename = 'email_confirmation';
exports.up = async function(knex) {
    await knex.schema.createTable(tablename, (table) => {
        table.integer('users_id').primary();
        table.foreign('users_id').references('users.id');
        table.datetime('send_date');
        table.datetime('confirmation_date');
        table.string('confirmation_token');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable(tablename);
};
