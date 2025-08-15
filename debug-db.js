require('dotenv').config();

console.log('=== Database Connection Debug ===');
console.log('SUPABASE_DATABASE_URL:', process.env.SUPABASE_DATABASE_URL ? 'SET' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? `[${process.env.DB_PASSWORD.length} chars]` : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);

// Test if we can parse the connection string
if (process.env.SUPABASE_DATABASE_URL) {
  try {
    const url = new URL(process.env.SUPABASE_DATABASE_URL);
    console.log('\n=== Parsed Connection String ===');
    console.log('Protocol:', url.protocol);
    console.log('Host:', url.hostname);
    console.log('Port:', url.port);
    console.log('Username:', url.username);
    console.log('Password:', url.password ? `[${url.password.length} chars]` : 'NOT SET');
    console.log('Database:', url.pathname.substring(1));
  } catch (error) {
    console.log('Error parsing connection string:', error.message);
  }
}

// Test individual connection parameters
console.log('\n=== Individual Parameters ===');
const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log('Config object:', JSON.stringify(config, null, 2));