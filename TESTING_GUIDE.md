# Testing Guide for Role-Based Authentication

## Problem Diagnosis

The error `Cannot read properties of null (reading 'toLowerCase')` occurs when:

1. User directly accesses `/dashboard` without being logged in
2. JWT token is expired or invalid
3. Backend `/api/auth/me` returns 401 Unauthorized

## Step-by-Step Testing Guide

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**

```
🚀 Server is running on port 3000
Connected to MySQL database
```

### 2. Test Backend API Directly

#### Test Login Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@vertexlearn.com","password":"admin123"}'
```

**Expected Response:**

```json
{
  "message": "Login successful",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": 1,
    "name": "Super Administrator",
    "email": "superadmin@vertexlearn.com",
    "role": {
      "id": 1,
      "name": "super_admin",
      "description": "Super Administrator with system-wide access across all organizations"
    }
  }
}
```

#### Test Me Endpoint (replace TOKEN with actual token)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 3. Test Frontend Login Flow

1. **Go to Login Page:**

   ```
   http://localhost:8080/login
   ```

2. **Use Test Credentials:**

   - **Super Admin:** superadmin@vertexlearn.com / admin123
   - **Org Admin:** admin@vertexuni.edu / admin123
   - **Finance Manager:** finance@vertexuni.edu / admin123
   - **Teacher:** alice.cooper@vertexuni.edu / admin123
   - **Student:** james.rodriguez@student.vertexuni.edu / admin123

3. **Expected Behavior After Login:**
   - Super Admin → Redirected to `/super-admin`
   - Org Admin → Redirected to `/admin`
   - Finance Manager → Redirected to `/finance`
   - Teacher → Redirected to `/teacher`
   - Student → Redirected to `/student`

### 4. Common Issues and Solutions

#### Issue 1: "Cannot read properties of null (reading 'toLowerCase')"

**Cause:** User object is null when accessing `/dashboard`
**Solution:**

- Always go to `/login` first
- Don't access `/dashboard` directly
- Use role-specific URLs after login

#### Issue 2: 401 Unauthorized on `/api/auth/me`

**Cause:** JWT token is missing, expired, or invalid
**Solution:**

- Login again to get fresh tokens
- Check localStorage for tokens: `localStorage.getItem('accessToken')`
- Clear tokens if needed: `localStorage.clear()`

#### Issue 3: Backend not responding

**Cause:** Backend server not running or database connection issues
**Solution:**

- Check if backend is running on port 3000
- Verify MySQL database is running
- Check database credentials in `.env` file

### 5. Debug Commands

#### Check Frontend localStorage

```javascript
// In browser console
console.log("Access Token:", localStorage.getItem("accessToken"));
console.log("Refresh Token:", localStorage.getItem("refreshToken"));
```

#### Clear Frontend Storage

```javascript
// In browser console
localStorage.clear();
// Then refresh the page
```

#### Check Database Users

```sql
-- Connect to MySQL and run:
USE vertex_school_erp;
SELECT id, name, email, role_id, validation_status FROM users;
SELECT * FROM roles;
```

### 6. Role-Specific Features

#### Super Admin (`superadmin@vertexlearn.com`)

- Can access all organizations
- System-wide management
- Organization approval workflows

#### Org Admin (`admin@vertexuni.edu`)

- Full access within Vertex University
- User management for their organization
- Academic oversight

#### Finance Manager (`finance@vertexuni.edu`)

- Financial tracking and analytics
- Marketing campaign management
- Revenue and expense reports

#### Teacher (`alice.cooper@vertexuni.edu`)

- Course management
- Grade tracking
- Student attendance

#### Student (`james.rodriguez@student.vertexuni.edu`)

- View grades and courses
- Academic progress tracking
- Limited access to personal data

### 7. Troubleshooting Checklist

- [ ] Backend server is running on port 3000
- [ ] Frontend server is running on port 8080
- [ ] MySQL database is running and accessible
- [ ] Database migration completed successfully
- [ ] User data exists in database with correct roles
- [ ] No browser console errors on login page
- [ ] CORS is properly configured
- [ ] JWT tokens are being stored in localStorage
- [ ] User role is correctly returned from API

### 8. Network Tab Analysis

When testing login, check browser Network tab:

1. **POST** `/api/auth/login` should return 200 with tokens
2. **GET** `/api/auth/me` should return 200 with user data
3. Check request headers include `Authorization: Bearer <token>`
4. Check response data structure matches expected format

### 9. Quick Fix for Current Error

If you're getting the null error:

1. Open browser console
2. Run: `localStorage.clear()`
3. Go to: `http://localhost:8080/login`
4. Login with any test credentials
5. Should redirect to appropriate dashboard

### 10. Database Reset (if needed)

If user data is corrupted:

```bash
cd backend
npm run migrate-db
```

This will reset all users and create fresh test data.
