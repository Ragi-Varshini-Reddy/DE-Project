# E-commerce Backend API (MongoDB)

Backend for a product catalog with flexible documents, CRUD endpoints, and sales analytics.

## Setup

1. Install dependencies: `npm install`
2. Run the API: `npm run dev`

## Basic UI

Run the UI: `npm run ui` (serves on `http://localhost:5173`). Set the API base URL to `http://localhost:3000`.

## API

### Products
- `POST /api/products`
- `GET /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Orders (sales data)
- `POST /api/orders`
- `GET /api/orders`

### Analytics
- `GET /api/analytics/sales-by-day?start=2024-01-01&end=2024-12-31`
- `GET /api/analytics/top-products?limit=10`
- `GET /api/analytics/revenue-trend`
