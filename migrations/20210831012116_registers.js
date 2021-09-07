const tablename = 'registers'
exports.up = async function(knex) {
    await knex.schema.createTable(tablename, function(table) {
        table.string('code', 10).primary();
        table.string('name').notNullable();
        table.integer('users_id').unsigned();
        table.foreign('users_id').references('users.id');
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
    return knex.schema.dropTable(tablename);
};
