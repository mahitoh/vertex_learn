-- MySQL Database Schema for Vertex Learn ERP System

-- Create database
CREATE DATABASE IF NOT EXISTS vertex_school_erp;
USE vertex_school_erp;

-- Organizations table (for multi-tenant support)
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    status ENUM('pending', 'approved', 'suspended', 'cancelled') DEFAULT 'pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    subscription_plan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
    subscription_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    organization_id INT NULL,
    department VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    hire_date DATE,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    validation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validated_by INT NULL,
    validated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (validated_by) REFERENCES users(id)
);

-- Courses table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    credits INT NOT NULL,
    instructor_id INT,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Enrollments table
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    grade VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_enrollment (student_id, course_id)
);

-- Grades table
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    assignment_type ENUM('exam', 'quiz', 'homework', 'project', 'participation') NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (score / max_score * 100) STORED,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_attendance (student_id, course_id, date)
);

-- Exams table
CREATE TABLE exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'online') NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Expenses table
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL,
    approved_by INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Leaves table
CREATE TABLE leaves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type ENUM('sick', 'vacation', 'personal', 'maternity', 'paternity') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message TEXT NOT NULL,
    recipient_id INT NOT NULL,
    sender_id INT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Assets table
CREATE TABLE assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type ENUM('equipment', 'furniture', 'vehicle', 'building', 'software') NOT NULL,
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    location VARCHAR(255),
    assigned_to INT,
    status ENUM('available', 'in_use', 'maintenance', 'retired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Campaigns table
CREATE TABLE campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type ENUM('marketing', 'recruitment', 'fundraising', 'awareness') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    budget DECIMAL(10,2),
    status ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Verifications table
CREATE TABLE verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    document_type ENUM('id_card', 'passport', 'degree', 'certificate', 'other') NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by INT,
    verification_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles (Updated for new role structure)
INSERT INTO roles (name, description) VALUES
('super_admin', 'Super Administrator with system-wide access across all organizations'),
('org_admin', 'Organization Administrator with full access within their organization'),
('finance_manager', 'Finance Manager with financial and marketing management access'),
('teacher', 'Teacher with course management access'),
('student', 'Student with limited access');

-- Insert test organizations
INSERT INTO organizations (name, code, description, address, phone, email, website, status, subscription_plan) VALUES
('Vertex University', 'VU001', 'Main university campus for testing', '123 Education Street, Learning City', '+1-555-0123', 'info@vertexuni.edu', 'https://vertexuni.edu', 'approved', 'enterprise'),
('Tech Academy', 'TA002', 'Technology focused academy', '456 Tech Boulevard, Innovation District', '+1-555-0456', 'contact@techacademy.edu', 'https://techacademy.edu', 'approved', 'premium'),
('Community College', 'CC003', 'Local community college', '789 Community Lane, Downtown', '+1-555-0789', 'admin@communitycollege.edu', 'https://communitycollege.edu', 'pending', 'basic');

-- Insert comprehensive test users (password for all: admin123)
-- Super Admin (system-wide access, no organization)
INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, phone, validation_status) VALUES
('Super Administrator', 'superadmin@vertexlearn.com', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 1, NULL, 'System Administration', 'SUPER001', '+1-555-1001', 'approved');

-- Organization Admins
INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, phone, validation_status) VALUES
('John Smith', 'admin@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 1, 'Administration', 'VU_ADMIN001', '+1-555-1002', 'approved'),
('Sarah Johnson', 'admin@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 2, 'Administration', 'TA_ADMIN001', '+1-555-1003', 'approved'),
('Michael Brown', 'admin@communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 2, 3, 'Administration', 'CC_ADMIN001', '+1-555-1004', 'approved');

-- Finance Managers
INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, phone, validation_status) VALUES
('Emma Wilson', 'finance@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 1, 'Finance', 'VU_FIN001', '+1-555-1005', 'approved'),
('David Lee', 'finance@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 3, 2, 'Finance', 'TA_FIN001', '+1-555-1006', 'approved');

-- Teachers
INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, phone, validation_status) VALUES
('Dr. Alice Cooper', 'alice.cooper@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, 'Computer Science', 'VU_TEACH001', '+1-555-1007', 'approved'),
('Prof. Robert Davis', 'robert.davis@vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 1, 'Mathematics', 'VU_TEACH002', '+1-555-1008', 'approved'),
('Ms. Lisa Chen', 'lisa.chen@techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 4, 2, 'Web Development', 'TA_TEACH001', '+1-555-1009', 'approved');

-- Students
INSERT INTO users (name, email, password, role_id, organization_id, department, employee_id, phone, validation_status) VALUES
('James Rodriguez', 'james.rodriguez@student.vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 1, 'Computer Science', 'VU_STU001', '+1-555-1010', 'approved'),
('Maria Garcia', 'maria.garcia@student.vertexuni.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 1, 'Mathematics', 'VU_STU002', '+1-555-1011', 'approved'),
('Kevin Park', 'kevin.park@student.techacademy.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 2, 'Web Development', 'TA_STU001', '+1-555-1012', 'approved'),
('Sophie Turner', 'sophie.turner@student.communitycollege.edu', '$2b$12$qqOYbfgXd8vLtD1RAAgKyuH8vUs71pE6akjwkNn6ouzWlVA.dcYgO', 5, 3, 'General Studies', 'CC_STU001', '+1-555-1013', 'approved');

-- Insert default settings
INSERT INTO settings (key_name, value, description) VALUES
('school_name', 'Vertex Learn', 'Name of the educational institution'),
('school_address', '123 Education Street', 'Address of the institution'),
('school_phone', '+1-555-0123', 'Contact phone number'),
('school_email', 'info@vertexlearn.com', 'Contact email address'),
('academic_year', '2024-2025', 'Current academic year'),
('semester', 'Fall', 'Current semester'),
('max_class_size', '30', 'Maximum number of students per class'),
('attendance_threshold', '75', 'Minimum attendance percentage required'),
('grade_scale', 'A:90-100,B:80-89,C:70-79,D:60-69,F:0-59', 'Grade scale configuration');
