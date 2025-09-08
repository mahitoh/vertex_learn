-- Simplified MySQL Database Schema for Vertex Learn ERP System
-- Simple Role Structure: super_admin, admin, teacher, student

-- Organizations table (schools)
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    status ENUM('pending', 'approved', 'suspended') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Simplified Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    organization_id INT NULL, -- NULL for super_admin
    phone VARCHAR(20),
    employee_id VARCHAR(50),
    student_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Insert simplified roles
INSERT INTO roles (id, name, description) VALUES
(1, 'super_admin', 'Super Administrator - manages all schools'),
(2, 'admin', 'School Administrator - manages one school'),
(3, 'teacher', 'Teacher - teaches courses'),
(4, 'student', 'Student - takes courses');

-- Insert test schools
INSERT INTO organizations (name, code, description, address, phone, email, status) VALUES
('Vertex High School', 'VHS001', 'Main high school', '123 School Street', '+1-555-0123', 'info@vertexhs.edu', 'approved'),
('Tech Academy', 'TA002', 'Technology academy', '456 Tech Blvd', '+1-555-0456', 'admin@techacademy.edu', 'approved'),
('Community College', 'CC003', 'Community college', '789 Community Lane', '+1-555-0789', 'admin@communitycollege.edu', 'pending');

-- Insert test users (password: admin123 = $2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO)
INSERT INTO users (name, email, password, role_id, organization_id, employee_id) VALUES
-- Super Admin (no organization - manages all)
('Super Admin', 'superadmin@vertexlearn.com', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 1, NULL, 'SUPER001'),

-- School Admins (one per school)
('John Smith', 'admin@vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 1, 'VHS_ADMIN'),
('Sarah Johnson', 'admin@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 2, 'TA_ADMIN'),
('Mike Wilson', 'admin@communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 3, 'CC_ADMIN'),

-- Teachers (per school)
('Dr. Alice Cooper', 'alice.cooper@vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 1, 'VHS_TEACH001'),
('Prof. Robert Davis', 'robert.davis@vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 1, 'VHS_TEACH002'),
('Ms. Lisa Chen', 'lisa.chen@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 2, 'TA_TEACH001'),

-- Students (per school)
('James Rodriguez', 'james@student.vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, NULL, 'VHS_STU001'),
('Maria Garcia', 'maria@student.vertexhs.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, NULL, 'VHS_STU002'),
('Kevin Park', 'kevin@student.techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 2, NULL, 'TA_STU001'),
('Sophie Turner', 'sophie@student.communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 3, NULL, 'CC_STU001');
