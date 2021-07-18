const tablename = 'recurrents';

exports.up = async function(knex) {
    await knex.schema.createTable(tablename, function (table) {
        table.increments('id').primary();
        table.text('description').notNullable();
        table.decimal('value').notNullable();
        table.integer('cashFlowType').unsigned().notNullable();
        table.integer('day').unsigned().notNullable();
        table.timestamps(false, true);
    });
    await knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tablename}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
    `);
    await knex.schema.table('cashflow', (table) => {
        table.integer(`${tablename}_id`).unsigned();
        table.foreign(`${tablename}_id`).references(`${tablename}.id`);
    });
};

exports.down = async function(knex) {
    await knex.schema.table('cashflow', (table) => {
        table.dropColumn(`${tablename}_id`);
    });
    await knex
            .schema
            .dropTable(tablename);
};
