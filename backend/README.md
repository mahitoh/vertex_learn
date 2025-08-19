# Vertex Learn ERP - Backend API

A comprehensive ERP system backend for educational institutions built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Academic Module**: Course management, grades, attendance, exams
- **Finance Module**: Invoicing, expense tracking, marketing campaigns
- **HR Module**: Employee management, leave requests, asset tracking
- **API Documentation**: Swagger/OpenAPI documentation
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Helmet, CORS, rate limiting, input validation
- **Testing**: Jest with TypeScript support

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository and navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Set up PostgreSQL database:
```bash
createdb vertex_learn
```

5. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for interactive API documentation.

### Health Check

Visit `http://localhost:3000/health` to check server status.

## Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── tests/           # Test files
```

## Environment Variables

See `.env.example` for all available environment variables.

## Database

The application uses PostgreSQL with Sequelize ORM. Database models are automatically synchronized in development mode.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet

## Testing

Run tests with:
```bash
npm test
```

Tests are written using Jest and Supertest for API testing.
