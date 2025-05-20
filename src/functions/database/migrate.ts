import migrate from 'node-pg-migrate';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient();

export const handler = async (event: any) => {
  try {
    const stage = process.env.STAGE || 'dev';
    // Get database credentials from SSM
    const [host, name, user, password] = await Promise.all([
      ssmClient.send(new GetParameterCommand({ Name: `/brd/${stage}/db-host` })),
      ssmClient.send(new GetParameterCommand({ Name: `/brd/${stage}/db-name` })),
      ssmClient.send(new GetParameterCommand({ Name: `/brd/${stage}/db-user` })),
      ssmClient.send(new GetParameterCommand({ Name: `/brd/${stage}/db-password`, WithDecryption: true })),
    ]);

    // Extract host without port from the endpoint
    const hostWithoutPort = host.Parameter?.Value?.split(':')[0];
    const encodedPassword = encodeURIComponent(password.Parameter?.Value || '');
    const databaseUrl = `postgres://${user.Parameter?.Value}:${encodedPassword}@${hostWithoutPort}:5432/${name.Parameter?.Value}`;

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