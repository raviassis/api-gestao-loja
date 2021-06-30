const tablename = 'cashflow';
exports.up = async function(knex) {
    await knex.schema.createTable(tablename, function (table) {
        table.increments('id').primary();
        table.text('description').notNullable();
        table.decimal('value').notNullable();
        table.integer('cashFlowType').unsigned().notNullable();
        table.datetime('datetime').notNullable();
        table.timestamps(false, true);
    });
    await knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tablename}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
    `);
};

exports.down = function(knex) {
    return knex
            .schema
            .dropTable(tablename);
};
