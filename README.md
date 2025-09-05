# Academic Management System

A full-stack web application for managing academic institutions with role-based access control for administrators, teachers, and students.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd academic-management-system
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Start the Backend Server**
```bash
cd ../backend
npm run dev
```
Backend will run on `http://localhost:3000`

5. **Start the Frontend Development Server**
```bash
cd ../frontend
npm run dev
```
Frontend will run on `http://localhost:8080`

## 🏗️ Project Structure

```
academic-management-system/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   └── index.ts         # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages/components
│   │   ├── contexts/        # React contexts
│   │   └── App.tsx          # Main app component
│   └── package.json
└── README.md
```

## 👥 User Roles & Access

### Admin Dashboard (`/admin`)
- **Purpose**: User verification and system management
- **Features**:
  - Verify pending user registrations
  - View system statistics
  - Manage user accounts
  - Access all system functions

### Teacher Dashboard (`/teacher`)
- **Purpose**: Teaching and course management
- **Features**:
  - Manage courses and classes
  - Grade management
  - Student attendance tracking
  - Exam creation and management

### Student Dashboard (`/student`)
- **Purpose**: Learning and academic tracking
- **Features**:
  - View enrolled courses
  - Check grades and attendance
  - Access schedule and timetable
  - Submit assignments

## 🧪 Test Data

### Admin Account
```json
{
  "email": "admin@school.edu",
  "password": "admin123",
  "fullName": "System Administrator",
  "role": "admin",
  "employeeId": "ADM001"
}
```

### Teacher Accounts
```json
{
  "email": "john.smith@school.edu",
  "password": "teacher123",
  "fullName": "John Smith",
  "role": "teacher",
  "employeeId": "TCH001",
  "department": "Mathematics"
}
```

```json
{
  "email": "sarah.johnson@school.edu",
  "password": "teacher123",
  "fullName": "Sarah Johnson",
  "role": "teacher",
  "employeeId": "TCH002",
  "department": "Science"
}
```

### Student Accounts
```json
{
  "email": "alice.brown@student.edu",
  "password": "student123",
  "fullName": "Alice Brown",
  "role": "student",
  "studentId": "STU001",
  "grade": "10th Grade"
}
```

```json
{
  "email": "bob.wilson@student.edu",
  "password": "student123",
  "fullName": "Bob Wilson",
  "role": "student",
  "studentId": "STU002",
  "grade": "11th Grade"
}
```

## 🧪 Testing Workflow

### 1. Register Test Users
1. Go to `http://localhost:8080/register`
2. Register users with the test data above
3. **Important**: New users need admin verification before they can access their dashboards

### 2. Admin Verification Process
1. Register an admin account first
2. Login as admin at `http://localhost:8080/login`
3. Go to Admin Dashboard (`/admin`)
4. Verify pending users in the verification queue
5. Once verified, users can login and access their role-specific dashboards

### 3. Test Role-Based Access
- **Admin**: `http://localhost:8080/admin` - Verification queue, user management
- **Teacher**: `http://localhost:8080/teacher` - Academic dashboard with teaching tools
- **Student**: `http://localhost:8080/student` - Academic dashboard with learning tools

## 🔧 Common Issues & Fixes

### Backend Issues

**Port Already in Use (3000)**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

**CORS Errors**
- Ensure backend is running on port 3000
- Check frontend is making requests to correct backend URL
- Verify CORS is configured in backend

**Database/Storage Issues**
- This app uses in-memory storage
- Data resets when backend restarts
- For persistent data, implement database integration

### Frontend Issues

**Port Already in Use (8080)**
```bash
# Kill process on port 8080
npx kill-port 8080
# Or use different port
npm run dev -- --port 8081
```

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check TypeScript compilation
npm run type-check
# Fix import paths and type definitions
```

### Authentication Issues

**Login Fails**
1. Check if user is verified by admin
2. Verify correct email/password
3. Check browser console for API errors
4. Ensure backend is running

**Redirect Loops**
1. Clear browser localStorage: `localStorage.clear()`
2. Check user role matches expected format
3. Verify routing configuration

**Access Denied**
1. Ensure user has correct role
2. Check if user is verified
3. Try logging out and back in

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm start           # Start production build
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Verification (Admin only)**
- `GET /api/verifications` - Get pending verifications
- `POST /api/verifications/:id/approve` - Approve user
- `POST /api/verifications/:id/reject` - Reject user

**Debug**
- `GET /api/debug/users` - List all users (development only)

## 🔐 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Admin verification required for new users
- Protected routes prevent unauthorized access

## 📝 Next Steps

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Email Verification**: Send verification emails to new users
3. **Password Reset**: Implement forgot password functionality
4. **File Upload**: Add profile pictures and document uploads
5. **Real-time Updates**: Add WebSocket for live notifications
6. **Testing**: Add unit and integration tests
7. **Deployment**: Configure for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.