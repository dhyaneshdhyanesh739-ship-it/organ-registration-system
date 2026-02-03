# 🚀 Quick Start Guide

## Installation

### 1. Install Root Dependencies
```bash
cd e:\kiddo\organ-donor-system
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
```

## Configuration

### Backend (.env)
Create `server/.env` from `server/.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Choose one:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/organ-donor-system

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organ-donor-system

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this

# Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Option 1: Run Both (Recommended)
From root directory:
```bash
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## First Steps

1. **Register an Admin:**
   - Go to http://localhost:5173/register
   - Select "admin" role
   - Fill in details and register

2. **Register a Donor:**
   - Register with "donor" role
   - Login and access donor dashboard

3. **Register a Hospital:**
   - Register with "hospital" role
   - Login and access hospital dashboard

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if local)
- Check MongoDB URI in `.env`
- For Atlas, whitelist your IP address

### Email Not Sending
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" or use OAuth2
- Check EMAIL_* variables in `.env`

### Cloudinary Upload Fails
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure file type is image or PDF

### Port Already in Use
- Change PORT in `server/.env`
- Kill process using port: `npx kill-port 5000`

## Development Tips

- Backend auto-restarts with nodemon
- Frontend hot-reloads with Vite
- Check browser console for errors
- Check terminal for server errors
- Use dark mode toggle in navbar

## Project Structure
```
organ-donor-system/
├── server/              # Backend
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, etc.
│   ├── utils/           # Helpers
│   └── server.js        # Entry point
├── client/              # Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   ├── services/    # API calls
│   │   └── App.jsx      # Main app
│   └── index.html       # HTML entry
└── README.md            # Documentation
```

## Need Help?

Check the full [walkthrough.md](file:///C:/Users/DHYANESH/.gemini/antigravity/brain/5a92779f-61ba-410f-b4dc-e210235dde1e/walkthrough.md) for detailed documentation.
