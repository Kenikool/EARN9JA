# Authentication API Testing Guide

## Base URL
```
http://localhost:8081/api/auth
```

## Test Endpoints

### 1. Register User
**POST** `/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Expected Response (201):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "",
  "bio": "",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Tests:**
- ❌ Name too short (< 2 chars)
- ❌ Name too long (> 50 chars)
- ❌ Invalid email format
- ❌ Password too short (< 6 chars)
- ❌ Password without number
- ❌ Password without uppercase
- ❌ Password without lowercase
- ❌ Duplicate email

---

### 2. Login User
**POST** `/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Expected Response (200):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "",
  "bio": "",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Tests:**
- ❌ Wrong email (401)
- ❌ Wrong password (401)
- ❌ Missing email (400)
- ❌ Missing password (400)

---

### 3. Get Current User
**GET** `/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "",
  "bio": "",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Tests:**
- ❌ No token (401)
- ❌ Invalid token (401)
- ❌ Expired token (401)

---

### 4. Update Profile
**PUT** `/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Request Body:**
```json
{
  "name": "John Updated",
  "bio": "Software Developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Expected Response (200):**
```json
{
  "_id": "...",
  "name": "John Updated",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Software Developer",
  "role": "user"
}
```

**Validation Tests:**
- ❌ Bio too long (> 500 chars)
- ❌ Invalid avatar URL
- ❌ No token (401)

---

### 5. Get User by ID (Public Profile)
**GET** `/users/:id`

**Example:**
```
GET /users/507f1f77bcf86cd799439011
```

**Expected Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Software Developer",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Tests:**
- ❌ Invalid user ID (404)

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8081/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile
```bash
curl -X PUT http://localhost:8081/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Updated",
    "bio": "Software Developer"
  }'
```

---

## Testing with Postman

1. **Create a new collection** called "Blog Platform Auth"

2. **Add environment variables:**
   - `base_url`: `http://localhost:8081/api/auth`
   - `token`: (will be set automatically)

3. **Register endpoint:**
   - Method: POST
   - URL: `{{base_url}}/register`
   - Body: raw JSON
   - Tests tab: Save token to environment
   ```javascript
   pm.environment.set("token", pm.response.json().token);
   ```

4. **Login endpoint:**
   - Method: POST
   - URL: `{{base_url}}/login`
   - Body: raw JSON
   - Tests tab: Save token
   ```javascript
   pm.environment.set("token", pm.response.json().token);
   ```

5. **Protected endpoints:**
   - Authorization tab: Bearer Token
   - Token: `{{token}}`

---

## Security Features Implemented

✅ **Password Hashing**
- Bcrypt with salt rounds
- Passwords never stored in plain text

✅ **JWT Authentication**
- Secure token generation
- Token expiration (7 days default)
- Token verification middleware

✅ **Input Validation**
- Email format validation
- Password strength requirements
- Name length validation
- Bio length limits

✅ **Input Sanitization**
- XSS prevention
- Script injection prevention
- HTML tag removal

✅ **Authorization**
- Protected routes middleware
- Admin role checking
- Optional authentication

✅ **Error Handling**
- Proper error messages
- No sensitive data leakage
- Validation error details

---

## Common Issues & Solutions

### Issue: "User already exists"
**Solution:** Use a different email or delete the existing user from MongoDB

### Issue: "Invalid email or password"
**Solution:** Check credentials, ensure password meets requirements

### Issue: "Not authorized, no token"
**Solution:** Include Authorization header with Bearer token

### Issue: "Token expired"
**Solution:** Login again to get a new token

### Issue: "Validation failed"
**Solution:** Check the errors array in response for specific validation issues

---

## Next Steps

After testing authentication:
1. ✅ All endpoints working
2. ✅ Validation working
3. ✅ Token generation/verification working
4. ✅ Password hashing working
5. ➡️ Ready for Phase 3: Image Upload Setup
