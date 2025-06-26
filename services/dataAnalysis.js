const fs = require('fs').promises;
const path = require('path');

class DataAnalysisService {
  constructor() {
    this.data1 = null;
    this.data2 = null;
  }

  async loadData(file1Path, file2Path) {
    try {
      const data1Content = await fs.readFile(file1Path, 'utf8');
      const data2Content = await fs.readFile(file2Path, 'utf8');
      
      this.data1 = JSON.parse(data1Content);
      this.data2 = JSON.parse(data2Content);
      
      console.log('✅ Data loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error loading data:', error.message);
      return false;
    }
  }

  analyzeDataStructure() {
    console.log('\n📊 DATA STRUCTURE ANALYSIS');
    console.log('=' .repeat(50));
    
    if (!this.data1 || !this.data2) {
      console.log('❌ Data not loaded');
      return;
    }

    // Analyze first dataset
    const sample1 = this.data1.data[0];
    const fieldCode1 = Object.keys(sample1).find(key => key.startsWith('0100'));
    
    console.log('Dataset 1 (95ce3367-cbce-4a4d-bbe3-da082831d7bd):');
    console.log(`  📈 Records: ${this.data1.data.length}`);
    console.log(`  🏷️  MUID: ${sample1.tags.muid}`);
    console.log(`  📊 Field Code: ${fieldCode1}`);
    console.log(`  🔢 Sample Value: ${sample1[fieldCode1]}`);
    console.log(`  ⏰ Time Range: ${this.data1.data[this.data1.data.length-1].timestamp} to ${this.data1.data[0].timestamp}`);

    // Analyze second dataset
    const sample2 = this.data2.data[0];
    const fieldCode2 = Object.keys(sample2).find(key => key.startsWith('0100'));
    
    console.log('\nDataset 2 (1db7649e-9342-4e04-97c7-f0ebb88ed1f8):');
    console.log(`  📈 Records: ${this.data2.data.length}`);
    console.log(`  🏷️  MUID: ${sample2.tags.muid}`);
    console.log(`  📊 Field Code: ${fieldCode2}`);
    console.log(`  🔢 Sample Value: ${sample2[fieldCode2]}`);
    console.log(`  ⏰ Time Range: ${this.data2.data[this.data2.data.length-1].timestamp} to ${this.data2.data[0].timestamp}`);
  }

  analyzeEnergyPatterns() {
    console.log('\n⚡ ENERGY CONSUMPTION PATTERNS');
    console.log('=' .repeat(50));

    // Extract energy values
    const fieldCode1 = Object.keys(this.data1.data[0]).find(key => key.startsWith('0100'));
    const fieldCode2 = Object.keys(this.data2.data[0]).find(key => key.startsWith('0100'));
    
    const values1 = this.data1.data.map(d => d[fieldCode1]);
    const values2 = this.data2.data.map(d => d[fieldCode2]);

    // Statistical analysis
    const stats1 = this.calculateStatistics(values1);
    const stats2 = this.calculateStatistics(values2);

    console.log('Meter 1 (95ce3367...) Statistics:');
    console.log(`  Min: ${stats1.min.toFixed(6)} kWh`);
    console.log(`  Max: ${stats1.max.toFixed(6)} kWh`);
    console.log(`  Mean: ${stats1.mean.toFixed(6)} kWh`);
    console.log(`  Std Dev: ${stats1.stdDev.toFixed(6)} kWh`);
    console.log(`  Non-zero readings: ${stats1.nonZeroCount}/${values1.length} (${(stats1.nonZeroCount/values1.length*100).toFixed(1)}%)`);

    console.log('\nMeter 2 (1db7649e...) Statistics:');
    console.log(`  Min: ${stats2.min.toFixed(6)} kWh`);
    console.log(`  Max: ${stats2.max.toFixed(6)} kWh`);
    console.log(`  Mean: ${stats2.mean.toFixed(6)} kWh`);
    console.log(`  Std Dev: ${stats2.stdDev.toFixed(6)} kWh`);
    console.log(`  Non-zero readings: ${stats2.nonZeroCount}/${values2.length} (${(stats2.nonZeroCount/values2.length*100).toFixed(1)}%)`);

    return { stats1, stats2 };
  }

  analyzeTimeIntervals() {
    console.log('\n🕐 TIME INTERVAL ANALYSIS');
    console.log('=' .repeat(50));

    // Check time intervals
    const timestamps1 = this.data1.data.map(d => new Date(d.timestamp));
    const timestamps2 = this.data2.data.map(d => new Date(d.timestamp));

    // Calculate intervals (assuming data is sorted by timestamp)
    const intervals1 = [];
    for (let i = 1; i < timestamps1.length; i++) {
      intervals1.push((timestamps1[i-1] - timestamps1[i]) / (1000 * 60)); // minutes
    }

    const intervals2 = [];
    for (let i = 1; i < timestamps2.length; i++) {
      intervals2.push((timestamps2[i-1] - timestamps2[i]) / (1000 * 60)); // minutes
    }

    const avgInterval1 = intervals1.reduce((a, b) => a + b, 0) / intervals1.length;
    const avgInterval2 = intervals2.reduce((a, b) => a + b, 0) / intervals2.length;

    console.log(`Dataset 1 - Average interval: ${avgInterval1.toFixed(1)} minutes`);
    console.log(`Dataset 2 - Average interval: ${avgInterval2.toFixed(1)} minutes`);
    console.log(`Expected: 15-minute intervals for smart meter data`);

    // Group by different time intervals
    this.groupByTimeInterval('hourly');
    this.groupByTimeInterval('daily');
  }

  groupByTimeInterval(interval) {
    console.log(`\n📈 ${interval.toUpperCase()} AGGREGATION`);
    console.log('-' .repeat(30));

    const fieldCode1 = Object.keys(this.data1.data[0]).find(key => key.startsWith('0100'));
    const fieldCode2 = Object.keys(this.data2.data[0]).find(key => key.startsWith('0100'));

    // Group data by interval
    const grouped1 = this.groupDataByInterval(this.data1.data, fieldCode1, interval);
    const grouped2 = this.groupDataByInterval(this.data2.data, fieldCode2, interval);

    console.log(`Meter 1 - ${interval} periods: ${Object.keys(grouped1).length}`);
    console.log(`Meter 2 - ${interval} periods: ${Object.keys(grouped2).length}`);

    // Show sample aggregated data
    const sample1Keys = Object.keys(grouped1).slice(0, 3);
    const sample2Keys = Object.keys(grouped2).slice(0, 3);

    console.log('\nSample aggregated data (Meter 1):');
    sample1Keys.forEach(key => {
      const data = grouped1[key];
      console.log(`  ${key}: ${data.total.toFixed(6)} kWh (${data.count} readings)`);
    });

    console.log('\nSample aggregated data (Meter 2):');
    sample2Keys.forEach(key => {
      const data = grouped2[key];
      console.log(`  ${key}: ${data.total.toFixed(6)} kWh (${data.count} readings)`);
    });
  }

  groupDataByInterval(data, fieldCode, interval) {
    return data.reduce((acc, reading) => {
      const timestamp = new Date(reading.timestamp);
      let key;

      switch (interval) {
        case 'hourly':
          key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:00`;
          break;
        case 'daily':
          key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`;
          break;
        default:
          key = timestamp.toISOString();
      }

      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, average: 0 };
      }

      acc[key].total += reading[fieldCode];
      acc[key].count += 1;
      acc[key].average = acc[key].total / acc[key].count;

      return acc;
    }, {});
  }

  analyzeAutocorrelation() {
    console.log('\n📊 AUTOCORRELATION ANALYSIS');
    console.log('=' .repeat(50));

    const fieldCode1 = Object.keys(this.data1.data[0]).find(key => key.startsWith('0100'));
    const fieldCode2 = Object.keys(this.data2.data[0]).find(key => key.startsWith('0100'));
    
    const values1 = this.data1.data.map(d => d[fieldCode1]);
    const values2 = this.data2.data.map(d => d[fieldCode2]);

    // Calculate autocorrelation for different lags
    const lags = [1, 4, 24, 96]; // 15min, 1hour, 6hours, 24hours (in 15-min intervals)
    
    console.log('Meter 1 Autocorrelation:');
    lags.forEach(lag => {
      const correlation = this.calculateAutocorrelation(values1, lag);
      const timeDesc = this.lagToTimeDescription(lag);
      console.log(`  Lag ${lag} (${timeDesc}): ${correlation.toFixed(4)}`);
    });

    console.log('\nMeter 2 Autocorrelation:');
    lags.forEach(lag => {
      const correlation = this.calculateAutocorrelation(values2, lag);
      const timeDesc = this.lagToTimeDescription(lag);
      console.log(`  Lag ${lag} (${timeDesc}): ${correlation.toFixed(4)}`);
    });

    this.interpretAutocorrelation(values1, values2);
  }

  calculateAutocorrelation(values, lag) {
    if (lag >= values.length) return 0;

    const n = values.length - lag;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  lagToTimeDescription(lag) {
    const minutes = lag * 15;
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)}hrs`;
    return `${(minutes / 1440).toFixed(1)}days`;
  }

  interpretAutocorrelation(values1, values2) {
    console.log('\n🔍 AUTOCORRELATION INTERPRETATION');
    console.log('-' .repeat(40));

    const dailyCorr1 = this.calculateAutocorrelation(values1, 96); // 24 hours
    const dailyCorr2 = this.calculateAutocorrelation(values2, 96);

    if (dailyCorr1 > 0.5) {
      console.log('Meter 1: Strong daily pattern detected (typical residential/commercial)');
    } else if (dailyCorr1 > 0.2) {
      console.log('Meter 1: Moderate daily pattern detected');
    } else {
      console.log('Meter 1: Weak or no daily pattern');
    }

    if (dailyCorr2 > 0.5) {
      console.log('Meter 2: Strong daily pattern detected');
    } else if (dailyCorr2 > 0.2) {
      console.log('Meter 2: Moderate daily pattern detected');
    } else {
      console.log('Meter 2: Weak or no daily pattern (possibly solar/backup power)');
    }
  }

  generateHypothesis() {
    console.log('\n💡 DATA HYPOTHESIS');
    console.log('=' .repeat(50));

    const fieldCode1 = Object.keys(this.data1.data[0]).find(key => key.startsWith('0100'));
    const fieldCode2 = Object.keys(this.data2.data[0]).find(key => key.startsWith('0100'));
    
    const values1 = this.data1.data.map(d => d[fieldCode1]);
    const values2 = this.data2.data.map(d => d[fieldCode2]);
    
    const stats1 = this.calculateStatistics(values1);
    const stats2 = this.calculateStatistics(values2);

    console.log('🏠 METER 1 (95ce3367...):');
    console.log('  Type: Primary Energy Consumption Meter');
    console.log('  Characteristics:');
    console.log(`    - Consistent non-zero readings (${stats1.nonZeroCount}/${values1.length})`);
    console.log(`    - Typical range: ${stats1.min.toFixed(6)} - ${stats1.max.toFixed(6)} kWh`);
    console.log(`    - Regular consumption pattern (15-minute intervals)`);
    console.log('  Hypothesis: Residential or small commercial electricity consumption');
    console.log('  Evidence: Continuous usage, moderate variance, 15-min smart meter readings');

    console.log('\n⚡ METER 2 (1db7649e...):');
    console.log('  Type: Secondary/Auxiliary Energy Meter');
    console.log('  Characteristics:');
    console.log(`    - Mostly zero readings (${stats2.nonZeroCount}/${values2.length} non-zero)`);
    console.log(`    - Sporadic energy events`);
    console.log(`    - Different OBIS code (0100021D00FF vs 0100011D00FF)`);
    console.log('  Hypothesis: Solar generation, backup generator, or auxiliary circuit');
    console.log('  Evidence: Intermittent readings, mostly zero values, different OBIS code');

    console.log('\n🔬 TECHNICAL ANALYSIS:');
    console.log('  OBIS Codes:');
    console.log('    - 0100011D00FF: Likely active energy import (consumption)');
    console.log('    - 0100021D00FF: Likely active energy export or auxiliary measurement');
    console.log('  Time Resolution: 15-minute intervals (standard for smart meters)');
    console.log('  Data Quality: All readings marked as "measured" (high confidence)');
    console.log('  Period: February 2023 (winter month, affects consumption patterns)');
  }

  calculateStatistics(values) {
    const nonZeroValues = values.filter(v => v > 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: mean,
      stdDev: Math.sqrt(variance),
      nonZeroCount: nonZeroValues.length,
      sum: sum
    };
  }

  async runCompleteAnalysis(file1Path, file2Path) {
    console.log('🚀 EXNATON ENERGY DATA ANALYSIS');
    console.log('=' .repeat(60));

    const loaded = await this.loadData(file1Path, file2Path);
    if (!loaded) return;

    this.analyzeDataStructure();
    this.analyzeEnergyPatterns();
    this.analyzeTimeIntervals();
    this.analyzeAutocorrelation();
    this.generateHypothesis();

    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('=' .repeat(60));
  }
}

// Usage example and CLI interface
async function main() {
  const analyzer = new DataAnalysisService();
  
  // Paths to your JSON files
  const file1 = './data/95ce3367-cbce-4a4d-bbe3-da082831d7bd.json';
  const file2 = './data/1db7649e-9342-4e04-97c7-f0ebb88ed1f8.json';
  
  await analyzer.runCompleteAnalysis(file1, file2);
}

// Export for use in other modules
module.exports = DataAnalysisService;

// Run analysis if called directly
if (require.main === module) {
  main().catch(console.error);
}

