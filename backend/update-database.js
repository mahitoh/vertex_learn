import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateDatabase = async () => {
  let connection;
  
  try {
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove leading slash
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Drop existing tables if they exist (in correct order due to foreign keys)
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToDrop = [
      'verifications', 'notifications', 'assets', 'campaigns', 'settings',
      'leaves', 'expenses', 'payments', 'exams', 'attendance', 'grades',
      'enrollments', 'courses', 'users', 'roles'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${table}`);
      } catch (err) {
        console.log(`Table ${table} doesn't exist, skipping...`);
      }
    }
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Dropped existing tables');

    // Create new schema
    const schemas = [
      `CREATE TABLE roles (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          permissions JSON,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          firstName VARCHAR(255),
          lastName VARCHAR(255),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255),
          roleId INT NOT NULL,
          department VARCHAR(100),
          employeeId VARCHAR(50) UNIQUE,
          studentId VARCHAR(50) UNIQUE,
          position VARCHAR(100),
          joinDate DATE,
          admissionDate DATE,
          class VARCHAR(50),
          rollNumber VARCHAR(50),
          organization VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          dateOfBirth DATE,
          hireDate DATE,
          salary DECIMAL(10,2),
          isActive BOOLEAN DEFAULT TRUE,
          validationStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          validatedBy INT NULL,
          validatedAt TIMESTAMP NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (roleId) REFERENCES roles(id),
          FOREIGN KEY (validatedBy) REFERENCES users(id)
      )`,
      
      `CREATE TABLE verifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          userId INT NOT NULL,
          role VARCHAR(50) NOT NULL,
          status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
          submissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          documents JSON,
          comments TEXT,
          verifiedBy INT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (verifiedBy) REFERENCES users(id)
      )`,
      
      `CREATE TABLE notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          message TEXT NOT NULL,
          recipientId INT NOT NULL,
          senderId INT NOT NULL,
          type ENUM('info', 'warning', 'error', 'success', 'verification') DEFAULT 'info',
          status ENUM('unread', 'read') DEFAULT 'unread',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (recipientId) REFERENCES users(id),
          FOREIGN KEY (senderId) REFERENCES users(id)
      )`,
      
      `CREATE TABLE settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          keyName VARCHAR(255) NOT NULL UNIQUE,
          value TEXT,
          description TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];

    for (const schema of schemas) {
      await connection.execute(schema);
    }
    console.log('Created new schema');

    // Insert default data
    const defaultData = `
      -- Insert default roles
      INSERT INTO roles (name, description, permissions) VALUES
      ('admin', 'System administrator with full access', '["all"]'),
      ('teacher', 'Teacher with course management access', '["courses", "grades", "attendance"]'),
      ('student', 'Student with limited access', '["view_grades", "view_courses"]'),
      ('staff', 'Staff member with administrative access', '["users", "reports"]');

      -- Insert default admin user (password: admin123)
      INSERT INTO users (firstName, lastName, name, email, password, roleId, department, employeeId) VALUES
      ('Admin', 'User', 'Admin User', 'admin@vertexlearn.com', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 1, 'Administration', 'ADMIN001');

      -- Insert some sample users for verification
      INSERT INTO users (firstName, lastName, name, email, roleId, department, employeeId, studentId, position) VALUES
      ('John', 'Smith', 'John Smith', 'john.smith@example.com', 2, 'Mathematics', 'EMP002', NULL, 'Senior Teacher'),
      ('Sarah', 'Johnson', 'Sarah Johnson', 'sarah.johnson@example.com', 2, 'English', 'EMP003', NULL, 'Teacher'),
      ('Mike', 'Chen', 'Mike Chen', 'mike.chen@example.com', 4, 'IT', 'EMP004', NULL, 'IT Support'),
      ('Emily', 'Rodriguez', 'Emily Rodriguez', 'emily.rodriguez@example.com', 3, NULL, NULL, 'STU001', NULL),
      ('David', 'Kim', 'David Kim', 'david.kim@example.com', 3, NULL, NULL, 'STU002', NULL);

      -- Insert sample verification requests
      INSERT INTO verifications (userId, role, status, submissionDate, documents, comments) VALUES
      (2, 'Teacher', 'pending', '2025-08-28 10:30:00', '["degree.pdf", "certificate.pdf"]', 'Mathematics teacher application'),
      (3, 'Teacher', 'pending', '2025-08-27 14:15:00', '["degree.pdf", "experience.pdf"]', 'English teacher application'),
      (4, 'Staff', 'pending', '2025-08-26 09:45:00', '["resume.pdf", "certifications.pdf"]', 'IT support staff application'),
      (5, 'Student', 'pending', '2025-08-25 16:20:00', '["transcript.pdf", "id.pdf"]', 'Student enrollment application'),
      (6, 'Student', 'pending', '2025-08-24 11:10:00', '["transcript.pdf", "application.pdf"]', 'Student enrollment application');

      -- Insert default settings
      INSERT INTO settings (keyName, value, description) VALUES
      ('school_name', 'Vertex Learn', 'Name of the educational institution'),
      ('school_address', '123 Education Street', 'Address of the institution'),
      ('school_phone', '+1-555-0123', 'Contact phone number'),
      ('school_email', 'info@vertexlearn.com', 'Contact email address'),
      ('academic_year', '2024-2025', 'Current academic year');
    `;

    // Execute each insert statement separately
    const insertStatements = [
      `INSERT INTO roles (name, description, permissions) VALUES
       ('admin', 'System administrator with full access', '["all"]'),
       ('teacher', 'Teacher with course management access', '["courses", "grades", "attendance"]'),
       ('student', 'Student with limited access', '["view_grades", "view_courses"]'),
       ('staff', 'Staff member with administrative access', '["users", "reports"]')`,
       
      `INSERT INTO users (firstName, lastName, name, email, password, roleId, department, employeeId) VALUES
       ('Admin', 'User', 'Admin User', 'admin@vertexlearn.com', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 1, 'Administration', 'ADMIN001')`,
       
      `INSERT INTO users (firstName, lastName, name, email, roleId, department, employeeId, studentId, position) VALUES
       ('John', 'Smith', 'John Smith', 'john.smith@example.com', 2, 'Mathematics', 'EMP002', NULL, 'Senior Teacher'),
       ('Sarah', 'Johnson', 'Sarah Johnson', 'sarah.johnson@example.com', 2, 'English', 'EMP003', NULL, 'Teacher'),
       ('Mike', 'Chen', 'Mike Chen', 'mike.chen@example.com', 4, 'IT', 'EMP004', NULL, 'IT Support'),
       ('Emily', 'Rodriguez', 'Emily Rodriguez', 'emily.rodriguez@example.com', 3, NULL, NULL, 'STU001', NULL),
       ('David', 'Kim', 'David Kim', 'david.kim@example.com', 3, NULL, NULL, 'STU002', NULL)`,
       
      `INSERT INTO verifications (userId, role, status, submissionDate, documents, comments) VALUES
       (2, 'Teacher', 'pending', '2025-08-28 10:30:00', '["degree.pdf", "certificate.pdf"]', 'Mathematics teacher application'),
       (3, 'Teacher', 'pending', '2025-08-27 14:15:00', '["degree.pdf", "experience.pdf"]', 'English teacher application'),
       (4, 'Staff', 'pending', '2025-08-26 09:45:00', '["resume.pdf", "certifications.pdf"]', 'IT support staff application'),
       (5, 'Student', 'pending', '2025-08-25 16:20:00', '["transcript.pdf", "id.pdf"]', 'Student enrollment application'),
       (6, 'Student', 'pending', '2025-08-24 11:10:00', '["transcript.pdf", "application.pdf"]', 'Student enrollment application')`,
       
      `INSERT INTO settings (keyName, value, description) VALUES
       ('school_name', 'Vertex Learn', 'Name of the educational institution'),
       ('school_address', '123 Education Street', 'Address of the institution'),
       ('school_phone', '+1-555-0123', 'Contact phone number'),
       ('school_email', 'info@vertexlearn.com', 'Contact email address'),
       ('academic_year', '2024-2025', 'Current academic year')`
    ];

    for (const statement of insertStatements) {
      await connection.execute(statement);
    }
    console.log('Inserted default data');

    console.log('Database update completed successfully!');

  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

updateDatabase();