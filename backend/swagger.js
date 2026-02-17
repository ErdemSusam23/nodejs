const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Documentation',
    description: 'RESTful API Documentation - User, Role, Category Management System',
    version: '1.0.0',
  },
  // host production'da dinamik alınır (app.js'deki swaggerUi.setup'ta override edilir)
  // Bu değer sadece local geliştirme içindir
  host: 'localhost:3000',
  basePath: '',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Users',      description: 'User management endpoints' },
    { name: 'Roles',      description: 'Role and permission management endpoints' },
    { name: 'Categories', description: 'Category management endpoints' },
    { name: 'AuditLogs',  description: 'Audit log endpoints' },
    { name: 'Upload',     description: 'File upload endpoints' },
    { name: 'Email',      description: 'Email testing endpoints' }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'JWT Authorization header. Example: "Bearer {token}"'
    }
  },
  // -----------------------------------------------------------------------
  // Tüm definitions backend'in gerçek { code, data } wrapper yapısına uygun
  // -----------------------------------------------------------------------
  definitions: {

    // --- Genel Wrapper ---
    ApiResponse: {
      code: 200,
      data: {}
    },
    ErrorResponse: {
      code: 400,
      error: {
        message: 'Error message',
        description: 'Error description'
      }
    },

    // --- Auth / Login ---
    LoginRequest: {
      email: 'admin@example.com',
      password: 'password123'
    },
    LoginResponse: {
      code: 200,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User'
        }
      }
    },

    // --- Users ---
    UserObject: {
      _id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+905551234567',
      is_active: true,
      roles: [
        { _id: '507f1f77bcf86cd799439012', role_name: 'Admin', is_active: true }
      ],
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    },
    UserListResponse: {
      code: 200,
      data: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            email: 'user@example.com',
            first_name: 'John',
            last_name: 'Doe',
            is_active: true,
            roles: [{ _id: '507f1f77bcf86cd799439012', role_name: 'Admin' }]
          }
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
      }
    },
    CreateUserRequest: {
      email: 'newuser@example.com',
      password: 'SecurePass123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+905551234567',
      is_active: true,
      roles: ['507f1f77bcf86cd799439012']
    },
    UpdateUserRequest: {
      _id: '507f1f77bcf86cd799439011',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+905551234567',
      is_active: true,
      password: 'NewPassword123',
      roles: ['507f1f77bcf86cd799439012']
    },
    DeleteRequest: {
      _id: '507f1f77bcf86cd799439011'
    },
    SuccessResponse: {
      code: 200,
      data: { success: true }
    },

    // --- Roles ---
    RoleObject: {
      _id: '507f1f77bcf86cd799439012',
      role_name: 'Admin',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z'
    },
    RoleListResponse: {
      code: 200,
      data: {
        data: [
          { _id: '507f1f77bcf86cd799439012', role_name: 'Admin', is_active: true }
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
      }
    },
    CreateRoleRequest: {
      role_name: 'Editor',
      is_active: true,
      permissions: ['user_view', 'category_view', 'category_add']
    },
    UpdateRoleRequest: {
      _id: '507f1f77bcf86cd799439012',
      role_name: 'Super Editor',
      is_active: true,
      permissions: ['user_view', 'user_add', 'category_view']
    },
    RolePrivilegesResponse: {
      code: 200,
      data: [
        { _id: '507f1f77bcf86cd799439020', role_id: '507f1f77bcf86cd799439012', permission: 'user_view' },
        { _id: '507f1f77bcf86cd799439021', role_id: '507f1f77bcf86cd799439012', permission: 'category_view' }
      ]
    },
    SystemPermissionsResponse: {
      code: 200,
      data: {
        privileges: [
          { key: 'user_view',     name: 'View Users',      group: 'Users' },
          { key: 'user_add',      name: 'Add User',         group: 'Users' },
          { key: 'user_update',   name: 'Update User',      group: 'Users' },
          { key: 'user_delete',   name: 'Delete User',      group: 'Users' },
          { key: 'role_view',     name: 'View Roles',       group: 'Roles' },
          { key: 'role_add',      name: 'Add Role',         group: 'Roles' },
          { key: 'role_update',   name: 'Update Role',      group: 'Roles' },
          { key: 'role_delete',   name: 'Delete Role',      group: 'Roles' },
          { key: 'category_view', name: 'View Categories',  group: 'Categories' },
          { key: 'category_add',  name: 'Add Category',     group: 'Categories' },
          { key: 'category_update','name': 'Update Category', group: 'Categories' },
          { key: 'category_delete','name': 'Delete Category', group: 'Categories' }
        ]
      }
    },

    // --- Categories ---
    CategoryObject: {
      _id: '507f1f77bcf86cd799439014',
      name: 'Electronics',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z'
    },
    CategoryListResponse: {
      code: 200,
      data: {
        data: [
          { _id: '507f1f77bcf86cd799439014', name: 'Electronics', is_active: true }
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
      }
    },
    CreateCategoryRequest: {
      name: 'Electronics',
      is_active: true
    },
    UpdateCategoryRequest: {
      _id: '507f1f77bcf86cd799439014',
      name: 'Home Electronics',
      is_active: true
    },

    // --- Audit Logs ---
    AuditLogObject: {
      _id: '507f1f77bcf86cd799439030',
      email: 'admin@example.com',
      location: 'Users',
      proc_type: 'Add',
      log: { _id: '507f1f77bcf86cd799439011', email: 'newuser@example.com' },
      created_at: '2024-01-01T00:00:00.000Z'
    },
    AuditLogListResponse: {
      code: 200,
      data: {
        data: [
          {
            _id: '507f1f77bcf86cd799439030',
            email: 'admin@example.com',
            location: 'Users',
            proc_type: 'Login',
            log: {},
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 }
      }
    },
    AuditLogRequest: {
      begin_date: '2024-01-01',
      end_date: '2024-12-31',
      page: 1,
      limit: 20,
      action: 'Login',
      resource: 'Users',
      email: 'admin@example.com'
    }
  }
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger documentation generated successfully!');
  console.log('📄 Output file: swagger_output.json');
  console.log('🚀 Visit: http://localhost:3000/api/docs');
});