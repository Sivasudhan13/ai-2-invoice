# 🧾 Invoice OCR Application

AI-powered invoice processing system with OCR, fraud detection, and analytics.

## 🌟 Features

- **AI-Powered OCR**: Extract data from invoices using Google Gemini AI
- **Multi-Format Support**: Process PDF, JPEG, PNG images
- **Fraud Detection**: AI-based anomaly and fraud detection
- **Confidence Scoring**: Real-time confidence scores for extracted data
- **User Management**: Organization admin, supplier, and mentor roles
- **Analytics Dashboard**: Comprehensive invoice analytics and insights
- **History Tracking**: Complete audit trail of all processed invoices
- **Real-time Alerts**: Automated fraud and anomaly alerts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd invoice-ocr
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📦 Production Deployment

### Quick Deploy (5 minutes)

See [QUICK-PRODUCTION-DEPLOY.md](QUICK-PRODUCTION-DEPLOY.md) for fastest deployment.

### Comprehensive Guide

See [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md) for detailed deployment instructions.

### Deployment Checklist

Use [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) to ensure everything is configured correctly.

### Current Production URLs

- **Backend**: https://ai-invoice-2f1n.onrender.com
- **Frontend**: Deploy to Vercel/Netlify (see guides above)

## 🏗️ Architecture

### Backend (Node.js/Express)
- RESTful API
- JWT authentication
- MongoDB database
- Google Gemini AI integration
- File upload handling
- CORS configuration

### Frontend (React/Vite)
- Modern React with hooks
- React Router for navigation
- Axios for API calls
- Recharts for analytics
- Responsive design

### Database (MongoDB)
- User management
- Invoice storage
- History tracking
- Alert system
- Organization management

## 📁 Project Structure

```
invoice-ocr/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error handling
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── utils/       # Utility functions
│   │   └── config/      # API configuration
│   └── index.html
└── docs/                # Documentation
```

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invoice-ocr
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🛠️ Development Scripts

### Backend
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5000/health
```

### Test API Endpoints
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Upload Invoice (requires token)
curl -X POST http://localhost:5000/api/invoice/extract \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@invoice.pdf"
```

## 👥 User Roles

### Organization Admin
- Manage users (suppliers, mentors)
- View all invoices
- Access analytics dashboard
- Manage alerts

### Supplier
- Upload invoices
- View own invoices
- Track processing status
- View analytics

### Mentor
- Review invoices
- Provide guidance
- Access analytics

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- File upload validation
- Rate limiting
- Input sanitization
- Environment variable protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Invoice Processing
- `POST /api/invoice/extract` - Upload and extract invoice
- `POST /api/invoice/upload` - Upload invoice
- `GET /api/invoice/supplier/stats` - Get supplier statistics

### History
- `GET /api/history` - Get user's invoice history
- `DELETE /api/history/:id` - Delete invoice

### Organization
- `GET /api/organization/users` - Get organization users
- `POST /api/organization/supplier` - Create supplier
- `POST /api/organization/mentor` - Create mentor
- `GET /api/organization/analytics` - Get analytics
- `GET /api/organization/alerts` - Get alerts
- `GET /api/organization/invoices` - Get all invoices

## 🎨 UI Features

- Modern glassmorphism design
- Responsive layout
- Dark mode support
- Interactive charts
- Real-time updates
- Drag-and-drop file upload
- Inline editing
- Modal dialogs

## 🐛 Troubleshooting

### CORS Errors
Ensure `FRONTEND_URL` in backend matches your frontend URL exactly.

### Database Connection Failed
Check MongoDB is running and `MONGODB_URI` is correct.

### File Upload Failed
Verify file size is under `MAX_FILE_SIZE` and file type is allowed.

### API Not Found
Ensure backend is running and `VITE_API_URL` is set correctly.

## 📚 Documentation

- [Quick Start Guide](START-HERE.md)
- [Production Deployment](PRODUCTION-DEPLOYMENT.md)
- [Quick Production Deploy](QUICK-PRODUCTION-DEPLOY.md)
- [Production Checklist](PRODUCTION-CHECKLIST.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [API Routes Reference](ROUTES-QUICK-REFERENCE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for OCR capabilities
- MongoDB for database
- React and Vite for frontend framework
- Express.js for backend framework

## 📞 Support

For issues and questions:
- Check documentation in `/docs`
- Review troubleshooting guides
- Open an issue on GitHub

## 🎉 Live Demo

- **Backend API**: https://ai-invoice-2f1n.onrender.com
- **Frontend**: Deploy your own (see deployment guides)

---

Made with ❤️ for efficient invoice processing
