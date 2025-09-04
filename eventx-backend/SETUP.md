# EventX Studio Backend Setup

## Authentication System Setup

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/eventx_studio

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Server Configuration
PORT=5000

# Environment
NODE_ENV=development
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Start the Server
```bash
npm start
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### POST /api/auth/login
Login with existing credentials
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/auth/profile
Get user profile (requires authentication)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Token expiration (7 days)
- Automatic token validation on app startup

## Frontend Integration

The frontend automatically:
- Stores JWT tokens in localStorage
- Sets Authorization headers for API requests
- Redirects users based on their role
- Handles token expiration gracefully
