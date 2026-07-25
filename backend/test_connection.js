const sql = require('mssql');

async function test() {
  try {
    const pool = await sql.connect({
      server: '127.0.0.1',
      port: 1433,
      database: 'RepairAccountant',
      user: 'repairadmin',
      password: 'Repair@2026',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 10000,
    });
    const result = await pool.request().query('SELECT @@SERVERNAME as name, DB_NAME() as db');
    console.log('Connected! Server:', result.recordset[0].name, '| Database:', result.recordset[0].db);
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

test();
