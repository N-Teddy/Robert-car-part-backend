# Vehicle Module

This module provides comprehensive vehicle management functionality for the car parts shop, including CRUD operations, business logic for profit calculations, image handling, and bulk operations.

## Features

- **Full CRUD Operations**: Create, read, update, and delete vehicles
- **Bulk Operations**: Create and update multiple vehicles at once
- **Advanced Search & Filtering**: Search by make, model, year, VIN, price range, and dates
- **Pagination**: Efficient pagination with customizable page sizes
- **Profit Tracking**: Automatic calculation of parts revenue, cost, and profit margins
- **Image Management**: Upload and manage multiple vehicle images
- **Parted Out Status**: Track when vehicles start being parted out
- **Statistics & Reports**: Comprehensive vehicle analytics and financial metrics
- **Export Functionality**: Export vehicle data to CSV and PDF formats
- **Role-based Access Control**: Different permissions for different user roles
- **Audit Trail**: Track who created and modified vehicles

## Business Logic

### Vehicle Lifecycle
1. **Acquisition**: Vehicle purchased at auction or other source
2. **Inventory**: Vehicle stored until parts are needed
3. **Parting Out**: Vehicle marked as parted out when parts start being sold
4. **Profit Tracking**: Automatic calculation of profitability from parts sales

### Profit Calculations
- **Total Parts Revenue**: Sum of all parts sold from the vehicle
- **Total Parts Cost**: Sum of all parts costs from the vehicle
- **Total Profit**: Revenue minus cost
- **Profit Margin**: Profit as percentage of revenue

## API Endpoints

### Vehicle Management

#### Create Vehicle
```http
POST /vehicles
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV, SALES

Body: CreateVehicleDto
```

#### Create Multiple Vehicles
```http
POST /vehicles/bulk
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV

Body: BulkCreateVehicleDto
```

#### Get All Vehicles
```http
GET /vehicles
Authorization: Bearer <jwt_token>

Query Parameters:
- make: Filter by vehicle make
- model: Filter by vehicle model
- year: Filter by vehicle year
- vin: Filter by VIN (partial match)
- isPartedOut: Filter by parted out status
- minPrice: Minimum purchase price
- maxPrice: Maximum purchase price
- purchaseDateFrom: Purchase date from (YYYY-MM-DD)
- purchaseDateTo: Purchase date to (YYYY-MM-DD)
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- sortBy: Sort field (default: createdAt)
- sortOrder: Sort order: ASC or DESC (default: DESC)
```

#### Get Vehicle by ID
```http
GET /vehicles/:id
Authorization: Bearer <jwt_token>
```

#### Get Vehicle by VIN
```http
GET /vehicles/vin/:vin
Authorization: Bearer <jwt_token>
```

#### Update Vehicle
```http
PUT /vehicles/:id
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV, SALES

Body: UpdateVehicleDto
```

#### Update Multiple Vehicles
```http
PUT /vehicles/bulk
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV

Body: BulkUpdateVehicleDto
```

#### Mark Vehicle as Parted Out
```http
PUT /vehicles/:id/parted-out
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV, SALES
```

#### Delete Vehicle
```http
DELETE /vehicles/:id
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER
```

### Vehicle Analytics

#### Get Vehicle Statistics
```http
GET /vehicles/stats
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV
```

#### Export Vehicles
```http
GET /vehicles/export
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV

Query Parameters:
- format: Export format (csv, pdf)
- search: Search criteria (optional)
```

### Image Management

#### Upload Vehicle Images
```http
POST /vehicles/:id/images
Authorization: Bearer <jwt_token>
Roles: ADMIN, MANAGER, DEV, SALES
Content-Type: multipart/form-data

Body:
- files: Array of image files (max 10, 5MB each)
- folder: Subfolder for organizing images (optional)
```

## Data Models

### CreateVehicleDto
```typescript
{
  make: string;           // Vehicle make (brand)
  model: string;          // Vehicle model
  year: number;           // Vehicle year (1900-2030)
  vin: string;            // Vehicle Identification Number (unique)
  description: string;    // Vehicle description
  purchasePrice: number;  // Purchase price
  purchaseDate: string;   // Purchase date (YYYY-MM-DD)
  auctionName?: string;   // Auction name (optional)
  isPartedOut?: boolean;  // Parted out status (default: false)
}
```

### VehicleSearchDto
```typescript
{
  make?: string;          // Filter by make
  model?: string;         // Filter by model
  year?: number;          // Filter by year
  vin?: string;           // Filter by VIN (partial)
  isPartedOut?: boolean;  // Filter by parted out status
  minPrice?: number;      // Minimum price
  maxPrice?: number;      // Maximum price
  purchaseDateFrom?: string; // Date from (YYYY-MM-DD)
  purchaseDateTo?: string;   // Date to (YYYY-MM-DD)
}
```

### VehiclePaginationDto
```typescript
{
  page?: number;          // Page number (default: 1)
  limit?: number;         // Items per page (default: 10, max: 100)
  sortBy?: string;        // Sort field (default: createdAt)
  sortOrder?: 'ASC' | 'DESC'; // Sort order (default: DESC)
}
```

## Response Models

### VehicleDto (Full Vehicle Data)
```typescript
{
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  description: string;
  purchasePrice: number;
  purchaseDate: Date;
  auctionName?: string;
  isPartedOut: boolean;
  totalParts: number;
  totalPartsRevenue: number;
  totalPartsCost: number;
  totalProfit: number;
  profitMargin: number;
  images: ImageDto[];
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### VehicleSummaryDto (List View)
```typescript
{
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  purchasePrice: number;
  purchaseDate: Date;
  isPartedOut: boolean;
  totalProfit: number;
  mainImage?: ImageDto;
  createdAt: Date;
}
```

### VehicleStatsDto
```typescript
{
  totalVehicles: number;
  partedOutVehicles: number;
  intactVehicles: number;
  totalPurchaseCost: number;
  totalPartsRevenue: number;
  totalProfit: number;
  averageProfitPerVehicle: number;
  overallProfitMargin: number;
  makeBreakdown: Record<string, number>;
  yearBreakdown: Record<string, number>;
}
```

## Search & Filtering

### Text Search
- **Make**: Case-insensitive partial match
- **Model**: Case-insensitive partial match
- **VIN**: Case-insensitive partial match

### Numeric Filters
- **Year**: Exact match
- **Price Range**: Min/max purchase price
- **Date Range**: Purchase date from/to

### Boolean Filters
- **Parted Out Status**: Filter by parted out or intact vehicles

### Sorting Options
- **Fields**: make, model, year, purchasePrice, purchaseDate, createdAt, updatedAt
- **Order**: ASC (ascending) or DESC (descending)

## Pagination

- **Page-based**: 1-based page numbering
- **Configurable**: 1-100 items per page
- **Metadata**: Total count, total pages, navigation info

## Bulk Operations

### Bulk Create
- **Validation**: Check for duplicate VINs before creation
- **Results**: Individual results for each vehicle
- **Summary**: Total, successful, and failed counts

### Bulk Update
- **Individual Updates**: Update multiple vehicles with different data
- **Error Handling**: Continue processing even if some updates fail
- **Results**: Success/failure status for each vehicle

## Image Management

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Limits
- **Size**: Maximum 5MB per file
- **Count**: Maximum 10 files per upload
- **Organization**: Optional subfolder categorization

### Storage
- **Development**: Local file system with organized directory structure
- **Production**: Cloudinary with automatic optimization

## Role-based Access Control

### ADMIN
- Full access to all operations
- Can delete vehicles
- Access to statistics and exports

### MANAGER
- Full access to all operations
- Can delete vehicles
- Access to statistics and exports

### DEV
- Full access to all operations
- Cannot delete vehicles
- Access to statistics and exports

### SALES
- Create, read, and update vehicles
- Upload vehicle images
- Mark vehicles as parted out
- Cannot delete vehicles or access statistics

### CUSTOMER
- No access to vehicle management

## Error Handling

### Common Error Scenarios
- **Duplicate VIN**: Vehicle with same VIN already exists
- **Vehicle Not Found**: Invalid vehicle ID or VIN
- **Validation Errors**: Invalid data format or values
- **Permission Denied**: Insufficient role permissions
- **Delete Constraints**: Cannot delete vehicle with existing parts

### Error Response Format
```typescript
{
  message: string;
  error: string;
  statusCode: number;
}
```

## Performance Considerations

### Database Optimization
- **Indexes**: VIN, make, model, year, purchase date
- **Relationships**: Efficient joins for parts and profit data
- **Pagination**: Limit result sets for large datasets

### Search Optimization
- **Query Building**: Dynamic query construction based on filters
- **Partial Matching**: Efficient text search with ILIKE
- **Date Ranges**: Optimized date range queries

## Monitoring & Logging

### Logged Operations
- Vehicle creation, updates, and deletion
- Bulk operation results
- Image uploads
- Error scenarios

### Performance Metrics
- Query execution times
- Bulk operation throughput
- Image upload success rates

## Security Features

### Authentication
- JWT token required for all endpoints
- Token validation and expiration handling

### Authorization
- Role-based access control
- Operation-level permissions
- User context tracking

### Data Validation
- Input sanitization and validation
- SQL injection prevention
- File type and size validation

## Notifications

### Automatic Notifications
The vehicle module automatically sends notifications for all major operations:

#### Vehicle Creation
- **Trigger**: When a new vehicle is added to inventory
- **Recipients**: All administrators and managers
- **Content**: Vehicle details, purchase information, and who added it
- **Action**: Direct link to view the new vehicle

#### Vehicle Updates
- **Trigger**: When vehicle information is modified
- **Recipients**: All administrators and managers
- **Content**: Detailed list of what changed and who made the changes
- **Action**: Direct link to view the updated vehicle

#### Vehicle Deletion
- **Trigger**: When a vehicle is permanently removed
- **Recipients**: All administrators and managers
- **Content**: Vehicle details and who removed it
- **Action**: Link to vehicle inventory management

#### Parted Out Status
- **Trigger**: When a vehicle is marked as parted out
- **Recipients**: All administrators and managers
- **Content**: Vehicle details and explanation of parted out status
- **Action**: Direct link to view the vehicle and track parts sales

### Notification Channels
- **In-App Notifications**: Stored in database for real-time access
- **Email Notifications**: Detailed HTML emails with vehicle information
- **Audit Trail**: Complete record of all operations and who performed them

### Email Templates
- Professional HTML email templates for each notification type
- Responsive design with clear call-to-action buttons
- Vehicle details and metadata included in each email
- Links to relevant admin panel sections

## Integration Points

### Upload Module
- Vehicle image management
- File storage and retrieval
- Image optimization

### Part Module
- Vehicle-part relationships
- Profit calculations
- Inventory tracking

### User Module
- User authentication and authorization
- Audit trail tracking
- Role management

### Notification Module
- **Vehicle Creation**: Notifies admins when new vehicles are added
- **Vehicle Updates**: Tracks changes and notifies admins of modifications
- **Vehicle Deletion**: Alerts admins when vehicles are removed
- **Parted Out Status**: Notifies when vehicles are marked as parted out
- **Email Notifications**: Sends detailed email alerts with vehicle information
- **Audit Trail**: Records who performed each action for accountability

## Future Enhancements

### Planned Features
- **Vehicle Categories**: Sedan, SUV, Truck, etc.
- **Condition Tracking**: Damage assessment and repair history
- **Market Analysis**: Pricing trends and market value
- **Advanced Reporting**: Custom report builder
- **API Rate Limiting**: Request throttling and quotas
- **Webhook Support**: Real-time notifications for vehicle changes

### Performance Improvements
- **Caching**: Redis-based caching for frequently accessed data
- **Background Jobs**: Async processing for bulk operations
- **Database Sharding**: Horizontal scaling for large datasets
- **CDN Integration**: Global image delivery optimization