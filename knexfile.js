// Update with your config settings.

module.exports = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: './dbtest.sqlite'
    }
  },
  development: {
    client: process.env.DB_CLIENT,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { 
            rejectUnauthorized: false 
        }
    }
  },
  staging: {
    client: process.env.DB_CLIENT,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { 
            rejectUnauthorized: false 
        },
        migrations: {
          tableName: 'knex_migrations'
        }
    }
  },
  production: {
    client: process.env.DB_CLIENT,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { 
            rejectUnauthorized: false 
        },
        migrations: {
          tableName: 'knex_migrations'
        }
    }
  }

};
