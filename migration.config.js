require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  dir: 'migrations',
  direction: 'up',
  migrationsTable: 'pgmigrations',
  verbose: true,
}; 