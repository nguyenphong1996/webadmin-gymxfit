# 🏋️‍♂️ GymXFit Admin Dashboard

A comprehensive React admin dashboard for managing gym fitness operations including classes, staff, enrollments, videos, and users.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running (gym-fitness-project-backend)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd admin_gymxfit

# Install dependencies
npm install

# Configure environment variables
cp .env.development .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/                    # API service layer
│   ├── apiClient.js        # Axios client with interceptors
│   ├── classesApi.js       # Classes API endpoints
│   ├── staffApi.js         # Staff API endpoints
│   └── videosApi.js       # Videos API endpoints
├── components/             # Reusable React components
│   ├── common/
│   │   └── TableWithActions.jsx  # Reusable table component
│   ├── layout/           # Layout components
│   │   ├── MainLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── ui/               # UI components (to be added)
├── context/              # React contexts
│   ├── AuthContext.jsx    # Authentication context
│   └── ThemeContext.jsx  # Theme (dark/light mode) context
├── hooks/               # Custom React hooks
│   ├── useFetchClasses.jsx
│   └── useFetchStaff.jsx
├── pages/               # Page components
│   ├── Auth/
│   │   └── LoginPage.jsx
│   ├── Classes/
│   │   ├── ClassesListPage.jsx
│   │   ├── ClassDetailPage.jsx
│   │   ├── ClassCreatePage.jsx
│   │   └── ClassEditPage.jsx
│   ├── Dashboard/
│   │   └── DashboardPage.jsx
│   ├── Staff/          # To be implemented
│   ├── Enrollments/    # To be implemented
│   ├── Videos/         # To be implemented
│   └── Users/          # To be implemented
├── theme/              # Theme-related files
├── utils/              # Utility functions
├── App.jsx             # Main App component
├── main.jsx           # Application entry point
└── index.css          # Global styles + Tailwind
```

## 🔐 Authentication

The admin dashboard uses JWT-based authentication with OTP verification:

1. **Login Flow:**
   - User enters phone number
   - OTP is sent via SMS (using backend SMS service)
   - User enters OTP to complete login
   - JWT token is stored in localStorage

2. **Protected Routes:**
   - All routes except `/login` require authentication
   - Automatic redirect to login if token is invalid/missing
   - Admin role verification for all protected routes

3. **Token Management:**
   - Automatic token refresh
   - Token expiration handling
   - Logout functionality

## 🎨 UI Features

### Tailwind CSS Configuration
- **Dark/Light Mode:** Toggle between themes with system preference detection
- **Responsive Design:** Mobile-first approach with breakpoints
- **Custom Components:** TableWithActions, Layout components
- **Utility-First:** Extensive use of Tailwind utility classes

### Components
- **Sidebar:** Navigation menu with collapsible mobile support
- **TopBar:** User info, logout, mobile menu toggle
- **TableWithActions:** Reusable table with search, pagination, filters
- **ProtectedRoute:** HOC for route protection

## 📊 Pages & Features

### 1. Dashboard (`/dashboard`)
- **Key Stats:** Total classes, active staff, enrollments, videos, users
- **Recent Activity:** Timeline of recent admin actions
- **Upcoming Classes:** Next scheduled classes
- **Quick Actions:** Easy access to common tasks

### 2. Classes Management (`/classes`)
- **List Page:**
  - Paginated table with all classes
  - Filters: status, category, search
  - Actions: view, edit, delete, open/close classes
  - Status badges and enrollment indicators

- **Detail Page (`/classes/:id`)**:
  - Complete class information
  - Instructor details
  - Schedule information
  - QR code display
  - Edit and management actions

- **Create Page (`/classes/create`)**:
  - Form with validation
  - Staff selection
  - Date/time pickers
  - Category selection

- **Edit Page (`/classes/:id/edit`)**:
  - Pre-populated form
  - Update validation

### 3. Placeholder Pages
- **Staff Management** (`/staff`) - PT management interface
- **Enrollments** (`/enrollments`) - Class enrollment tracking
- **Videos** (`/videos`) - Video content management
- **Users** (`/users`) - User account management
- **Settings** (`/settings`) - Admin settings

## 🔌 API Integration

### Base API Client
```javascript
// Automatic JWT token attachment
// Request/response interceptors
// Error handling
// Base URL configuration
```

### Backend Endpoint Mapping

#### Classes API (`/api/admin/classes/*`)
```javascript
// GET /api/admin/classes              // List classes (with pagination/filters)
// GET /api/admin/classes/:id           // Get class details
// POST /api/admin/classes/create       // Create new class
// PATCH /api/admin/classes/:id          // Update class
// PATCH /api/admin/classes/:id/open     // Open class for enrollment
// PATCH /api/admin/classes/:id/close    // Close class
// DELETE /api/admin/classes/:id         // Delete class
// GET /api/admin/classes/:id/qrcode    // Get QR code
```

#### Staff API (`/api/admin/staff/*`)
```javascript
// GET /api/admin/staff                  // List staff members
// GET /api/admin/staff/:id             // Get staff details
// POST /api/admin/staff/create           // Create staff
// PATCH /api/admin/staff/:id/activate    // Activate staff
// PATCH /api/admin/staff/:id/deactivate  // Deactivate staff
// PATCH /api/admin/staff/:id/skills/approve // Approve skills
```

#### Videos API (`/api/videos/*`)
```javascript
// GET /api/videos                // List videos
// GET /api/videos/:id            // Get video details
// POST /api/videos/upload        // Upload video (multipart/form-data)
// DELETE /api/videos/:id          // Delete video
```

### React Query Integration
```javascript
// Custom hooks for data fetching
// Automatic caching and refetching
// Loading and error states
// Mutation support for CRUD operations
```

## 🎯 Environment Configuration

### Development (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_APP_NAME=GymXFit Admin
VITE_APP_VERSION=1.0.0
```

### Production (`.env.production`)
```env
VITE_API_BASE_URL=https://be.phongnguyen.software
VITE_API_TIMEOUT=10000
VITE_APP_NAME=GymXFit Admin
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment

### Build Commands
```bash
# Development build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Additional Features Suggestions

### 1. **Enhanced Analytics**
```javascript
// Recharts integration for dashboard
// Monthly enrollment trends
// Class popularity metrics
// Revenue tracking
// Staff performance metrics
```

### 2. **Advanced File Management**
```javascript
// Video upload with progress bars
// Multiple file upload support
// Image optimization
// Cloud storage integration
```

### 3. **Role Management**
```javascript
// Multiple admin roles (super-admin, staff, manager)
// Permission-based access control
// Role assignment interface
```

### 4. **Audit System**
```javascript
// Admin action logging
// Change history tracking
// Security event monitoring
// Export audit reports
```

### 5. **Communication Features**
```javascript
// In-app notifications
// Email/SMS templates
// Class reminder system
// Staff messaging
```

### 6. **Enhanced Search & Filtering**
```javascript
// Advanced class search
// Date range filtering
// Multi-category selection
// Saved search presets
```

### 7. **Bulk Operations**
```javascript
// Bulk class creation
// Mass enrollment management
// Batch staff operations
// Export/import functionality
```

## 🛠️ Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Tailwind CSS for styling (avoid inline styles)
- Consistent error handling
- Proper TypeScript (when migrated)

### File Organization
- Group related files in folders
- Use index.js for clean imports
- Keep components focused and reusable
- Separate API logic from UI

### Performance
- Lazy loading for large components
- React Query for efficient data fetching
- Optimize images and assets
- Use React.memo for expensive components

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check backend is running
   - Verify environment variables
   - Check CORS configuration

2. **Authentication Issues**
   - Clear localStorage
   - Check JWT token format
   - Verify API secret

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies installed

4. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check for conflicting CSS
   - Ensure responsive breakpoints

### Development Tips
- Use React Query Devtools for debugging
- Test dark/light mode toggle
- Test responsive design on mobile
- Verify protected routes work correctly

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request with description

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for GymXFit Admin Dashboard**# webadmin-gymxfit
