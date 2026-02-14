require('dotenv').config()

const supabaseSSL = {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}

const prodConnectionVar = process.env.SUPABASE_DB_URL
  ? 'SUPABASE_DB_URL'
  : (process.env.DATABASE_URL ? 'DATABASE_URL' : null)

if (process.env.NODE_ENV === 'production' && !prodConnectionVar) {
  throw new Error('Missing SUPABASE_DB_URL (or DATABASE_URL) for production database connection.')
}

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME_DEV,
    "password": process.env.DB_PASSWORD_DEV,
    "database": process.env.DB_DATABASE_DEV,
    "host": process.env.DB_HOST_DEV,
    "port": process.env.DB_PORT_DEV,
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "use_env_variable": prodConnectionVar,
    "dialect": "postgres",
    "dialectOptions": supabaseSSL
  }
}
