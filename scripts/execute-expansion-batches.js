/**
 * scripts/execute-expansion-batches.js
 * 
 * High-Volume City Expansion: Batch Execution & Progressive Validation Pipeline
 * 
 * Processes 145 accepted cities across 9 sequential batches:
 * - Batch 1 (15 cities): New Countries (Pakistan & Singapore)
 * - Batch 2 (17 cities): North Africa (Algeria, Morocco, Tunisia)
 * - Batch 3 (14 cities): Arabian Peninsula (Saudi Arabia, Yemen, Oman, UAE)
 * - Batch 4 (18 cities): Turkey Part 1, Libya, Sudan, Lebanon, Syria
 * - Batch 5 (21 cities): Indonesia & Malaysia
 * - Batch 6 (18 cities): France & Germany
 * - Batch 7 (16 cities): United Kingdom & Spain
 * - Batch 8 (16 cities): Italy, Canada, US Part 1
 * - Batch 9 (10 cities): United States Part 2
 */

const fs = require('fs');
const path = require('path');
const { Coordinates, CalculationMethod, PrayerTimes, CalculationParameters } = require('adhan');
const { evaluateCandidates } = require('./expansion-candidate-eval');

const ROOT_DIR = path.resolve(__dirname, '..');
const CITIES_PATH = path.join(ROOT_DIR, 'data/normalized/cities.json');
const COUNTRIES_PATH = path.join(ROOT_DIR, 'data/normalized/countries.json');
const STAGING_DIR = path.join(ROOT_DIR, 'data/staging');
const AUDIT_DIR = path.join(ROOT_DIR, 'docs/audit');

const STAGED_CITIES_PATH = path.join(STAGING_DIR, 'city-expansion-145.json');
const REJECTIONS_PATH = path.join(STAGING_DIR, 'city-expansion-rejections.json');
const MANIFEST_PATH = path.join(AUDIT_DIR, 'high-volume-candidate-manifest.json');
const BATCH_REPORT_PATH = path.join(AUDIT_DIR, 'batch-execution-report.json');

// New Countries to be added to countries.json
const NEW_COUNTRIES = [
  {
    id: 39,
    slug: 'prayer-times-in-pakistan',
    nameAr: 'باكستان',
    nameEn: 'pakistan',
    code: 'PK',
    flagUrl: '/flags/pk.png',
    defaultMethodId: 12,
    contentAr: 'مواقيت الصلاة في مدن ومحافظات باكستان',
    legacyPostId: 20001,
    totalCities: 14,
  },
  {
    id: 40,
    slug: 'prayer-times-in-singapore',
    nameAr: 'سنغافورة',
    nameEn: 'singapore',
    code: 'SG',
    flagUrl: '/flags/sg.png',
    defaultMethodId: 11,
    contentAr: 'مواقيت الصلاة في سنغافورة',
    legacyPostId: 20002,
    totalCities: 1,
  },
];

function resolveCalculationParameters(methodId) {
  switch (methodId) {
    case 4: return CalculationMethod.UmmAlQura();
    case 3: return CalculationMethod.Egyptian();
    case 9: return CalculationMethod.Kuwait();
    case 10: return CalculationMethod.Qatar();
    case 13: return CalculationMethod.Turkey();
    case 15: return new CalculationParameters('MoonsightingCommittee', 19.0, 17.0);
    case 7: return new CalculationParameters('Other', 12.0, 12.0);
    case 12: return CalculationMethod.Karachi();
    case 11: return CalculationMethod.Singapore();
    case 17: return CalculationMethod.Tehran();
    case 2: return CalculationMethod.NorthAmerica();
    case 8:
    default: {
      const p = new CalculationParameters('Dubai', 19.5, 0);
      p.ishaInterval = 90;
      return p;
    }
  }
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function runBatchExecution() {
  console.log('===========================================================');
  console.log('HIGH-VOLUME CITY EXPANSION: BATCH IMPORT & VALIDATION');
  console.log('===========================================================\n');

  // Evaluate candidate pool
  const { accepted, rejected } = evaluateCandidates();
  console.log(`\nCandidate Pool Evaluated: ${accepted.length} accepted, ${rejected.length} rejected.\n`);

  if (accepted.length !== 145) {
    throw new Error(`Expected exactly 145 accepted candidates, but got ${accepted.length}`);
  }

  // Define batches
  const batches = [
    { id: 1, name: 'New Countries (Pakistan & Singapore)', filter: c => c.countryCode === 'PK' || c.countryCode === 'SG' },
    { id: 2, name: 'North Africa (Algeria, Morocco, Tunisia)', filter: c => ['DZ', 'MA', 'TN'].includes(c.countryCode) },
    { id: 3, name: 'Arabian Peninsula (Saudi Arabia, Yemen, Oman, UAE)', filter: c => ['SA', 'YE', 'OM', 'AE'].includes(c.countryCode) },
    { id: 4, name: 'Turkey, Libya, Sudan, Lebanon, Syria', filter: c => ['TR', 'LY', 'SD', 'LB', 'SY'].includes(c.countryCode) },
    { id: 5, name: 'Southeast Asia (Indonesia & Malaysia)', filter: c => ['ID', 'MY'].includes(c.countryCode) },
    { id: 6, name: 'Western Europe (France & Germany)', filter: c => ['FR', 'DE'].includes(c.countryCode) },
    { id: 7, name: 'United Kingdom & Spain', filter: c => ['GB', 'ES'].includes(c.countryCode) },
    { id: 8, name: 'Italy, Canada & US (Part 1)', filter: c => ['IT', 'CA'].includes(c.countryCode) || (c.countryCode === 'US' && c.nameEn === 'houston') },
    { id: 9, name: 'United States (Part 2)', filter: c => c.countryCode === 'US' && c.nameEn !== 'houston' },
  ];

  // Load existing datasets
  const initialCities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));
  const initialCountries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, 'utf8'));

  // Backup files
  fs.writeFileSync(`${CITIES_PATH}.pre-145.bak`, JSON.stringify(initialCities, null, 2), 'utf8');
  fs.writeFileSync(`${COUNTRIES_PATH}.pre-145.bak`, JSON.stringify(initialCountries, null, 2), 'utf8');
  console.log(`Backed up datasets to .pre-145.bak\n`);

  let currentCities = [...initialCities];
  let currentCountries = [...initialCountries];

  // Add new countries if not present
  for (const nc of NEW_COUNTRIES) {
    if (!currentCountries.find(c => c.id === nc.id || c.code === nc.code)) {
      currentCountries.push(nc);
    }
  }

  let nextCityId = 489;
  let nextLegacyPostId = 10211;

  const batchResults = [];
  const allStagedCityRecords = [];

  for (const batch of batches) {
    const batchCandidates = accepted.filter(batch.filter);
    console.log(`--- Processing Batch ${batch.id}: ${batch.name} (${batchCandidates.length} cities) ---`);

    const batchCities = [];
    for (const cand of batchCandidates) {
      const cityRecord = {
        id: nextCityId++,
        countryId: cand.countryId,
        countryCode: cand.countryCode,
        slug: cand.slug,
        urlPath: cand.urlPath,
        nameAr: cand.nameAr,
        nameEn: cand.nameEn,
        coordinates: {
          latitude: cand.coordinates.latitude,
          longitude: cand.coordinates.longitude,
        },
        timezone: cand.timezone,
        calculationMethodId: cand.methodId,
        seoTitle: `مواقيت الصلاة في ${cand.nameAr}`,
        seoDescription: `مواقيت الصلاة في ${cand.nameAr} اليوم, مواعيد الصلاة والاذان الشهرية في ${cand.nameAr}`,
        contentAr: '',
        legacyPostId: nextLegacyPostId++,
        verificationStatus: 'verified_exact',
        enrichmentSource: 'GeoNames (city-timezones v1.3.4)',
        notes: `High-volume expansion candidate. Pop: ${cand.population}. Province: ${cand.province}.`,
      };

      batchCities.push(cityRecord);
      allStagedCityRecords.push(cityRecord);
    }

    currentCities = currentCities.concat(batchCities);

    // Synchronize country totalCities
    const countsByCountry = new Map();
    for (const c of currentCities) {
      countsByCountry.set(c.countryId, (countsByCountry.get(c.countryId) || 0) + 1);
    }
    for (const country of currentCountries) {
      country.totalCities = countsByCountry.get(country.id) || 0;
    }

    // Validate batch integrity
    const errors = [];
    const idSet = new Set();
    const slugSet = new Set();
    const pathSet = new Set();

    for (const c of currentCities) {
      if (idSet.has(c.id)) errors.push(`Duplicate city ID: ${c.id}`);
      idSet.add(c.id);

      if (slugSet.has(c.slug)) errors.push(`Duplicate city slug: ${c.slug}`);
      slugSet.add(c.slug);

      if (pathSet.has(c.urlPath)) errors.push(`Duplicate city urlPath: ${c.urlPath}`);
      pathSet.add(c.urlPath);
    }

    // Verify distance to existing cities for each newly added city
    for (const nc of batchCities) {
      const others = currentCities.filter(c => c.countryCode === nc.countryCode && c.id !== nc.id);
      for (const oc of others) {
        const dist = haversineKm(nc.coordinates.latitude, nc.coordinates.longitude, oc.coordinates.latitude, oc.coordinates.longitude);
        if (dist < 15.0) {
          errors.push(`Severe distance collision: ${nc.nameEn} is ${dist.toFixed(2)}km from ${oc.nameEn}`);
        }
      }
    }

    // Smoke test calculations
    const testDate = new Date('2026-10-27T12:00:00Z');
    for (const nc of batchCities) {
      const coords = new Coordinates(nc.coordinates.latitude, nc.coordinates.longitude);
      const params = resolveCalculationParameters(nc.calculationMethodId);
      const pt = new PrayerTimes(coords, testDate, params);
      if (!pt.fajr || isNaN(pt.fajr.getTime()) || !pt.dhuhr || isNaN(pt.dhuhr.getTime())) {
        errors.push(`Astronomical calculation failed for ${nc.slug}`);
      }
    }

    if (errors.length > 0) {
      console.error(`Batch ${batch.id} FAILED with ${errors.length} errors:`, errors);
      throw new Error(`Batch ${batch.id} validation failed!`);
    }

    console.log(`  [PASS] Added ${batchCities.length} cities. Total cities now: ${currentCities.length}`);
    console.log(`  [PASS] Country totals synchronized.`);
    console.log(`  [PASS] Zero ID/slug/URL collisions, all distances verified, 100% calculation solvable.\n`);

    batchResults.push({
      batchId: batch.id,
      name: batch.name,
      citiesAdded: batchCities.length,
      runningTotalCities: currentCities.length,
      sampleCity: batchCities[0].nameEn,
      status: 'PASSED',
    });
  }

  // Persist updated datasets
  fs.writeFileSync(CITIES_PATH, JSON.stringify(currentCities, null, 2), 'utf8');
  fs.writeFileSync(COUNTRIES_PATH, JSON.stringify(currentCountries, null, 2), 'utf8');
  console.log(`Saved updated datasets to ${CITIES_PATH} and ${COUNTRIES_PATH}\n`);

  // Persist staging and audit manifests
  if (!fs.existsSync(STAGING_DIR)) fs.mkdirSync(STAGING_DIR, { recursive: true });
  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });

  fs.writeFileSync(STAGED_CITIES_PATH, JSON.stringify(allStagedCityRecords, null, 2), 'utf8');
  fs.writeFileSync(REJECTIONS_PATH, JSON.stringify(rejected, null, 2), 'utf8');

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalAccepted: accepted.length,
    totalRejected: rejected.length,
    initialCityCount: initialCities.length,
    finalCityCount: currentCities.length,
    initialCountryCount: initialCountries.length,
    finalCountryCount: currentCountries.length,
    batches: batchResults,
    acceptedCities: allStagedCityRecords.map(c => ({
      id: c.id,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      countryCode: c.countryCode,
      countryId: c.countryId,
      slug: c.slug,
      coordinates: c.coordinates,
      timezone: c.timezone,
      methodId: c.calculationMethodId,
      legacyPostId: c.legacyPostId,
    })),
    rejectedCandidates: rejected,
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(BATCH_REPORT_PATH, JSON.stringify(batchResults, null, 2), 'utf8');

  console.log('===========================================================');
  console.log('EXPANSION MERGE SUCCESSFULLY COMPLETED');
  console.log(`Total Initial Cities:    ${initialCities.length}`);
  console.log(`Total Accepted Cities:   ${accepted.length}`);
  console.log(`Total Final Cities:      ${currentCities.length}`);
  console.log(`Total Final Countries:   ${currentCountries.length}`);
  console.log(`Staging files written:   ${STAGED_CITIES_PATH}`);
  console.log(`Manifest written:        ${MANIFEST_PATH}`);
  console.log('===========================================================');
}

if (require.main === module) {
  runBatchExecution();
}

module.exports = { runBatchExecution };
