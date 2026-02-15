const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Documentation',
    description: 'RESTful API Documentation - User, Role, Category Management System',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/api',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Roles',
      description: 'Role and permission management endpoints'
    },
    {
      name: 'Categories',
      description: 'Category management endpoints'
    },
    {
      name: 'AuditLogs',
      description: 'Audit log endpoints'
    },
    {
      name: 'Upload',
      description: 'File upload endpoints'
    },
    {
      name: 'Email',
      description: 'Email testing endpoints'
    }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"'
    }
  },
  definitions: {
    User: {
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+905551234567',
      is_active: true,
      roles: ['role_id_1', 'role_id_2']
    },
    Role: {
      role_name: 'Admin',
      is_active: true,
      permissions: ['user_view', 'user_add', 'user_update', 'user_delete']
    },
    Category: {
      name: 'Electronics',
      is_active: true
    },
    Login: {
      email: 'user@example.com',
      password: 'password123'
    },
    LoginResponse: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe'
      }
    },
    Error: {
      error: {
        message: 'Error message',
        description: 'Error description'
      }
    },
    Success: {
      success: true
    }
  }
};

const outputFile = './swagger_output.json';

// ✅ ÇÖZÜM: app.js'i kullan (index.js artık explicit olduğu için çalışacak)
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger documentation generated successfully!');
  console.log('📄 Output file: swagger_output.json');
  console.log('🚀 Now run your app and visit: http://localhost:3000/api/docs');
});