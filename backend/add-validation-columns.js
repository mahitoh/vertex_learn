#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addValidationColumns() {
  console.log('🚀 Adding validation columns to users table...');
  
  try {
    // Parse DATABASE_URL from .env
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL="mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^"]+)"/);
    
    if (!dbUrlMatch) {
      throw new Error('Invalid DATABASE_URL format in .env file');
    }
    
    const [, user, password, host, port, database] = dbUrlMatch;
    
    console.log(`📊 Connecting to MySQL at ${host}:${port}...`);
    
    // Create connection
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
    });
    
    // Add validation columns
    console.log('📝 Adding validation_status column...');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN validation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
    `);
    
    console.log('📝 Adding validated_by column...');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN validated_by INT NULL
    `);
    
    console.log('📝 Adding validated_at column...');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN validated_at TIMESTAMP NULL
    `);
    
    console.log('📝 Adding foreign key constraint...');
    await connection.query(`
      ALTER TABLE users 
      ADD FOREIGN KEY (validated_by) REFERENCES users(id)
    `);
    
    console.log('📝 Updating admin user to approved status...');
    await connection.query(`
      UPDATE users 
      SET validation_status = 'approved' 
      WHERE email = 'admin@vertexlearn.com'
    `);
    
    await connection.end();
    
    console.log('🎉 Validation columns added successfully!');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ Columns already exist, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the migration
addValidationColumns();