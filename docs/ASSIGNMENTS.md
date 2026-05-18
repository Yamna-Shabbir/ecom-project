# Assignment Mapping and Folder Organization

This project is organized by feature modules across backend routes/models and frontend pages/components.

## Assignment 2: Dashboard + SEO (On-page)

- Backend SEO fields in `backend/models/Product.js`:
  - `seoTitle`, `seoDescription`, `seoKeywords`, `metaRobots`, `slug`
  - plus discovery fields: `category`, `brand`, `rating`
- Security and SEO headers with Helmet in `backend/server.js`
- Frontend on-page SEO tags via `frontend/src/components/SeoHead.js` (react-helmet)
- SEO-enabled pages:
  - `frontend/src/pages/Home.js`
  - `frontend/src/pages/Shop.js`
  - `frontend/src/pages/Dashboard.js`
  - `frontend/src/pages/MyOrders.js`
  - `frontend/src/pages/ManageProducts.js`
  - `frontend/src/pages/ProductDetails.js`

## Assignment 3: Admin Dashboard + E-Commerce Operations

- Admin auth/role routes:
  - `frontend/src/components/AdminRoute.js`
  - `frontend/src/components/BuyerRoute.js`
- Product CRUD + SEO editing:
  - Backend: `backend/routes/productRoutes.js`
  - Frontend: `frontend/src/pages/ManageProducts.js`
- Admin analytics and control:
  - `frontend/src/pages/Dashboard.js`
  - `frontend/src/pages/AdminOrders.js`
  - `frontend/src/pages/AdminUsers.js`
- Buyer flows:
  - signup/signin: `frontend/src/pages/Register.js`, `frontend/src/pages/Login.js`
  - cart/checkout: `frontend/src/pages/Cart.js` + Stripe endpoint in `backend/routes/orderRoutes.js`
  - wishlist: `frontend/src/pages/Wishlist.js` + `backend/routes/wishlistRoutes.js`
  - order management/tracking: `frontend/src/pages/MyOrders.js` + `backend/routes/orderRoutes.js`

## Lab Assignment: Chatbot + AI Agent Features

- Chatbot backend intent engine:
  - `backend/routes/chatbotRoutes.js`
- Chatbot widget in frontend:
  - `frontend/src/components/ChatbotWidget.js`
- Product discovery/search:
  - filter/search API in `backend/routes/productRoutes.js`
  - filter UI in `frontend/src/pages/Shop.js`
- Recommendation engine:
  - "customers also bought" + trending in `backend/routes/productRoutes.js` (`/recommendations`)
- FAQ automation:
  - shipping/returns/payment replies in `backend/routes/chatbotRoutes.js`
- Order tracking support:
  - timeline endpoint `GET /api/orders/:id/tracking` in `backend/routes/orderRoutes.js`
