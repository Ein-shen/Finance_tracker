const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",         // your PostgreSQL username
  password: "yourpassword", // your PostgreSQL password
  host: "localhost",
  port: 5432,
  database: "finance_tracker" // the database name you created
});

module.exports = pool;