# EventX Studio Frontend Setup

## Authentication System Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```

## Authentication Features

### Components
- **Login.jsx**: User login form with email/password
- **Register.jsx**: User registration with role selection
- **AuthContext.js**: Global authentication state management
- **ProtectedRoute.js**: Route protection based on authentication status
- **LoadingSpinner.js**: Reusable loading component

### Features
- **Automatic Token Management**: JWT tokens are automatically stored and managed
- **Role-Based Navigation**: Different navigation based on user role (admin/user)
- **Persistent Sessions**: Users stay logged in across browser sessions
- **Automatic Redirects**: Users are redirected based on their authentication status
- **Loading States**: Proper loading indicators during authentication operations
- **Error Handling**: User-friendly error messages for authentication failures

### User Roles
- **Event Attendee (user)**: Can browse events and book tickets
- **Event Organizer (admin)**: Can create events, manage tickets, and view analytics

## Authentication Flow

1. **Login**: User enters email/password → JWT token received → User redirected based on role
2. **Register**: User fills registration form → Account created → Automatic login → Redirect
3. **Logout**: Token removed → User redirected to login page
4. **Session Persistence**: App checks token validity on startup

## Protected Routes

- **Admin Routes**: `/admin/*` - Requires admin role
- **User Routes**: `/my-tickets`, `/book-ticket` - Requires authentication
- **Public Routes**: `/`, `/login`, `/register` - Accessible to everyone

## API Integration

The frontend automatically:
- Sends JWT tokens in Authorization headers
- Handles API errors gracefully
- Refreshes user data when needed
- Manages loading states during API calls

## Styling

- **Tailwind CSS**: Modern, responsive design
- **Consistent UI**: Matching design language across components
- **Accessibility**: Proper labels, focus states, and keyboard navigation
- **Mobile Responsive**: Works on all device sizes
