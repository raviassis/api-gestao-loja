const tablename = 'cashflow';
exports.up = function(knex) {
    return knex
            .schema
            .createTable(tablename, function (table) {
                table.increments('id');
                table.text('description').notNullable();
                table.decimal('value').notNullable();
                table.integer('cashFlowType').unsigned().notNullable();
                table.datetime('datetime').notNullable();
                table.timestamps(false, true);
            });
};

exports.down = function(knex) {
    return knex
            .schema
            .dropTable(tablename);
};
