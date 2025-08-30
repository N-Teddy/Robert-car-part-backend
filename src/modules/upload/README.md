# Upload Module

This module handles image uploads with support for both Cloudinary (production) and local storage (development).

## Features

- **Environment-based storage**: Automatically switches between Cloudinary and local storage
- **File validation**: 5MB limit, image format validation
- **Authentication required**: All endpoints require JWT authentication
- **Role-based access**: Some endpoints require specific roles
- **Organized storage**: Images are organized by type and optional subfolders
- **Database tracking**: All uploads are tracked in the database

## Configuration

### Environment Variables

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=car-parts-shop
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# App Configuration
NODE_ENV=development # or production
APP_BASE_URL=http://localhost:3000
```

### Storage Behavior

- **Development**: Images stored locally in `./uploads/` directory
- **Production**: Images uploaded to Cloudinary

## API Endpoints

### Upload Single Image

```http
POST /upload/image
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Body:
- file: Image file (required)
- type: ImageEnum (required)
- entityId: string (optional)
- entityType: string (optional) - 'user', 'vehicle', 'part'
- folder: string (optional)
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "imageId": "uuid",
    "type": "USER PROFILE",
    "entityId": "uuid",
    "entityType": "user"
  }
}
```

### Upload Multiple Images

```http
POST /upload/image/bulk
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER

Body:
- files: Array of image files (required)
- type: ImageEnum (required)
- entityId: string (optional)
- entityType: string (optional)
- folder: string (optional)
```

### Update Image

```http
PUT /upload/image/:id
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Body:
- file: New image file (required)
- folder: string (optional)
```

### Delete Image

```http
DELETE /upload/image/:id
Authorization: Bearer <jwt_token>
```

### Get Upload Statistics

```http
GET /upload/stats
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER
```

### Get Images by Type

```http
GET /upload/images/:type
Authorization: Bearer <jwt_token>
```

### Get Images by Entity

```http
GET /upload/images/entity/:entityType/:entityId
Authorization: Bearer <jwt_token>
```

## Image Types

The module supports the following image types defined in `ImageEnum`:

- `USER_PROFILE` - User profile images
- `VEHICLE` - Vehicle images
- `PART` - Part images
- `QR_CODE` - QR code images

## File Structure

### Local Development
```
uploads/
├── user-profile/
│   ├── profile-photos/
│   └── avatars/
├── vehicle/
│   ├── exterior/
│   └── interior/
├── part/
│   ├── front-view/
│   └── side-view/
└── qr-code/
    └── generated/
```

### Cloudinary Production
```
car-parts-shop/
├── user-profile/
├── vehicle/
├── part/
└── qr-code/
```

## File Validation

- **Size limit**: 5MB maximum
- **Formats**: jpg, jpeg, png, gif, webp
- **Type validation**: Must match ImageEnum values

## Authentication & Authorization

- **JWT Authentication**: Required for all endpoints
- **Role-based access**: Some endpoints require ADMIN or MANAGER roles
- **User context**: Uploads are associated with authenticated users

## Error Handling

The module provides comprehensive error handling:

- File validation errors
- Storage service errors
- Database errors
- Authentication errors

## Usage Examples

### Frontend Integration

```typescript
// Upload single image
const formData = new FormData();
formData.append('file', imageFile);
formData.append('type', 'USER_PROFILE');
formData.append('entityId', userId);
formData.append('entityType', 'user');

const response = await fetch('/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Upload multiple images
const formData = new FormData();
files.forEach(file => formData.append('files', file));
formData.append('type', 'VEHICLE');
formData.append('entityId', vehicleId);
formData.append('entityType', 'vehicle');

const response = await fetch('/upload/image/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Backend Integration

```typescript
// Inject the service
constructor(private uploadService: UploadService) {}

// Upload image
const result = await this.uploadService.uploadImage(
  file,
  ImageEnum.USER_PROFILE,
  userId,
  'user',
  'profile-photos'
);

// Get images by entity
const images = await this.uploadService.getImagesByEntity(
  userId,
  'user'
);
```

## Security Considerations

- File type validation
- File size limits
- Authentication required
- Role-based access control
- Secure file serving (local development)

## Performance

- **Local storage**: Fast file I/O operations
- **Cloudinary**: CDN distribution, automatic optimization
- **Database**: Efficient queries with proper indexing
- **Caching**: Static file caching for local development

## Monitoring

The module provides statistics and monitoring capabilities:

- Total file count
- Total storage size
- Breakdown by image type
- Storage type information

## Troubleshooting

### Common Issues

1. **File too large**: Ensure file is under 5MB
2. **Invalid file type**: Only image files are allowed
3. **Authentication error**: Ensure valid JWT token
4. **Permission denied**: Check user role requirements
5. **Storage error**: Verify Cloudinary credentials (production)

### Debug Mode

Enable debug logging by setting log level in your application configuration.

## Dependencies

- `@nestjs/common`
- `@nestjs/platform-express`
- `@nestjs/config`
- `@nestjs/typeorm`
- `multer`
- `cloudinary`
- `uuid`
- `class-validator`
- `class-transformer`