# SmartSeason Field Monitoring System

A web application for tracking crop progress across multiple fields during a growing season. The system supports two user roles: Administrators (Coordinators) and Field Agents, with role-based access control and field assignment management.

## Features

- **User Authentication**: Secure login system with role-based access control
- **Field Management**: Create, assign, and manage crop fields
- **Field Updates**: Track field progression through growth stages (Planted → Growing → Ready → Harvested)
- **Status Tracking**: Automatic and manual status management (Active, At Risk, Completed)
- **Dashboard**: Role-specific views for administrators and field agents
- **Responsive UI**: Clean, intuitive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

### Backend
- **Node.js + Express** - Server framework
- **SQLite** - Database
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database with demo data:
   ```bash
   npm run setup
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The server will run on `http://localhost:5000`

### Frontend Setup

1. From the root directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Environment Configuration

Create a `.env.local` file in the frontend root (optional):
```
VITE_API_URL=http://localhost:5000/api
```

## Demo Credentials

The system comes pre-populated with demo users:

**Admin:**
- Email: `admin@smartseason.com`
- Password: `admin123`

**Field Agent:**
- Email: `agent@smartseason.com`
- Password: `agent123`

## Design Decisions

### 1. Simplified Data Model
- **Choice**: Single `fields` table with direct status and notes columns
- **Rationale**: Reduces complexity while maintaining all core functionality. Status is computed based on field stage and timestamps, keeping the system maintainable and performant for the scope of this project.

### 2. Status Logic
The system automatically calculates field status based on:
- **Completed**: When stage is "Ready" or "Harvested"
- **At Risk**: When a field hasn't been updated in 2+ weeks OR was planted 3+ weeks ago but still in "Planted" stage
- **Active**: All other cases

Admins can see all fields regardless of status; Agents can only see fields assigned to them.

### 3. Field Assignment
- Fields are created unassigned by default
- Only admins can assign fields to agents
- Agents can only update fields assigned to them
- Assignment is optional - unassigned fields can still be managed

### 4. Role-Based Access Control
Two roles with distinct permissions:
- **Admin**: Create fields, assign agents, view all fields and dashboards
- **Agent**: View assigned fields, update field stages and notes

### 5. Authentication
- JWT tokens for stateless authentication
- 24-hour token expiration
- Tokens stored in localStorage for persistence across sessions

### 6. API Design
- RESTful endpoints with clear resource hierarchy
- Consistent error response format with descriptive messages
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### 7. Frontend Architecture
- Component-based with React hooks for state management
- Protected routes requiring authentication and role verification
- Service layer for API calls with centralized configuration
- Auth context for global user state management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Fields
- `GET /api/fields` - Get all fields (admin) or assigned fields (agent)
- `POST /api/fields` - Create new field (admin only)
- `GET /api/fields/:id` - Get field details
- `PUT /api/fields/:id` - Update field (stage, notes)
- `PUT /api/fields/:id/assign` - Assign field to agent (admin only)
- `GET /api/fields/agent/assigned` - Get fields assigned to current agent

### Agents
- `GET /api/auth/agents` - Get list of field agents (admin only)

## User Workflows

### Admin Workflow
1. Login with admin credentials
2. View dashboard showing all fields with status breakdown
3. Create new fields
4. Assign fields to agents
5. Monitor field progress and updates
6. View agent activity

### Field Agent Workflow
1. Login with agent credentials
2. View dashboard showing assigned fields
3. Access individual field details
4. Update field stage as crop progresses
5. Add observation notes
6. Track field history

## Database Schema

### Users Table
```sql
users (id, email, password, role, name, created_at)
```

### Fields Table
```sql
fields (id, name, crop_type, planting_date, current_stage, status, 
        assigned_to, notes, created_at, last_updated)
```

## Assumptions & Limitations

1. **Single tenant**: System serves one organization
2. **SQLite database**: Suitable for development; consider PostgreSQL for production
3. **Field stages**: Fixed stages (Planted, Growing, Ready, Harvested) - can be extended
4. **No edit history**: Field updates use notes; full history not tracked separately
5. **No notifications**: Real-time alerts not implemented
6. **Simple UI**: Focus on functionality over advanced styling

## Future Enhancements

- Weather integration for at-risk prediction
- Photo/media uploads for field documentation
- Historical data export
- Mobile app version
- Real-time notifications
- Advanced analytics and reporting
- Multi-language support
- Soil data integration
- Pest/disease tracking

## Project Structure

```
crops/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── fieldController.js
│   ├── db/
│   │   ├── connection.js
│   │   ├── init.js
│   │   ├── schema.sql
│   │   └── crops.db
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── fields.js
│   ├── package.json
│   └── server.js
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AgentDashboard.jsx
│   │   ├── FieldDetail.jsx
│   │   └── CreateField.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── authContext.js
│   ├── App.jsx
│   ├── main.jsx
│   └── App.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Development Notes

- The application uses async/await for all async operations
- Error handling is consistent across all API endpoints
- Timestamps use ISO 8601 format for consistency
- All passwords are hashed with bcrypt (salt rounds: 10)
- CORS is enabled for all origins in development (restrict in production)

## Testing

To test the system:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Login with demo credentials
4. Create fields as admin
5. Assign to agents
6. Update field stages and notes as agent
7. Monitor changes on admin dashboard

## License

Built as a demo for field monitoring and crop tracking.

## Support

For issues or questions, refer to the code comments and error messages in the application.
