# ShopEase – Indian Department Store (MERN + Razorpay)

ShopEase is a full-stack e‑commerce web app for an Indian department store, built with the **MERN stack** and a modern **Vite + React** frontend.  
It supports product management, shopping cart, order tracking, and **Razorpay** payments.

---

## Features

- **Customer side**
  - 🛍️ Browse products by category, search, sort (price low/high, newest)
  - 🛒 Persistent cart with quantity management
  - 👤 User registration & login (JWT-based)
  - 📦 View past orders and order details
  - 💳 Secure checkout via **Razorpay** (test/live keys)

- **Admin side**
  - 📊 Dashboard with key stats (products, orders, revenue)
  - 📦 Product CRUD (add/edit/delete)
    - Image upload via **Cloudinary**
    - Optional camera capture for product image
    - Categories, tags, units, stock management
  - 🧾 Order management: view all orders, update status (pending/confirmed/delivered/cancelled)

- **General**
  - 🎨 Modern, responsive UI with animations and hover effects
  - 🌐 RESTful API with Express + MongoDB (Mongoose)
  - 🔐 JWT authentication & role-based access (admin / customer)

---

## Tech Stack

### Frontend

- **React 18** + **Vite**
- **React Router v6**
- **Tailwind CSS**
- **Axios**
- **React Hot Toast**

### Backend

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT** for auth
- **Razorpay** Node SDK
- **Cloudinary** for image storage
- **Multer** for file uploads
- **express-validator** for validation

---

## Project Structure

```bash
SHOPEASE/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary + multer config
│   ├── controllers/
│   │   └── adminController.js   # Admin dashboard stats
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT auth + admin check
│   ├── models/
│   │   ├── User.js              # User schema (customer/admin)
│   │   ├── Product.js           # Product schema
│   │   └── Order.js             # Order schema
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── productRoutes.js     # /api/products
│   │   ├── orderRoutes.js       # /api/orders
│   │   ├── adminRoutes.js       # /api/admin
│   │   └── paymentRoutes.js     # /api/payment (Razorpay)
│   ├── scripts/
│   │   ├── createAdmin.js
│   │   ├── resetAdminPassword.js
│   │   └── checkEnv.js
│   └── server.js                # Express app entrypoint
│
├── frontend/
│   ├── index.html               # Vite entry HTML
│   ├── vite.config.js           # Vite config + dev proxy
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx             # React root render
│       ├── App.jsx              # Routes setup
│       ├── index.css            # Tailwind + custom styles/animations
│       ├── utils/
│       │   └── axios.js         # Axios instance with baseURL + interceptors
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── components/
│       │   ├── customer/
│       │   │   ├── CustomerLayout.jsx
│       │   │   ├── Navbar.jsx
│       │   │   └── Footer.jsx
│       │   ├── admin/
│       │   │   └── AdminLayout.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── auth/
│           │   ├── Login.jsx
│           │   └── Register.jsx
│           ├── customer/
│           │   ├── Home.jsx
│           │   ├── Products.jsx
│           │   ├── Cart.jsx
│           │   └── Orders.jsx
│           └── admin/
│               ├── AdminDashboard.jsx
│               ├── AdminProducts.jsx
│               └── AdminOrders.jsx
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Core
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Cloudinary (choose either individual vars OR CLOUDINARY_URL)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS / URLs
FRONTEND_URL=https://your-frontend-domain.com

# Port (Render will override with its own PORT)
PORT=5000

# Environment
NODE_ENV=development
```

### Frontend (`frontend/.env`)

Use **one** of these (code supports both; prefer `VITE_API_URL`):

```env
# Recommended
VITE_API_URL=https://your-backend-domain.com/api

# Legacy/alternative (also supported)
VITE_BACKEND_URL=https://your-backend-domain.com
```

On production (Vercel / Render), these should be set in their respective dashboard UI, not committed.

---

## Running Locally

### 1. Backend

```bash
cd backend
npm install
# create backend/.env and fill variables
npm run dev
```

- Server runs on `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
# create frontend/.env:
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

- Frontend runs on `http://localhost:5173`

---

## NPM Scripts

### Backend (`backend/package.json`)

- `npm run dev` – Start server with nodemon (development)
- `npm start` – Start server with node (production)
- `npm run create-admin` – Create default admin user
- `npm run reset-admin` – Reset admin password
- `npm run check-env` – Check required env vars

### Frontend (`frontend/package.json`)

- `npm run dev` – Vite dev server
- `npm run build` – Production build
- `npm run preview` – Preview built app

---

## API Overview

### Auth

- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login, returns JWT + user info

### Products

- `GET /api/products` – List products (supports `category`, `search`, `sort`)
- `GET /api/products/:id` – Get single product
- `POST /api/products` – Create product (admin, multipart/form-data)
- `PUT /api/products/:id` – Update product (admin, multipart/form-data)
- `DELETE /api/products/:id` – Delete product (admin)

### Orders

- `GET /api/orders` – Get current user’s orders
- `DELETE /api/orders/:id` – Cancel order (user logic on status)
- `GET /api/orders/all` – Admin: get all orders
- `PUT /api/orders/:id` – Admin: update order status

### Admin

- `GET /api/admin/dashboard` – Stats: total products, orders, pending orders, revenue

### Payments (Razorpay)

- `POST /api/payment/create-order`
  - Validates cart products & stock
  - Creates Razorpay order and returns `{ orderId, amount, currency, key }`
- `POST /api/payment/verify`
  - Verifies Razorpay signature
  - Creates `Order` in DB and updates stock
  - Links order to user

---

## Auth & Roles

- **JWT** stored in localStorage
- Axios interceptor adds `Authorization: Bearer <token>`
- `authMiddleware.authenticate` validates token
- `authMiddleware.isAdmin` enforces admin-only routes
- Frontend `ProtectedRoute` + `AuthContext` handle:
  - `isAuthenticated`
  - `isAdmin`
  - Redirects for protected/admin routes

---

## Default Admin (development)

In `server.js`, on startup:

- Ensures there is an admin user:
  - Email: `arunrealm2005@gmail.com`
  - Password: `arun2005`

**Important:** Change or remove this logic for production.

---

## Deployment Notes

Typical setup:

- **Backend**: Render / Railway / any Node host
  - Set all backend `.env` variables in the host
  - `FRONTEND_URL` must be your deployed frontend origin (no trailing slash)

- **Frontend**: Vercel / Netlify
  - Set `VITE_API_URL` to `https://your-backend-domain.com/api`

CORS is configured to:

- Allow `http://localhost:5173` in development
- In production, only allow origins listed in `FRONTEND_URL` (comma-separated, no trailing slash)

---

## License

ISC

---

## Author

ShopEase – built with MERN, Razorpay, and a modern Vite + React frontend.

