import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateAdminPassword() {
  try {
    // Parse DATABASE_URL
    const url = process.env.DATABASE_URL.replace(/"/g, ''); // Remove quotes
    console.log('DATABASE_URL:', url);
    const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)(?:\?|$)/;
    const match = url.match(regex);
    console.log('Match:', match);
    
    if (!match) throw new Error('Invalid DATABASE_URL format');
    
    const connection = await mysql.createConnection({
      host: match[3],
      user: match[1],
      password: match[2],
      database: match[5],
      port: parseInt(match[4])
    });
    
    const newPasswordHash = '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO';
    
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ?', 
      [newPasswordHash, 'admin@vertexlearn.com']
    );
    
    console.log('✅ Admin password updated successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
  }
}

updateAdminPassword();