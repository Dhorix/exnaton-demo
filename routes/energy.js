const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const dataIngestionService = require('../services/dataIngestion');

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     EnergyReading:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *         value:
 *           type: number
 *         quality:
 *           type: string
 */

/**
 * @swagger
 * /api/energy/readings:
 *   get:
 *     summary: Get energy readings with filtering
 *     parameters:
 *       - name: muid
 *         in: query
 *         schema:
 *           type: string
 *       - name: start
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: end
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1000
 *     responses:
 *       200:
 *         description: Energy readings data
 */
router.get('/readings', async (req, res) => {
  try {
    const { muid, start, end, limit = 1000, interval } = req.query;
    
    let whereClause = {};
    if (muid) whereClause.muid = muid;
    if (start || end) {
      whereClause.timestamp = {};
      if (start) whereClause.timestamp.gte = new Date(start);
      if (end) whereClause.timestamp.lte = new Date(end);
    }

    const readings = await prisma.energyReading.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      include: {
        meter: {
          select: { muid: true, name: true, type: true }
        }
      }
    });

    // Simple time-based aggregation
    let processedData = readings;
    if (interval === '1hour') {
      processedData = aggregateByHour(readings);
    } else if (interval === '1day') {
      processedData = aggregateByDay(readings);
    }

    res.json({
      data: processedData,
      metadata: {
        total: readings.length,
        interval: interval || '15min',
        timeRange: {
          start: readings[readings.length - 1]?.timestamp,
          end: readings[0]?.timestamp
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/energy/ingest:
 *   post:
 *     summary: Ingest energy data from JSON file
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 */
router.post('/ingest', async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    const result = await dataIngestionService.ingestFromJsonFile(filePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/energy/meters:
 *   get:
 *     summary: Get all meters
 */
router.get('/meters', async (req, res) => {
  try {
    const meters = await prisma.meter.findMany({
      include: {
        _count: {
          select: { readings: true }
        }
      }
    });
    res.json(meters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/energy/statistics/{muid}:
 *   get:
 *     summary: Get statistics for a specific meter
 */
router.get('/statistics/:muid', async (req, res) => {
  try {
    const { muid } = req.params;
    const stats = await dataIngestionService.getReadingStats(muid);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions for aggregation
function aggregateByHour(readings) {
  const grouped = readings.reduce((acc, reading) => {
    const hour = new Date(reading.timestamp);
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();
    
    if (!acc[key]) {
      acc[key] = { timestamp: hour, values: [], count: 0 };
    }
    acc[key].values.push(parseFloat(reading.value));
    acc[key].count++;
    return acc;
  }, {});

  return Object.values(grouped).map(group => ({
    timestamp: group.timestamp,
    value: group.values.reduce((sum, val) => sum + val, 0) / group.count,
    count: group.count,
    aggregation: 'hourly_average'
  }));
}

function aggregateByDay(readings) {
  const grouped = readings.reduce((acc, reading) => {
    const day = new Date(reading.timestamp);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString();
    
    if (!acc[key]) {
      acc[key] = { timestamp: day, values: [], count: 0 };
    }
    acc[key].values.push(parseFloat(reading.value));
    acc[key].count++;
    return acc;
  }, {});

  return Object.values(grouped).map(group => ({
    timestamp: group.timestamp,
    value: group.values.reduce((sum, val) => sum + val, 0),
    count: group.count,
    aggregation: 'daily_total'
  }));
}

module.exports = router;

