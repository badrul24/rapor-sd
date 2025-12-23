require("dotenv").config()

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sistem_manajemen_rapor",
    },
    migrations: {
      directory: "./migrations",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "./migrations",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
}
