# vertex_learn ERP Backend

A comprehensive ERP system backend for educational institutions built with Node.js, Express.js, Prisma ORM, and PostgreSQL.

## Features

### 🎓 Academic Module
- Course and program management
- Student performance tracking
- Grade management
- Attendance tracking
- Examination scheduling

### 💰 Marketing & Finance Module
- Tuition fee management
- Invoice generation
- Expense tracking
- Financial reporting
- Marketing campaign tracking

### 👥 Administration & HR Module
- User verification system
- Employee management
- Payroll processing
- Leave management
- Performance tracking
- Asset management
- System settings

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **PDF Generation**: pdfkit

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication, validation
│   ├── routes/          # Express routes
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration
│   ├── docs/            # Swagger documentation
│   └── index.ts         # Main server file
├── prisma/
│   └── schema.prisma    # Database schema
├── package.json
├── .env
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Docker (optional, for local development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vertex_learn/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Using Docker (recommended for development)
   docker-compose up -d
   
   # Or connect to your PostgreSQL instance
   # Update DATABASE_URL in .env
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

7. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vertex_learn?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker-compose up
```

## API Documentation

Once the server is running, you can access the API documentation at:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Academic Module
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/grades` - List grades
- `POST /api/grades` - Add grade
- `GET /api/attendance` - List attendance
- `POST /api/attendance` - Log attendance
- `GET /api/exams` - List exams
- `POST /api/exams` - Schedule exam

### Finance Module
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign

### HR Module
- `GET /api/verifications` - List verifications
- `POST /api/verifications/approve/:id` - Approve verification
- `POST /api/verifications/reject/:id` - Reject verification
- `GET /api/leaves` - List leave requests
- `POST /api/leaves` - Create leave request
- `GET /api/payroll` - List payroll records
- `POST /api/payroll` - Create payroll record
- `GET /api/performance` - List performance records
- `POST /api/performance` - Create performance record
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset

### System
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `GET /api/settings` - List settings
- `PUT /api/settings/:key` - Update setting

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

The system supports the following roles:
- **Admin**: Full access to all modules
- **Teacher**: Access to academic module and limited HR features
- **Student**: Access to academic records and personal information
- **Staff**: Access to HR module and limited academic features

## Database Schema

The database uses a normalized 3NF structure with the following main entities:

- **Users**: Staff, teachers, and students
- **Roles**: Role definitions and permissions
- **Courses**: Academic courses and programs
- **Grades**: Student performance records
- **Attendance**: Student attendance tracking
- **Exams**: Examination schedules
- **Invoices**: Financial invoices
- **Expenses**: Financial expenses
- **Campaigns**: Marketing campaigns
- **Verifications**: User verification requests
- **Leaves**: Leave management
- **Payroll**: Employee payroll records
- **Performance**: Employee performance evaluations
- **Assets**: Office asset management
- **Notifications**: System notifications
- **Settings**: System configuration

## Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Add validation in `src/middleware/validation.ts`
3. Update `src/index.ts` to include the new route
4. Add documentation to `src/docs/swagger.json`

### Adding New Services

1. Create a new service file in `src/services/`
2. Implement business logic
3. Export service functions
4. Use in controllers

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t vertex-learn-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env vertex-learn-backend
   ```

### Production Considerations

- Use environment variables for all configuration
- Set up proper logging (Winston)
- Configure rate limiting
- Set up monitoring and health checks
- Use HTTPS in production
- Set up database backups
- Configure CORS properly for your domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@vertexlearn.com
- Documentation: [API Docs](http://localhost:3000/api-docs)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
