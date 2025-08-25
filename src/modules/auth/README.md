# Authentication Module

This module provides comprehensive authentication functionality for the Car Parts Shop backend application.

## Features

- **User Registration**: Create new user accounts with role-based access
- **User Login**: Secure authentication with JWT tokens
- **Password Management**: Forgot password, reset password, and change password functionality
- **Token Management**: JWT access tokens and refresh tokens
- **Role-Based Access Control**: Protect routes based on user roles
- **Audit Logging**: Track authentication events for security monitoring
- **Profile Management**: Get and update user profile information

## Endpoints

### Public Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "SALES"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "SALES",
    "isFirstLogin": true
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST `/api/auth/login`
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/forgot-password`
Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password using a valid reset token.

**Request Body:**
```json
{
  "token": "reset_token_uuid",
  "newPassword": "newpassword123"
}
```

### Protected Endpoints

#### POST `/api/auth/change-password`
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

#### POST `/api/auth/logout`
Logout user and invalidate session.

#### GET `/api/auth/profile`
Get current user profile information.

#### GET `/api/auth/test`
Test protected route access.

## Guards

### JwtAuthGuard
Protects routes that require JWT authentication.

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected-route')
getProtectedData() {
  return 'This route is protected';
}
```

### LocalAuthGuard
Protects routes that require username/password authentication.

```typescript
@UseGuards(LocalAuthGuard)
@Post('login')
async login(@Request() req) {
  return this.authService.login(req.user);
}
```

### RolesGuard
Protects routes based on user roles.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.MANAGER)
@Get('admin-only')
getAdminData() {
  return 'Admin only data';
}
```

## User Roles

- `ADMIN`: Full system access
- `MANAGER`: Management-level access
- `DEV`: Developer access
- `SALES`: Sales representative access
- `CUSTOMER`: Customer access

## Environment Variables

Make sure to set the following environment variables:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=car-parts-shop
JWT_AUDIENCE=car-parts-shop-users

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

## Usage Examples

### Protecting Routes with Roles

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRoleEnum } from '../../common/enum/entity.enum';

@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('dashboard')
  getDashboard() {
    return 'Admin dashboard';
  }
}
```

### Getting User from Request

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth';

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Contains user information from JWT
  }
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication with configurable expiration
- **Refresh Tokens**: Long-lived refresh tokens for better user experience
- **Audit Logging**: All authentication events are logged for security monitoring
- **Rate Limiting**: Built-in rate limiting to prevent brute force attacks
- **CORS Protection**: Configurable CORS settings for cross-origin requests

## Error Handling

The module provides comprehensive error handling for various scenarios:

- Invalid credentials
- Expired tokens
- Invalid reset tokens
- User not found
- Duplicate email addresses
- Insufficient permissions

All errors return appropriate HTTP status codes and descriptive error messages.