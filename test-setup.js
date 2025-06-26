console.log('Node.js:', process.version);
console.log('Platform:', process.platform);
console.log('Directory:', process.cwd());

const fs = require('fs');
console.log('Data files:', fs.readdirSync('./data', {withFileTypes: true}).map(d => d.name));
