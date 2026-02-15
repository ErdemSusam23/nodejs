const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
// HATA BURADAYDI: Sadece index.js'e bakıyordu, o da dinamik olduğu için boş dönüyordu.
// DÜZELTME: Tüm route dosyalarını açıkça belirtiyoruz.
const endpointsFiles = [
    './routes/auditlogs.js',
    './routes/categories.js',
    './routes/email.js',
    './routes/index.js', 
    './routes/roles.js',
    './routes/routes.js',
    './routes/users.js',
];

const doc = {
    info: {
        title: 'Node.js Backend API',
        description: 'Otomatik oluşturulan dokümantasyon',
        version: '0.0.0',
    },
    host: 'localhost:3000',
    basePath: '/api', // Rotaların hepsi /api altında olduğu için bunu ekledik
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'JWT Token (Başına "Bearer " eklemeyi unutma)'
        },
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

swaggerAutogen(outputFile, endpointsFiles, doc);