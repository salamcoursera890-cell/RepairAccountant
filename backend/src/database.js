const { Pool } = require('pg');
const sql = require('mssql');

const DB_TYPE = process.env.DB_TYPE || 'mssql';

let pgPool = null;
let mssqlPool = null;

async function getPool() {
  if (DB_TYPE === 'pg') {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      });
    }
    return pgPool;
  }
  if (!mssqlPool) {
    mssqlPool = await sql.connect({
      server: process.env.DB_SERVER || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.DB_NAME || 'RepairAccountant',
      user: process.env.DB_USER || 'repairadmin',
      password: process.env.DB_PASS || 'Repair@2026',
      options: { encrypt: false, trustServerCertificate: true },
    });
  }
  return mssqlPool;
}

async function query(sqlText, params = {}) {
  const pool = await getPool();
  if (DB_TYPE === 'pg') {
    const paramMap = {};
    let idx = 1;
    const pgSql = sqlText.replace(/@(\w+)/g, (match, name) => {
      if (!(name in paramMap)) {
        paramMap[name] = `$${idx++}`;
      }
      return paramMap[name];
    });
    const keys = Object.keys(paramMap);
    const values = keys.map((k) => params[k]);
    const result = await pool.query(pgSql, values);
    return { rows: result.rows, recordset: result.rows, count: result.rowCount };
  }
  const request = pool.request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  const result = await request.query(sqlText);
  return { rows: result.recordset, recordset: result.recordset };
}

async function queryOne(sqlText, params = {}) {
  const result = await query(sqlText, params);
  return result.rows[0] || null;
}

async function initDatabase() {
  if (DB_TYPE === 'pg') {
    const pool = await getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_at VARCHAR(50) NOT NULL,
        updated_at VARCHAR(50) NOT NULL
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS repairs (
        id VARCHAR(50) PRIMARY KEY,
        repair_number INTEGER NOT NULL,
        customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
        customer_name VARCHAR(200) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL DEFAULT '',
        device_type VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL DEFAULT '',
        model VARCHAR(100) NOT NULL DEFAULT '',
        problem_description TEXT NOT NULL DEFAULT '',
        estimated_cost FLOAT NOT NULL DEFAULT 0,
        final_cost FLOAT NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Received',
        received_date VARCHAR(50) NOT NULL,
        delivery_date VARCHAR(50) NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_at VARCHAR(50) NOT NULL,
        updated_at VARCHAR(50) NOT NULL
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        amount FLOAT NOT NULL DEFAULT 0,
        date VARCHAR(20) NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        created_at VARCHAR(50) NOT NULL,
        updated_at VARCHAR(50) NOT NULL
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incomes (
        id VARCHAR(50) PRIMARY KEY,
        description VARCHAR(200) NOT NULL,
        amount FLOAT NOT NULL DEFAULT 0,
        date VARCHAR(20) NOT NULL,
        created_at VARCHAR(50) NOT NULL,
        updated_at VARCHAR(50) NOT NULL
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    const check = await pool.query('SELECT COUNT(*) as count FROM settings');
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query("INSERT INTO settings (key, value) VALUES ('isDarkMode', 'false')");
      await pool.query("INSERT INTO settings (key, value) VALUES ('language', 'ar')");
      await pool.query("INSERT INTO settings (key, value) VALUES ('currency', 'ل.س')");
      await pool.query("INSERT INTO settings (key, value) VALUES ('repairCounter', '0')");
    }
    console.log('PostgreSQL database initialized');
    return;
  }

  const pool = await getPool();
  await pool.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customers')
    CREATE TABLE customers (
      id NVARCHAR(50) PRIMARY KEY,
      name NVARCHAR(200) NOT NULL,
      phone NVARCHAR(50) NOT NULL DEFAULT '',
      notes NVARCHAR(MAX) NOT NULL DEFAULT '',
      created_at NVARCHAR(50) NOT NULL,
      updated_at NVARCHAR(50) NOT NULL
    )
  `);
  await pool.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'repairs')
    CREATE TABLE repairs (
      id NVARCHAR(50) PRIMARY KEY,
      repair_number INT NOT NULL,
      customer_id NVARCHAR(50) NOT NULL,
      customer_name NVARCHAR(200) NOT NULL,
      customer_phone NVARCHAR(50) NOT NULL DEFAULT '',
      device_type NVARCHAR(100) NOT NULL,
      brand NVARCHAR(100) NOT NULL DEFAULT '',
      model NVARCHAR(100) NOT NULL DEFAULT '',
      problem_description NVARCHAR(MAX) NOT NULL DEFAULT '',
      estimated_cost FLOAT NOT NULL DEFAULT 0,
      final_cost FLOAT NOT NULL DEFAULT 0,
      status NVARCHAR(50) NOT NULL DEFAULT 'Received',
      received_date NVARCHAR(50) NOT NULL,
      delivery_date NVARCHAR(50) NOT NULL DEFAULT '',
      notes NVARCHAR(MAX) NOT NULL DEFAULT '',
      created_at NVARCHAR(50) NOT NULL,
      updated_at NVARCHAR(50) NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  await pool.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'expenses')
    CREATE TABLE expenses (
      id NVARCHAR(50) PRIMARY KEY,
      title NVARCHAR(200) NOT NULL,
      amount FLOAT NOT NULL DEFAULT 0,
      date NVARCHAR(20) NOT NULL,
      notes NVARCHAR(MAX) NOT NULL DEFAULT '',
      created_at NVARCHAR(50) NOT NULL,
      updated_at NVARCHAR(50) NOT NULL
    )
  `);
  await pool.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'incomes')
    CREATE TABLE incomes (
      id NVARCHAR(50) PRIMARY KEY,
      description NVARCHAR(200) NOT NULL,
      amount FLOAT NOT NULL DEFAULT 0,
      date NVARCHAR(20) NOT NULL,
      created_at NVARCHAR(50) NOT NULL,
      updated_at NVARCHAR(50) NOT NULL
    )
  `);
  await pool.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'settings')
    CREATE TABLE settings (
      [key] NVARCHAR(100) PRIMARY KEY,
      value NVARCHAR(MAX) NOT NULL
    )
  `);
  const check = await pool.query('SELECT COUNT(*) as count FROM settings');
  if (check.recordset[0].count === 0) {
    await pool.query("INSERT INTO settings ([key], value) VALUES ('isDarkMode', 'false')");
    await pool.query("INSERT INTO settings ([key], value) VALUES ('language', 'ar')");
    await pool.query("INSERT INTO settings ([key], value) VALUES ('currency', 'ل.س')");
    await pool.query("INSERT INTO settings ([key], value) VALUES ('repairCounter', '0')");
  }
  console.log('SQL Server database initialized');
}

module.exports = { initDatabase, getPool, query, queryOne, DB_TYPE };
