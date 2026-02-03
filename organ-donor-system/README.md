# 🫀 Organ Donor Registration System

A production-grade, secure, and scalable organ donor management platform built with the MERN stack.

## 🚀 Features

- **Role-Based Access Control**: Separate dashboards for Donors, Hospitals, and Admins
- **Smart Matching Algorithm**: Blood group compatibility & location-based matching
- **Secure Authentication**: JWT with refresh tokens, HTTP-only cookies
- **Real-time Notifications**: Email alerts for important events
- **Modern UI/UX**: Glassmorphism, dark mode, smooth animations
- **Document Upload**: Cloudinary integration for ID proofs
- **Analytics Dashboard**: Comprehensive statistics and insights
- **Audit Logging**: Complete system activity tracking

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image uploads)
- Nodemailer (email notifications)
- bcrypt (password hashing)

### Frontend
- React.js (Vite)
- Tailwind CSS
- ShadCN UI Components
- Framer Motion (animations)
- React Query (data fetching)
- React Hook Form + Zod (validation)

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (Atlas or local installation)
- Cloudinary account
- Email service (Gmail/SendGrid)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd organ-donor-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create `.env` file in `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

Access the application at `http://localhost:5173`

## 👥 User Roles

### 🧍 Donor
- Register with medical details
- Upload ID proof
- Select organs for donation
- Manage consent
- View donation status

### 🏥 Hospital
- Register hospital profile
- Request organs
- View matched donors
- Track request status

### 🛡️ Admin
- Verify donors & hospitals
- View analytics dashboard
- Manage system settings
- Access audit logs

## 📁 Project Structure

```
organ-donor-system/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── public/
└── README.md
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT with HTTP-only cookies
- Role-based authorization
- Input validation & sanitization
- Rate limiting
- CORS configuration
- Audit logging

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Donor
- `GET /api/donor/profile` - Get donor profile
- `PUT /api/donor/profile` - Update donor profile
- `POST /api/donor/consent` - Manage consent

### Hospital
- `POST /api/hospital/request` - Create organ request
- `GET /api/hospital/requests` - Get all requests
- `GET /api/hospital/matches/:requestId` - Get matched donors

### Admin
- `GET /api/admin/analytics` - Get system analytics
- `PUT /api/admin/verify/:userId` - Verify user
- `GET /api/admin/audit-logs` - Get audit logs

## 🎨 UI Features

- Responsive design (mobile-first)
- Dark mode support
- Glassmorphism effects
- 3D hover effects on organ cards
- Smooth page transitions
- Animated statistics
- Toast notifications
- Skeleton loaders

## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ for saving lives
