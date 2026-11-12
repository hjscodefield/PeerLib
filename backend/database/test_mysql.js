// Standalone MySQL Connection Tester for PeerLib
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'peerlib_db';
const DB_PORT = process.env.DB_PORT || 3306;

async function checkConnection() {
  console.log('\n=========================================');
  console.log('🔍 PeerLib MySQL Connection Diagnostic');
  console.log('=========================================');
  console.log(`Connecting to: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  console.log(`USE_MYSQL in .env: ${process.env.USE_MYSQL}`);

  try {
    // 1. Check basic connection to MySQL server
    console.log('\n1. Testing ping to MySQL server...');
    const conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: Number(DB_PORT)
    });
    console.log('✅ Connection to MySQL service successful!');

    // 2. Check / Create database
    console.log(`\n2. Checking database "${DB_NAME}"...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database "${DB_NAME}" is ready.`);
    await conn.end();

    // 3. Connect directly to database and check tables
    const pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: Number(DB_PORT)
    });

    const [tables] = await pool.query('SHOW TABLES');
    console.log(`\n3. Found ${tables.length} tables in ${DB_NAME}:`);
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [countRow] = await pool.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`   - ${tableName}: ${countRow[0].count} records`);
    }

    console.log('\n🎉 SUCCESS: MySQL is fully configured and ready for PeerLib!');
    console.log('   Ensure "USE_MYSQL=true" is set in backend/.env');
    console.log('=========================================\n');
    await pool.end();
  } catch (error) {
    console.error('\n❌ Connection Failed:');
    console.error(`   Error Code: ${error.code || 'UNKNOWN'}`);
    console.error(`   Message: ${error.message}`);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Is MySQL server running? (Start via XAMPP Control Panel, MySQL Workbench, or Services).');
    console.log('   2. Verify DB_USER and DB_PASSWORD in backend/.env.');
    console.log('   3. Check default port (3306).');
    console.log('=========================================\n');
  }
}

checkConnection();
