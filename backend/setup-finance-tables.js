import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse the DATABASE_URL to extract MySQL connection details
const parseDbUrl = () => {
  // Force use the MySQL URL from .env file
  const url = "mysql://root:password@localhost:3306/vertex_school_erp";
  
  console.log('Using DATABASE_URL:', url);
  
  // Extract connection details from MySQL URL format
  // Format: mysql://username:password@hostname:port/database
  const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)(?:\?|$)/;
  const match = url.match(regex);
  
  console.log('Regex match:', match);
  
  if (!match) throw new Error(`Invalid DATABASE_URL format: ${url}`);
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5].split('?')[0],
  };
};

const setupFinanceTables = async () => {
  let connection;
  
  try {
    const dbConfig = parseDbUrl();
    console.log('Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port
    });

    console.log('Connected to MySQL database successfully!');

    // Create invoices table
    console.log('Creating invoices table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          due_date DATE NOT NULL,
          status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
          description TEXT,
          payment_method VARCHAR(50),
          payment_reference VARCHAR(100),
          paid_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_student_id (student_id),
          INDEX idx_status (status),
          INDEX idx_due_date (due_date)
      )
    `);

    // Create expenses table
    console.log('Creating expenses table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          amount DECIMAL(10, 2) NOT NULL,
          category VARCHAR(50) NOT NULL,
          description TEXT,
          expense_date DATE NOT NULL,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_expense_date (expense_date),
          INDEX idx_created_by (created_by)
      )
    `);

    // Create marketing_campaigns table
    console.log('Creating marketing_campaigns table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          campaign_type VARCHAR(50) NOT NULL,
          status ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
          budget DECIMAL(10, 2) NOT NULL,
          spent_amount DECIMAL(10, 2) DEFAULT 0,
          leads_generated INT DEFAULT 0,
          conversions INT DEFAULT 0,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          description TEXT,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_campaign_type (campaign_type),
          INDEX idx_status (status),
          INDEX idx_start_date (start_date),
          INDEX idx_created_by (created_by)
      )
    `);

    console.log('Tables created successfully!');

    // Insert sample data for invoices
    console.log('Inserting sample invoice data...');
    await connection.execute(`
      INSERT IGNORE INTO invoices (id, student_id, amount, due_date, status, description) VALUES
      (1, 1, 1500.00, '2025-01-15', 'pending', 'Tuition Fee - Spring 2025'),
      (2, 2, 1500.00, '2025-01-15', 'paid', 'Tuition Fee - Spring 2025'),
      (3, 3, 750.00, '2025-01-20', 'pending', 'Lab Fee - Chemistry'),
      (4, 4, 2000.00, '2025-01-10', 'overdue', 'Tuition Fee - Spring 2025'),
      (5, 5, 500.00, '2025-01-25', 'pending', 'Library Fee')
    `);

    // Insert sample data for expenses (using admin user ID = 1)
    console.log('Inserting sample expense data...');
    try {
      await connection.execute(`
        INSERT IGNORE INTO expenses (amount, category, description, expense_date, created_by) VALUES
        (2500.00, 'Utilities', 'Monthly electricity bill', '2024-12-01', 1),
        (15000.00, 'Salaries', 'Teacher salaries - December', '2024-12-01', 1),
        (800.00, 'Office Supplies', 'Stationery and printing materials', '2024-12-05', 1),
        (1200.00, 'Maintenance', 'HVAC system maintenance', '2024-12-10', 1),
        (3000.00, 'Marketing', 'Social media advertising campaign', '2024-12-15', 1),
        (600.00, 'Technology', 'Software licenses renewal', '2024-12-20', 1)
      `);
    } catch (error) {
      console.log('Note: Could not insert expense sample data (user ID 1 may not exist yet)');
    }

    // Insert sample data for marketing campaigns (using admin user ID = 1)
    console.log('Inserting sample campaign data...');
    try {
      await connection.execute(`
        INSERT IGNORE INTO marketing_campaigns (name, campaign_type, status, budget, spent_amount, leads_generated, conversions, start_date, end_date, description, created_by) VALUES
        ('Spring 2025 Enrollment Drive', 'Social Media', 'active', 5000.00, 3200.00, 150, 25, '2024-11-01', '2025-01-31', 'Facebook and Instagram ads targeting parents', 1),
        ('Google Ads - Computer Science Program', 'Google Ads', 'active', 3000.00, 2100.00, 80, 12, '2024-12-01', '2025-02-28', 'Targeted ads for CS program', 1),
        ('Open House Event Promotion', 'Event Marketing', 'completed', 1500.00, 1450.00, 200, 35, '2024-10-01', '2024-11-30', 'Promoting campus open house events', 1),
        ('Email Newsletter Campaign', 'Email Marketing', 'active', 800.00, 400.00, 500, 45, '2024-12-01', '2025-03-31', 'Monthly newsletters to prospects', 1),
        ('Referral Program Launch', 'Referral Program', 'paused', 2000.00, 800.00, 60, 18, '2024-11-15', '2025-01-15', 'Student and parent referral incentives', 1)
      `);
    } catch (error) {
      console.log('Note: Could not insert campaign sample data (user ID 1 may not exist yet)');
    }

    console.log('Sample data inserted successfully!');
    console.log('✅ Finance and Marketing tables setup completed!');

  } catch (error) {
    console.error('❌ Error setting up finance tables:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
};

// Run the setup
setupFinanceTables();