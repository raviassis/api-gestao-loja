const tablename = 'users_configs';
exports.up = async function(knex) {
  await knex.schema.createTable(tablename, function(table) {
    table.integer('users_id').primary();
    table.foreign('users_id').references('users.id');
    table.integer('typeRegisterDescription').unsigned().notNullable().defaultTo(1);
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
