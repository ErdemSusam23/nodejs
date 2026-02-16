// tests/setup.js
// Bu dosya tüm testlerden önce çalışır

// Test ortamı ayarları
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'off';

// Console.log'ları sustur

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn, // Warn'ları tut
  error: console.error, // Error'ları tut
};

// Timeout sürelerini artır (bcrypt yavaş olduğu için)
jest.setTimeout(30000); // 30 saniye

// Her test suite'inden sonra temizlik
afterEach(() => {
  jest.clearAllMocks();
});

// Tüm testler bittikten sonra
afterAll(async () => {
  // MongoDB bağlantısını kapat
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Açık bağlantıları kapat
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});