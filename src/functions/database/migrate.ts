import { createPool } from 'slonik';
import { migrate } from 'node-pg-migrate';
import { SSM } from 'aws-sdk';

const ssm = new SSM();

export const handler = async (event: any) => {
  try {
    // Get database credentials from SSM
    const [host, name, user, password] = await Promise.all([
      ssm.getParameter({ Name: '/brd/db-host' }).promise(),
      ssm.getParameter({ Name: '/brd/db-name' }).promise(),
      ssm.getParameter({ Name: '/brd/db-user' }).promise(),
      ssm.getParameter({ Name: '/brd/db-password', WithDecryption: true }).promise(),
    ]);

    const databaseUrl = `postgres://${user.Parameter?.Value}:${password.Parameter?.Value}@${host.Parameter?.Value}:5432/${name.Parameter?.Value}`;

    // Run migrations
    await migrate({
      databaseUrl,
      dir: 'migrations',
      direction: event.direction || 'up',
      migrationsTable: 'pgmigrations',
      verbose: true,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Migration completed successfully' })
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Migration failed' })
    };
  }
}; 