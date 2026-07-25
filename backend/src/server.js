const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Repair Accountant API',
      version: '1.0.0',
      description: 'REST API for Repair Accountant Application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Repair: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            repair_number: { type: 'integer' },
            customer_id: { type: 'string' },
            customer_name: { type: 'string' },
            customer_phone: { type: 'string' },
            device_type: { type: 'string' },
            brand: { type: 'string' },
            model: { type: 'string' },
            problem_description: { type: 'string' },
            estimated_cost: { type: 'number' },
            final_cost: { type: 'number' },
            status: { type: 'string' },
            received_date: { type: 'string' },
            delivery_date: { type: 'string' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Income: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

async function start() {
  await initDatabase();

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Repair Accountant API',
  }));

  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/customers', require('./routes/customers'));
  app.use('/api/repairs', require('./routes/repairs'));
  app.use('/api/expenses', require('./routes/expenses'));
  app.use('/api/incomes', require('./routes/incomes'));
  app.use('/api/accounting', require('./routes/accounting'));
  app.use('/api/settings', require('./routes/settings'));
  app.use('/api/data', require('./routes/data'));

  app.listen(PORT, () => {
    console.log(`\n  Repair Accountant API`);
    console.log(`  =====================`);
    console.log(`  Server:  http://localhost:${PORT}`);
    console.log(`  Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`  Health:  http://localhost:${PORT}/api/health\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
