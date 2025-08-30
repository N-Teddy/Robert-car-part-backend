#!/usr/bin/env node

/**
 * Test script for the upload module
 * Run with: node scripts/test-upload.js
 */

const fs = require('fs');
const path = require('path');

// Create a test image directory if it doesn't exist
const testDir = path.join(__dirname, '../test-uploads');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log('✅ Created test uploads directory');
}

// Create a simple test image (1x1 pixel PNG)
const testImagePath = path.join(testDir, 'test-image.png');
const testImageBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // Width: 1
  0x00, 0x00, 0x00, 0x01, // Height: 1
  0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
  0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Compressed data
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

fs.writeFileSync(testImagePath, testImageBuffer);
console.log('✅ Created test image:', testImagePath);

// Test the uploads directory structure
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Create subdirectories for each image type
const imageTypes = ['user-profile', 'vehicle', 'part', 'qr-code'];
imageTypes.forEach(type => {
  const typeDir = path.join(uploadsDir, type);
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
    console.log(`✅ Created ${type} directory`);
  }
});

console.log('\n🎯 Upload module test setup complete!');
console.log('\n📁 Directory structure:');
console.log('├── uploads/');
imageTypes.forEach(type => {
  console.log(`│   ├── ${type}/`);
});
console.log('└── test-uploads/');
console.log('    └── test-image.png');

console.log('\n🚀 You can now test the upload endpoints:');
console.log('1. Start your NestJS application');
console.log('2. Use the test image for uploads');
console.log('3. Check the uploads directory for stored files');
console.log('\n📖 See src/modules/upload/README.md for API documentation');