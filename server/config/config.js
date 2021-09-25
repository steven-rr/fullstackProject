require('dotenv').config()

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
    "username": process.env.DB_USERNAME_PRODUCTION,
    "password": process.env.DB_PASSWORD_PRODUCTION,
    "database": process.env.DB_DATABASE_PRODUCTION,
    "host": process.env.DB_HOST_PRODUCTION,
    "dialect": "mysql"
  }
}
