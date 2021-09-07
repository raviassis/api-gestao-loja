const tablename = 'users';
exports.up = async function(knex) {
  await knex.schema.createTable(tablename, function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable();
      table.unique('email');
      table.string('hash').notNullable();
      table.string('salt').notNullable();
      table.decimal('balance').notNullable().defaultTo(0);
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
