# 📚 PrimePC Backend API Documentation

## 🔗 Base URL
```
http://localhost:5000
```

## 📊 API Structure

### ✅ Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### ❌ Error Response Format
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🔐 Authentication APIs

### 1. Register (สมัครสมาชิก)
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "0812345678",
  "address": "123 Street, Bangkok"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Register successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login (เข้าสู่ระบบ)
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Profile (ดูข้อมูลโปรไฟล์)
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "0812345678",
    "address": "123 Street, Bangkok",
    "role": "CUSTOMER",
    "createdAt": "2026-07-12T10:00:00.000Z"
  }
}
```

---

### 4. Update Profile (แก้ไขโปรไฟล์)
**PUT** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "0898765432",
  "address": "456 New Street, Bangkok"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Updated",
    "phone": "0898765432",
    "address": "456 New Street, Bangkok"
  }
}
```

---

## 🛍️ Product APIs

### 5. Get All Products (ดูสินค้าทั้งหมด)
**GET** `/api/products`

**Query Parameters:**
- `page` (optional, default: 1) - หน้าที่ต้องการ
- `limit` (optional, default: 12) - จำนวนสินค้าต่อหน้า
- `category` (optional) - กรองตามหมวดหมู่ (CPU, GPU, RAM, Motherboard, Storage)
- `search` (optional) - ค้นหาจากชื่อหรือคำอธิบาย

**Example:**
```
GET /api/products?page=1&limit=12&category=GPU&search=nvidia
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "NVIDIA RTX 4090",
      "description": "Ultimate Gaming Graphics Card 24GB",
      "price": 65900,
      "stock": 8,
      "imageUrl": "https://images.unsplash.com/photo-...",
      "category": "GPU",
      "brand": "NVIDIA",
      "isAvailable": true,
      "createdAt": "2026-07-12T03:51:40.191Z",
      "updatedAt": "2026-07-12T03:51:40.191Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 12,
    "totalPages": 2
  }
}
```

---

### 6. Get Product by ID (ดูสินค้าแบบละเอียด)
**GET** `/api/products/:id`

**Example:**
```
GET /api/products/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "NVIDIA RTX 4090",
    "description": "Ultimate Gaming Graphics Card 24GB",
    "price": 65900,
    "stock": 8,
    "imageUrl": "https://images.unsplash.com/photo-...",
    "category": "GPU",
    "brand": "NVIDIA",
    "isAvailable": true,
    "createdAt": "2026-07-12T03:51:40.191Z",
    "updatedAt": "2026-07-12T03:51:40.191Z"
  }
}
```

---

### 7. Create Product (สร้างสินค้าใหม่) 🔒 ADMIN/STAFF
**POST** `/api/products`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 9999,
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg",
  "category": "CPU",
  "brand": "Intel"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 21,
    "name": "New Product",
    "price": 9999,
    "stock": 50,
    "category": "CPU",
    "isAvailable": true
  }
}
```

---

### 8. Update Product (แก้ไขสินค้า) 🔒 ADMIN/STAFF
**PUT** `/api/products/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 12999,
  "stock": 30
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Product Name",
    "price": 12999,
    "stock": 30
  }
}
```

---

### 9. Delete Product (ลบสินค้า) 🔒 ADMIN
**DELETE** `/api/products/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🛒 Cart APIs

### 10. Get Cart (ดูตะกร้าสินค้า) 🔒 Authenticated
**GET** `/api/cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "items": [
      {
        "id": 1,
        "productId": 5,
        "quantity": 2,
        "product": {
          "id": 5,
          "name": "NVIDIA RTX 4090",
          "price": 65900,
          "imageUrl": "https://images.unsplash.com/photo-...",
          "stock": 8
        }
      }
    ],
    "totalItems": 2,
    "totalPrice": 131800
  }
}
```

---

### 11. Add to Cart (เพิ่มสินค้าเข้าตะกร้า) 🔒 Authenticated
**POST** `/api/cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": 5,
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product added to cart",
  "data": {
    "cartItemId": 1,
    "productId": 5,
    "quantity": 2
  }
}
```

---

### 12. Update Cart Item (แก้ไขจำนวนสินค้า) 🔒 Authenticated
**PUT** `/api/cart/:itemId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "itemId": 1,
    "quantity": 3
  }
}
```

---

### 13. Remove from Cart (ลบสินค้าออกจากตะกร้า) 🔒 Authenticated
**DELETE** `/api/cart/:itemId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 14. Clear Cart (ล้างตะกร้าทั้งหมด) 🔒 Authenticated
**DELETE** `/api/cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## 🔑 User Roles

| Role | Description |
|------|-------------|
| `CUSTOMER` | ลูกค้าทั่วไป - ซื้อสินค้า, จัดการตะกร้า |
| `STAFF` | พนักงาน - จัดการสินค้า (เพิ่ม/แก้ไข) |
| `ADMIN` | ผู้ดูแลระบบ - จัดการทุกอย่าง (รวมลบสินค้า) |

---

## 🔒 Security Features

### 1. JWT Authentication
- Token expires in 7 days
- Bearer token required in Authorization header

### 2. Rate Limiting
- 100 requests per 15 minutes per IP

### 3. CORS
- Enabled for `http://localhost:5173` (Frontend)

### 4. Password Security
- bcrypt hashing (10 rounds)

### 5. Input Validation
- Email format validation
- Password minimum 6 characters
- Stock cannot be negative

---

## ⚙️ Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
```

---

## 🧪 Testing Credentials

### Admin Account
```
Email: admin@primepc.com
Password: (ดู bcrypt hash ใน database)
```

### Staff Account
```
Email: staff@primepc.com
Password: (ดู bcrypt hash ใน database)
```

---

## 📦 Product Categories

1. **CPU** - Processors (Intel, AMD)
2. **GPU** - Graphics Cards (NVIDIA, AMD)
3. **RAM** - Memory (Corsair, G.SKILL, Kingston)
4. **Motherboard** - Mainboards (ASUS, MSI, Gigabyte)
5. **Storage** - SSDs (Samsung, WD, Crucial, Kingston)

---

## 🚀 Running the Server

```bash
cd backend
npm install
npm run dev
```

Server will start at: `http://localhost:5000`

API Documentation (Swagger): `http://localhost:5000/api-docs`
