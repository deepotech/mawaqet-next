const fs = require('fs');
const path = require('path');

function parseSimpleCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const parts = line.split(',');
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = parts[i] ? parts[i].trim() : '';
    });
    return obj;
  });
}

const dir = 'docs/gsc_export';
const files = fs.readdirSync(dir);
console.log('GSC Files in export:', files);

const devFile = files.find(f => f.toLowerCase().includes('appareil'));
const devContent = fs.readFileSync(path.join(dir, devFile), 'utf8');
const devices = parseSimpleCsv(devContent);
console.log('Devices:', devices);

const paysFile = files.find(f => f.toLowerCase().includes('pays'));
const paysContent = fs.readFileSync(path.join(dir, paysFile), 'utf8');
const countries = parseSimpleCsv(paysContent);
console.log('Top 10 Countries by Clicks:');
countries.slice(0, 10).forEach(c => {
  console.log(`- ${c[Object.keys(c)[0]]}: ${c['Clics']} clicks, ${c['Impressions']} imp, CTR: ${c['CTR']}, Pos: ${c['Position']}`);
});

const pagesFile = files.find(f => f.toLowerCase().includes('pages'));
const pagesContent = fs.readFileSync(path.join(dir, pagesFile), 'utf8');
const pages = parseSimpleCsv(pagesContent);

let totalClicks = 0;
let totalImpressions = 0;
let weightedPosSum = 0;
pages.forEach(p => {
  const clics = parseInt(p['Clics']) || 0;
  const imp = parseInt(p['Impressions']) || 0;
  const pos = parseFloat(p['Position']) || 0;
  totalClicks += clics;
  totalImpressions += imp;
  weightedPosSum += imp * pos;
});

console.log('\nAggregate Pages Stats:');
console.log('Total URLs with traffic:', pages.length);
console.log('Total Clicks:', totalClicks);
console.log('Total Impressions:', totalImpressions);
console.log('Impression-Weighted Avg Position:', (weightedPosSum / totalImpressions).toFixed(2));
console.log('Avg CTR:', ((totalClicks / totalImpressions) * 100).toFixed(2) + '%');

const graphFile = files.find(f => f.toLowerCase().includes('graphique'));
const graphContent = fs.readFileSync(path.join(dir, graphFile), 'utf8');
const chart = parseSimpleCsv(graphContent);
console.log('\nDate range in Graphique:', chart[0]['Date'], 'to', chart[chart.length - 1]['Date']);
console.log('Total days:', chart.length);
