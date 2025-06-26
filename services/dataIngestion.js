const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;

class DataIngestionService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async ingestFromJsonFile(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid JSON structure');
      }

      // Extract meter info and create meter record
      const firstReading = data.data[0];
      const muid = firstReading.tags.muid;
      
      await this.prisma.meter.upsert({
        where: { muid },
        update: {},
        create: { muid }
      });

      // Process readings
      const processedReadings = data.data.map(reading => {
        const fieldCode = Object.keys(reading).find(key => key.startsWith('0100'));
        return {
          muid: reading.tags.muid,
          timestamp: new Date(reading.timestamp),
          measurementType: reading.measurement,
          value: reading[fieldCode],
          quality: reading.tags.quality,
          fieldCode
        };
      });

      // Batch insert
      const result = await this.prisma.energyReading.createMany({
        data: processedReadings,
        skipDuplicates: true
      });

      return {
        success: true,
        recordsProcessed: result.count,
        muid
      };
    } catch (error) {
      throw new Error(`Ingestion failed: ${error.message}`);
    }
  }

  async getReadingStats(muid) {
    const stats = await this.prisma.energyReading.aggregate({
      where: { muid },
      _count: { id: true },
      _min: { value: true, timestamp: true },
      _max: { value: true, timestamp: true },
      _avg: { value: true }
    });

    return stats;
  }
}

module.exports = new DataIngestionService();
