# NOHVA Clothing Website

A modern e-commerce website for architectural fashion.

## Database Options

This app supports multiple database backends:

### Firebase (Default)
- Set `useFirebase = true` in `js/db.js`
- Add your Firebase config keys to the `firebaseConfig` object
- No server required, works with static hosting

### MongoDB
- Set `useFirebase = false` in `js/db.js`
- Requires Node.js server running
- Better for complex queries and local development

## Setup

### For Firebase:
1. Get Firebase config from Firebase Console
2. Update `firebaseConfig` in `js/db.js`
3. Open `index.html` directly in browser

### For MongoDB:
1. Install Node.js and MongoDB locally, or use MongoDB Atlas
2. Install dependencies: `npm install`
3. Update `.env` with MongoDB URI
4. Start server: `npm start`
5. Open `http://localhost:3000/index.html`

## Features

- Product catalog with categories
- Shopping cart with local storage
- Admin panel for managing products
- Responsive design with Tailwind CSS

## API Endpoints (MongoDB mode)

- GET /api/products - Get all products
- POST /api/products - Add a new product
- DELETE /api/products/:id - Delete a product

## Development

For development with MongoDB:
```
npm run dev
```

This uses nodemon for auto-restart.