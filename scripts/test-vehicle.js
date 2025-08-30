#!/usr/bin/env node

/**
 * Test script for the vehicle module
 * Run with: node scripts/test-vehicle.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚗 Vehicle Module Test Script');
console.log('==============================\n');

// Create test data directory if it doesn't exist
const testDataDir = path.join(__dirname, '../test-data');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
  console.log('✅ Created test data directory');
}

// Sample vehicle data for testing
const sampleVehicles = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1HGBH41JXMN109186',
    description: 'Well-maintained sedan with low mileage, perfect for parts',
    purchasePrice: 15000.00,
    purchaseDate: '2024-01-15',
    auctionName: 'Copart Auto Auction',
    isPartedOut: false,
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    vin: '2T1BURHE0JC123456',
    description: 'Popular compact car, great for engine and transmission parts',
    purchasePrice: 12000.00,
    purchaseDate: '2024-01-20',
    auctionName: 'IAAI Auto Auction',
    isPartedOut: false,
  },
  {
    make: 'Ford',
    model: 'F-150',
    year: 2021,
    vin: '3FTEW1EG8BFA12345',
    description: 'Pickup truck with minor front-end damage, excellent for body parts',
    purchasePrice: 18000.00,
    purchaseDate: '2024-01-25',
    auctionName: 'Copart Auto Auction',
    isPartedOut: false,
  },
  {
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2018,
    vin: '3GCUKREC8JG123456',
    description: 'Full-size truck, good for mechanical and electrical parts',
    purchasePrice: 14000.00,
    purchaseDate: '2024-01-30',
    auctionName: 'IAAI Auto Auction',
    isPartedOut: false,
  },
  {
    make: 'Nissan',
    model: 'Altima',
    year: 2020,
    vin: '1N4AL3AP8LC123456',
    description: 'Mid-size sedan, excellent condition for interior parts',
    purchasePrice: 13000.00,
    purchaseDate: '2024-02-01',
    auctionName: 'Copart Auto Auction',
    isPartedOut: false,
  },
];

// Create sample vehicle data file
const vehicleDataPath = path.join(testDataDir, 'sample-vehicles.json');
fs.writeFileSync(vehicleDataPath, JSON.stringify(sampleVehicles, null, 2));
console.log('✅ Created sample vehicle data file');

// Create test images directory
const testImagesDir = path.join(testDataDir, 'vehicle-images');
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir, { recursive: true });
  console.log('✅ Created vehicle images test directory');
}

// Create subdirectories for different vehicle types
const vehicleTypes = ['toyota-camry', 'honda-civic', 'ford-f150', 'chevrolet-silverado', 'nissan-altima'];
vehicleTypes.forEach(type => {
  const typeDir = path.join(testImagesDir, type);
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
    console.log(`✅ Created ${type} image directory`);
  }
});

// Create sample CSV export data
const csvData = [
  ['ID', 'Make', 'Model', 'Year', 'VIN', 'Description', 'Purchase Price', 'Purchase Date', 'Auction Name', 'Is Parted Out', 'Created At'],
  ['uuid-1', 'Toyota', 'Camry', '2020', '1HGBH41JXMN109186', 'Well-maintained sedan', '15000.00', '2024-01-15', 'Copart Auto Auction', 'No', '2024-01-15'],
  ['uuid-2', 'Honda', 'Civic', '2019', '2T1BURHE0JC123456', 'Popular compact car', '12000.00', '2024-01-20', 'IAAI Auto Auction', 'No', '2024-01-20'],
];

const csvPath = path.join(testDataDir, 'sample-vehicles-export.csv');
fs.writeFileSync(csvPath, csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n'));
console.log('✅ Created sample CSV export file');

console.log('\n📁 Test Data Structure:');
console.log('├── test-data/');
console.log('│   ├── sample-vehicles.json');
console.log('│   ├── sample-vehicles-export.csv');
console.log('│   └── vehicle-images/');
vehicleTypes.forEach(type => {
  console.log(`│       ├── ${type}/`);
});

console.log('\n🚀 API Testing Instructions:');
console.log('1. Start your NestJS application');
console.log('2. Use the sample data for testing vehicle endpoints');
console.log('3. Test with different user roles (ADMIN, MANAGER, DEV, SALES)');
console.log('4. Verify CRUD operations, search, and bulk operations');

console.log('\n📋 Sample API Calls:');

console.log('\n🔐 Authentication:');
console.log('POST /auth/login');
console.log('Body: { "email": "dev@example.com", "password": "your_password" }');

console.log('\n🚗 Create Vehicle:');
console.log('POST /vehicles');
console.log('Authorization: Bearer <jwt_token>');
console.log('Body: Use data from sample-vehicles.json');

console.log('\n📊 Get All Vehicles:');
console.log('GET /vehicles?page=1&limit=10&sortBy=createdAt&sortOrder=DESC');
console.log('Authorization: Bearer <jwt_token>');

console.log('\n🔍 Search Vehicles:');
console.log('GET /vehicles?make=Toyota&year=2020&minPrice=10000&maxPrice=20000');
console.log('Authorization: Bearer <jwt_token>');

console.log('\n📈 Get Vehicle Statistics:');
console.log('GET /vehicles/stats');
console.log('Authorization: Bearer <jwt_token>');
console.log('Roles: ADMIN, MANAGER, DEV');

console.log('\n📤 Export Vehicles:');
console.log('GET /vehicles/export?format=csv');
console.log('Authorization: Bearer <jwt_token>');
console.log('Roles: ADMIN, MANAGER, DEV');

console.log('\n🖼️ Upload Vehicle Images:');
console.log('POST /vehicles/:id/images');
console.log('Authorization: Bearer <jwt_token>');
console.log('Content-Type: multipart/form-data');
console.log('Body: files=@image1.jpg&files=@image2.jpg&folder=exterior');

console.log('\n📝 Bulk Create Vehicles:');
console.log('POST /vehicles/bulk');
console.log('Authorization: Bearer <jwt_token>');
console.log('Roles: ADMIN, MANAGER, DEV');
console.log('Body: { "vehicles": [...] }');

console.log('\n🔄 Mark Vehicle as Parted Out:');
console.log('PUT /vehicles/:id/parted-out');
console.log('Authorization: Bearer <jwt_token>');
console.log('Roles: ADMIN, MANAGER, DEV, SALES');

console.log('\n📖 See src/modules/vehicle/README.md for complete API documentation');
console.log('\n🎯 Vehicle module is ready for testing! 🚗✨');