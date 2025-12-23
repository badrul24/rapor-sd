const knex = require("knex")
require("dotenv").config()

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sistem_manajemen_rapor",
  },
  pool: {
    min: 2,
    max: 10,
  },
})

module.exports = db
