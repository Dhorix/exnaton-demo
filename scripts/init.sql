---
# ===== scripts/init.sql =====
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- This will be run after Prisma migrations
-- Add any additional database setup here

---
# ===== tests/energy.test.js =====
const request = require('supertest');
const express = require('express');
const energyRoutes = require('../routes/energy');

const app = express();
app.use(express.json());
app.use('/api/energy', energyRoutes);

describe('Energy API', () => {
  test('GET /api/energy/readings should return readings', async () => {
    const response = await request(app)
      .get('/api/energy/readings?limit=5')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('metadata');
  });

  test('GET /api/energy/meters should return meters list', async () => {
    const response = await request(app)
      .get('/api/energy/meters')
      .expect('Content-Type', /json/);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/energy/ingest should validate input', async () => {
    const response = await request(app)
      .post('/api/energy/ingest')
      .send({})
      .expect('Content-Type', /json/);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

---
