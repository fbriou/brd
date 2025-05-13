import { RDS } from 'aws-sdk';
import { SSM } from 'aws-sdk';

const rds = new RDS();
const ssm = new SSM();

export const handler = async () => {
  try {
    const dbInstance = await ssm.getParameter({ Name: '/brd/db-instance' }).promise();
    
    const snapshot = await rds.createDBSnapshot({
      DBInstanceIdentifier: dbInstance.Parameter?.Value!,
      DBSnapshotIdentifier: `backup-${Date.now()}`
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Backup created successfully',
        snapshotId: snapshot.DBSnapshot?.DBSnapshotIdentifier
      })
    };
  } catch (error) {
    console.error('Backup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Backup failed' })
    };
  }
}; 