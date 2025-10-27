const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    trustServerCertificate: true,
    trustedConnection: false
  }
};

let pool;

module.exports.connect = async () => {
  try {
    if (!pool) {
      console.log("Đang kết nối tới SQL Server...");
      pool = await sql.connect(config);
      console.log("Connected to SQL Server!");
    } else {
      console.log("Đã sẵn sàng kết nối SQL Server (tái sử dụng pool).\n");
    }
    return pool;
  } catch (err) {
    console.error("Database connection failed!", err.message || err);
    throw err;
  }
};