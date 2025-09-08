# 🎓 Vertex Learn - Simple Test Credentials

## Password for ALL accounts: `admin123`

## 🔑 Test Accounts

### 🌟 Super Admin (System-wide access)

- **Email:** `superadmin@vertexlearn.com`
- **Role:** `super_admin`
- **Access:** All schools, system management
- **Dashboard:** `/super-admin`

### 🏫 School Admins (Per-school access)

#### Vertex High School Admin

- **Email:** `admin@vertexhs.edu`
- **Name:** John Smith
- **Role:** `admin`
- **School:** Vertex High School
- **Dashboard:** `/admin`

#### Tech Academy Admin

- **Email:** `admin@techacademy.edu`
- **Name:** Sarah Johnson
- **Role:** `admin`
- **School:** Tech Academy
- **Dashboard:** `/admin`

#### Community College Admin

- **Email:** `admin@communitycollege.edu`
- **Name:** Mike Wilson
- **Role:** `admin`
- **School:** Community College (Pending approval)
- **Dashboard:** `/admin`

### 👨‍🏫 Teachers

#### Vertex High School Teachers

- **Email:** `alice.cooper@vertexhs.edu`
- **Name:** Dr. Alice Cooper
- **Role:** `teacher`
- **School:** Vertex High School
- **Dashboard:** `/teacher`

- **Email:** `robert.davis@vertexhs.edu`
- **Name:** Prof. Robert Davis
- **Role:** `teacher`
- **School:** Vertex High School
- **Dashboard:** `/teacher`

#### Tech Academy Teacher

- **Email:** `lisa.chen@techacademy.edu`
- **Name:** Ms. Lisa Chen
- **Role:** `teacher`
- **School:** Tech Academy
- **Dashboard:** `/teacher`

### 🎓 Students

#### Vertex High School Students

- **Email:** `james@student.vertexhs.edu`
- **Name:** James Rodriguez
- **Role:** `student`
- **Student ID:** VHS_STU001
- **Dashboard:** `/student`

- **Email:** `maria@student.vertexhs.edu`
- **Name:** Maria Garcia
- **Role:** `student`
- **Student ID:** VHS_STU002
- **Dashboard:** `/student`

#### Tech Academy Student

- **Email:** `kevin@student.techacademy.edu`
- **Name:** Kevin Park
- **Role:** `student`
- **Student ID:** TA_STU001
- **Dashboard:** `/student`

#### Community College Student

- **Email:** `sophie@student.communitycollege.edu`
- **Name:** Sophie Turner
- **Role:** `student`
- **Student ID:** CC_STU001
- **Dashboard:** `/student`

## 🏢 Test Schools

### 1. Vertex High School (VHS001)

- **Status:** ✅ Approved
- **Code:** VHS001
- **Phone:** +1-555-0123
- **Email:** info@vertexhs.edu

### 2. Tech Academy (TA002)

- **Status:** ✅ Approved
- **Code:** TA002
- **Phone:** +1-555-0456
- **Email:** admin@techacademy.edu

### 3. Community College (CC003)

- **Status:** ⏳ Pending (for testing approval workflows)
- **Code:** CC003
- **Phone:** +1-555-0789
- **Email:** admin@communitycollege.edu

## 🧪 Testing Scenarios

### Role Access Testing

1. **Super Admin** → Can access all schools and approve pending organizations
2. **School Admin** → Can only manage their own school
3. **Teacher** → Can manage courses and students in their school
4. **Student** → Can only see their own academic data

### Authentication Testing

1. Login with each role type
2. Verify correct dashboard routing
3. Test cross-role access restrictions
4. Verify organization data isolation

### Database Reset

```bash
cd backend
node setup-simple-db.js
```

## 🚀 Quick Start

1. Reset database: `cd backend && node setup-simple-db.js`
2. Start backend: `npm run dev`
3. Start frontend: `cd ../frontend && npm run dev`
4. Login with any test credentials above using password: `admin123`

---

**Note:** This is a simplified 4-role system: `super_admin` → `admin` → `teacher` → `student`
