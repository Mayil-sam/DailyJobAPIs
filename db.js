const sql = require('mssql');

const config = {
  user: 'Jay',
  password: 'Jai@kumar123',
  server: 'wiseminds.database.windows.net',
  database: 'DailyJobbbb',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function connectToDB() {
  try {
    await sql.connect(config);
    console.log('Connected to Azure SQL Database');
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}

module.exports = { connectToDB, sql, config };
