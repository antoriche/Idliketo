const fs = require('fs');

const filePath = './dist/index.js';

const shebang = '#!/usr/bin/env node\n';
const fileContent = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(filePath, shebang + fileContent, 'utf8');