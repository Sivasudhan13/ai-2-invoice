# Frontend Deployment Configuration

## Backend URL Configuration

The frontend has been configured to use your deployed backend at:
**https://ai-invoice-2f1n.onrender.com**

## Configuration Files

### 1. Environment Variables
- **`frontend/.env`** - Contains the production backend URL
- **`frontend/.env.example`** - Template for local development

### 2. API Configuration
- **`frontend/src/config/api.js`** - Centralized API configuration module

## How It Works

All API calls now use the `getApiUrl()` helper function which automatically:
- Uses `VITE_API_URL` from environment variables in production
- Falls back to `http://localhost:5000` for local development

## Deployment Steps

### For Production (Vercel, Netlify, etc.)

1. Set the environment variable in your hosting platform:
   ```
   VITE_API_URL=https://ai-invoice-2f1n.onrender.com
   ```

2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy the `dist` folder to your hosting platform

### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` to use localhost:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables by Platform

### Vercel
Add in Project Settings → Environment Variables:
```
VITE_API_URL=https://ai-invoice-2f1n.onrender.com
```

### Netlify
Add in Site Settings → Environment Variables:
```
VITE_API_URL=https://ai-invoice-2f1n.onrender.com
```

### Render
Add in Environment → Environment Variables:
```
VITE_API_URL=https://ai-invoice-2f1n.onrender.com
```

## Testing

To test the configuration locally with the deployed backend:

1. Update `frontend/.env`:
   ```
   VITE_API_URL=https://ai-invoice-2f1n.onrender.com
   ```

2. Restart the dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 and test the application

## Important Notes

- The `.env` file is gitignored for security
- Always use `.env.example` as a template
- Environment variables must start with `VITE_` to be exposed to the frontend
- Changes to `.env` require restarting the dev server
- For production builds, set environment variables in your hosting platform

## Troubleshooting

### CORS Errors
Ensure your backend at `https://ai-invoice-2f1n.onrender.com` has CORS configured to allow requests from your frontend domain.

### API Not Found (404)
Verify the backend URL is correct and the backend is running.

### Environment Variable Not Working
- Ensure the variable starts with `VITE_`
- Restart the dev server after changing `.env`
- For production, rebuild the application after setting environment variables
