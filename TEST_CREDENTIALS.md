# Test Credentials for Vertex Learn ERP System

## Important Note

All test accounts use the same password: **admin123**

## Role Hierarchy and Access Levels

### 1. Super Admin (System-wide access)

- **Role**: super_admin
- **Access**: All organizations, system management, approval workflows
- **Email**: superadmin@vertexlearn.com
- **Password**: admin123
- **Features**:
  - Organization management and approval
  - System health monitoring
  - Global user management
  - Cross-organization analytics

### 2. Organization Admins (Organization-specific admin access)

#### Vertex University Admin

- **Role**: org_admin
- **Organization**: Vertex University (VU001)
- **Email**: admin@vertexuni.edu
- **Password**: admin123
- **Employee ID**: VU_ADMIN001

#### Tech Academy Admin

- **Role**: org_admin
- **Organization**: Tech Academy (TA002)
- **Email**: admin@techacademy.edu
- **Password**: admin123
- **Employee ID**: TA_ADMIN001

#### Community College Admin

- **Role**: org_admin
- **Organization**: Community College (CC003)
- **Email**: admin@communitycollege.edu
- **Password**: admin123
- **Employee ID**: CC_ADMIN001

### 3. Finance Managers (Financial and Marketing access)

#### Vertex University Finance Manager

- **Role**: finance_manager
- **Organization**: Vertex University (VU001)
- **Email**: finance@vertexuni.edu
- **Password**: admin123
- **Employee ID**: VU_FIN001

#### Tech Academy Finance Manager

- **Role**: finance_manager
- **Organization**: Tech Academy (TA002)
- **Email**: finance@techacademy.edu
- **Password**: admin123
- **Employee ID**: TA_FIN001

### 4. Teachers (Course and Academic Management)

#### Vertex University Teachers

- **Dr. Alice Cooper** (Computer Science)

  - **Email**: alice.cooper@vertexuni.edu
  - **Password**: admin123
  - **Employee ID**: VU_TEACH001

- **Prof. Robert Davis** (Mathematics)
  - **Email**: robert.davis@vertexuni.edu
  - **Password**: admin123
  - **Employee ID**: VU_TEACH002

#### Tech Academy Teacher

- **Ms. Lisa Chen** (Web Development)
  - **Email**: lisa.chen@techacademy.edu
  - **Password**: admin123
  - **Employee ID**: TA_TEACH001

### 5. Students (Limited access to their academic data)

#### Vertex University Students

- **James Rodriguez** (Computer Science)

  - **Email**: james.rodriguez@student.vertexuni.edu
  - **Password**: admin123
  - **Student ID**: VU_STU001

- **Maria Garcia** (Mathematics)
  - **Email**: maria.garcia@student.vertexuni.edu
  - **Password**: admin123
  - **Student ID**: VU_STU002

#### Tech Academy Student

- **Kevin Park** (Web Development)
  - **Email**: kevin.park@student.techacademy.edu
  - **Password**: admin123
  - **Student ID**: TA_STU001

#### Community College Student

- **Sophie Turner** (General Studies)
  - **Email**: sophie.turner@student.communitycollege.edu
  - **Password**: admin123
  - **Student ID**: CC_STU001

## Testing Organizations

### 1. Vertex University (VU001)

- **Status**: Approved
- **Subscription**: Enterprise
- **Address**: 123 Education Street, Learning City
- **Phone**: +1-555-0123
- **Email**: info@vertexuni.edu

### 2. Tech Academy (TA002)

- **Status**: Approved
- **Subscription**: Premium
- **Address**: 456 Tech Boulevard, Innovation District
- **Phone**: +1-555-0456
- **Email**: contact@techacademy.edu

### 3. Community College (CC003)

- **Status**: Pending (for testing approval workflows)
- **Subscription**: Basic
- **Address**: 789 Community Lane, Downtown
- **Phone**: +1-555-0789
- **Email**: admin@communitycollege.edu

## Dashboard Access Testing

### Super Admin Dashboard

- URL: `/super-admin`
- Test with: superadmin@vertexlearn.com
- Features: Organization approval, system monitoring, global analytics

### Finance Manager Dashboard

- URL: `/finance`
- Test with: finance@vertexuni.edu or finance@techacademy.edu
- Features: Revenue tracking, expense management, marketing ROI

### Organization Admin Dashboard

- URL: `/admin`
- Test with: admin@vertexuni.edu, admin@techacademy.edu, or admin@communitycollege.edu
- Features: Full organization management, user approval, academic oversight

### Teacher Dashboard

- URL: `/teacher`
- Test with: Any teacher email above
- Features: Course management, grade tracking, attendance

### Student Dashboard

- URL: `/student`
- Test with: Any student email above
- Features: Grade viewing, course enrollment, personal academic data

## Security Testing

### Role-Based Access Control

1. Try accessing higher-privilege dashboards with lower-role accounts
2. Verify organization data isolation (users should only see their org data)
3. Test cross-organization access restrictions

### Authentication Flow

1. Login with different role accounts
2. Test token refresh and session management
3. Verify logout functionality

### Data Isolation

1. Finance managers should only see their organization's financial data
2. Org admins should only manage users in their organization
3. Students should only see their own academic records

## Database Setup Commands

1. **Reset and setup database:**

   ```bash
   cd backend
   npm run setup-db
   ```

2. **Manual database reset (if needed):**
   ```sql
   DROP DATABASE IF EXISTS vertex_school_erp;
   ```
   Then run setup command again.

## API Testing

### Authentication Endpoints

- POST `/api/auth/login` - Test with any credentials above
- POST `/api/auth/logout` - Test session termination
- GET `/api/auth/me` - Test current user retrieval

### Role-Specific Endpoints

Test API access based on user roles to ensure proper authorization.

## Notes for Development

1. **Multi-tenancy**: Each organization operates independently
2. **Role Hierarchy**: super_admin > org_admin > finance_manager > teacher > student
3. **Data Isolation**: Users can only access data within their organization (except super_admin)
4. **Approval Workflows**: New organizations require super_admin approval
5. **Subscription Management**: Different features based on subscription level

## Common Test Scenarios

1. **Super Admin**: Approve pending organizations, monitor system health
2. **Org Admin**: Manage users within organization, approve teacher/student registrations
3. **Finance Manager**: Track revenue, manage expenses, analyze marketing ROI
4. **Teacher**: Create courses, grade students, track attendance
5. **Student**: View grades, enroll in courses, check academic progress
