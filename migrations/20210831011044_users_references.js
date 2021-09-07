
exports.up = async function(knex) {
    await knex.schema.table('cashflow', function(table) {
        table.integer('users_id').unsigned();
        table.foreign('users_id').references('users.id');
    });

    await knex.schema.table('recurrents', function(table) {
        table.integer('users_id').unsigned();
        table.foreign('users_id').references('users.id');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('cashflow', function(table) {
        table.dropColumn('users_id');
    });
    await knex.schema.table('recurrents', function(table) {
        table.dropColumn('users_id');
    });
};
