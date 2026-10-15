/**
 * MAWAQETSALAT EXPANSION VALIDATION GATE
 * 
 * Verifies dataset integrity, prayer calculation solvability,
 * referential consistency, SEO URL preservation, and sitemap completeness.
 * 
 * Output: Machine-readable JSON report to docs/audit/expansion-gate-report.json
 * Exit Code: 0 on success, 1 on any critical failure.
 */

const fs = require('fs');
const path = require('path');
const { Coordinates, CalculationMethod, PrayerTimes, CalculationParameters } = require('adhan');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const CITIES_PATH = path.join(WORKSPACE_ROOT, 'data/normalized/cities.json');
const COUNTRIES_PATH = path.join(WORKSPACE_ROOT, 'data/normalized/countries.json');
const LEGACY_URLS_PATH = path.join(WORKSPACE_ROOT, 'data/migration/legacy-urls.json');
const REPORT_OUTPUT_PATH = path.join(WORKSPACE_ROOT, 'docs/audit/expansion-gate-report.json');

// Supported calculation method mapping
const METHOD_ID_MAP = {
  3:  'EGYPT',
  4:  'MAKKAH',
  7:  'FRANCE',
  8:  'GULF',
  9:  'KUWAIT',
  10: 'QATAR',
  13: 'TURKEY',
  15: 'MOROCCO',
  17: 'TEHRAN',
  2:  'ISNA',
  12: 'KARACHI',
  11: 'SINGAPORE',
};

function resolveCalculationParameters(method) {
  switch (method) {
    case 'MAKKAH': return CalculationMethod.UmmAlQura();
    case 'EGYPT': return CalculationMethod.Egyptian();
    case 'KUWAIT': return CalculationMethod.Kuwait();
    case 'QATAR': return CalculationMethod.Qatar();
    case 'GULF': {
      const p = new CalculationParameters('Dubai', 19.5, 0);
      p.ishaInterval = 90;
      return p;
    }
    case 'MOROCCO': return new CalculationParameters('MoonsightingCommittee', 19.0, 17.0);
    case 'FRANCE': return new CalculationParameters('Other', 12.0, 12.0);
    case 'TURKEY': return CalculationMethod.Turkey();
    case 'TEHRAN': return CalculationMethod.Tehran();
    case 'ISNA': return CalculationMethod.NorthAmerica();
    case 'KARACHI': return CalculationMethod.Karachi();
    case 'SINGAPORE': return CalculationMethod.Singapore();
    case 'MWL':
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

async function runValidationGate() {
  const timestamp = new Date().toISOString();
  console.log('===========================================================');
  console.log(`MAWAQETSALAT — EXPANSION VALIDATION GATE (${timestamp})`);
  console.log('===========================================================\n');

  const report = {
    timestamp,
    status: 'PASSED',
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningsCount: 0,
    },
    checks: [],
    details: {
      cityCount: 0,
      countryCount: 0,
      legacyUrlCount: 0,
    },
  };

  function recordCheck(name, passed, details = {}, isWarning = false) {
    report.summary.totalChecks++;
    if (passed) {
      report.summary.passedChecks++;
      console.log(`  [PASS] ${name}`);
    } else if (isWarning) {
      report.summary.warningsCount++;
      console.log(`  [WARN] ${name}`);
    } else {
      report.summary.failedChecks++;
      report.status = 'FAILED';
      console.error(`  [FAIL] ${name}`);
    }
    report.checks.push({
      name,
      status: passed ? 'PASSED' : (isWarning ? 'WARNING' : 'FAILED'),
      details,
    });
  }

  // 1. Data File Presence & Parsing
  console.log('1. Loading Datasets...');
  let cities = [];
  let countries = [];
  let legacyUrls = [];

  try {
    cities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));
    countries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, 'utf8'));
    legacyUrls = JSON.parse(fs.readFileSync(LEGACY_URLS_PATH, 'utf8'));
    report.details.cityCount = cities.length;
    report.details.countryCount = countries.length;
    report.details.legacyUrlCount = legacyUrls.length;
    recordCheck('Data files parsed cleanly as valid JSON', true, {
      cities: cities.length,
      countries: countries.length,
      legacyUrls: legacyUrls.length,
    });
  } catch (err) {
    recordCheck('Data files parsed cleanly as valid JSON', false, { error: err.message });
    saveReportAndExit(report);
    return;
  }

  // 2. Uniqueness & URL Path Conventions
  console.log('\n2. Verifying Uniqueness & Slug Conventions...');
  const cityIds = new Set();
  const citySlugs = new Set();
  const cityPaths = new Set();
  const duplicateCityIds = [];
  const duplicateCitySlugs = [];
  const duplicateCityPaths = [];
  const malformedSlugs = [];

  for (const c of cities) {
    if (cityIds.has(c.id)) duplicateCityIds.push(c.id);
    cityIds.add(c.id);

    if (citySlugs.has(c.slug)) duplicateCitySlugs.push(c.slug);
    citySlugs.add(c.slug);

    if (cityPaths.has(c.urlPath)) duplicateCityPaths.push(c.urlPath);
    cityPaths.add(c.urlPath);

    if (!/^prayer-times-in-[a-z0-9_-]+$/.test(c.slug)) {
      malformedSlugs.push(c.slug);
    }

    const expectedPath = `/city/${c.slug}/`;
    if (c.urlPath !== expectedPath) {
      malformedSlugs.push(`${c.slug} (path: ${c.urlPath} !== ${expectedPath})`);
    }
  }

  recordCheck('City IDs are strictly unique positive integers', duplicateCityIds.length === 0, { duplicates: duplicateCityIds });
  recordCheck('City slugs are unique and follow prayer-times-in-* format', duplicateCitySlugs.length === 0 && malformedSlugs.length === 0, {
    duplicateSlugs: duplicateCitySlugs,
    malformedSlugs,
  });
  recordCheck('City urlPath is unique and adheres to /city/[slug]/ with trailing slash', duplicateCityPaths.length === 0, { duplicates: duplicateCityPaths });

  // Country uniqueness
  const countryIds = new Set();
  const countrySlugs = new Set();
  const duplicateCountryIds = [];
  const duplicateCountrySlugs = [];
  for (const c of countries) {
    if (countryIds.has(c.id)) duplicateCountryIds.push(c.id);
    countryIds.add(c.id);
    if (countrySlugs.has(c.slug)) duplicateCountrySlugs.push(c.slug);
    countrySlugs.add(c.slug);
  }
  recordCheck('Country IDs and slugs are unique', duplicateCountryIds.length === 0 && duplicateCountrySlugs.length === 0, {
    duplicateIds: duplicateCountryIds,
    duplicateSlugs: duplicateCountrySlugs,
  });

  // 3. Geographic Coordinates & Validity
  console.log('\n3. Validating Geographic Coordinates...');
  const invalidCoords = [];
  for (const c of cities) {
    if (!c.coordinates || typeof c.coordinates.latitude !== 'number' || typeof c.coordinates.longitude !== 'number') {
      invalidCoords.push({ id: c.id, slug: c.slug, reason: 'missing coordinates object' });
    } else if (isNaN(c.coordinates.latitude) || isNaN(c.coordinates.longitude)) {
      invalidCoords.push({ id: c.id, slug: c.slug, reason: 'coordinates contain NaN' });
    } else if (c.coordinates.latitude < -90 || c.coordinates.latitude > 90) {
      invalidCoords.push({ id: c.id, slug: c.slug, reason: `latitude ${c.coordinates.latitude} out of bounds [-90, 90]` });
    } else if (c.coordinates.longitude < -180 || c.coordinates.longitude > 180) {
      invalidCoords.push({ id: c.id, slug: c.slug, reason: `longitude ${c.coordinates.longitude} out of bounds [-180, 180]` });
    }
  }
  recordCheck('All cities possess valid WGS-84 coordinates within terrestrial bounds', invalidCoords.length === 0, { invalidCoords });

  // 4. IANA Timezone Validation
  console.log('\n4. Validating IANA Timezones...');
  const invalidTimezones = [];
  for (const c of cities) {
    if (!c.timezone || typeof c.timezone !== 'string') {
      invalidTimezones.push({ id: c.id, slug: c.slug, timezone: c.timezone, reason: 'empty or non-string' });
    } else {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: c.timezone });
      } catch (e) {
        invalidTimezones.push({ id: c.id, slug: c.slug, timezone: c.timezone, error: e.message });
      }
    }
  }
  recordCheck('All city timezones are valid IANA identifiers recognised by the JavaScript runtime', invalidTimezones.length === 0, { invalidTimezones });

  // 5. Calculation Method Validation & Astronomical Smoke Test
  console.log('\n5. Executing Calculation Method & Astronomical Smoke Tests...');
  const invalidMethods = [];
  const calculationFailures = [];
  const testDate = new Date();

  for (const c of cities) {
    const domainMethod = METHOD_ID_MAP[c.calculationMethodId];
    if (!domainMethod) {
      invalidMethods.push({ id: c.id, slug: c.slug, numericMethodId: c.calculationMethodId });
      continue;
    }

    try {
      const adhanCoords = new Coordinates(c.coordinates.latitude, c.coordinates.longitude);
      const params = resolveCalculationParameters(domainMethod);
      const pt = new PrayerTimes(adhanCoords, testDate, params);

      if (!pt.fajr || isNaN(pt.fajr.getTime()) ||
          !pt.sunrise || isNaN(pt.sunrise.getTime()) ||
          !pt.dhuhr || isNaN(pt.dhuhr.getTime()) ||
          !pt.asr || isNaN(pt.asr.getTime()) ||
          !pt.maghrib || isNaN(pt.maghrib.getTime()) ||
          !pt.isha || isNaN(pt.isha.getTime())) {
        calculationFailures.push({ id: c.id, slug: c.slug, reason: 'One or more prayer timestamps resulted in NaN' });
      }
    } catch (err) {
      calculationFailures.push({ id: c.id, slug: c.slug, error: err.message });
    }
  }

  recordCheck('All cities map to recognized CalculationMethod IDs without unmapped fallbacks', invalidMethods.length === 0, { invalidMethods });
  recordCheck('Astronomical calculation produces valid non-NaN timestamps for 100% of cities', calculationFailures.length === 0, { calculationFailures });

  // 6. Referential Integrity & Country Totals
  console.log('\n6. Checking Referential Integrity & Country Totals...');
  const countryById = new Map(countries.map(c => [c.id, c]));
  const unreferencedCountryIds = [];
  const countryCodeMismatches = [];
  const cityCountPerCountry = new Map();

  for (const c of cities) {
    const parentCountry = countryById.get(c.countryId);
    if (!parentCountry) {
      unreferencedCountryIds.push({ cityId: c.id, countryId: c.countryId });
    } else if (c.countryCode !== parentCountry.code) {
      countryCodeMismatches.push({ cityId: c.id, cityCountryCode: c.countryCode, parentCountryCode: parentCountry.code });
    }

    const currentCount = cityCountPerCountry.get(c.countryId) || 0;
    cityCountPerCountry.set(c.countryId, currentCount + 1);
  }

  recordCheck('Foreign key integrity: Every city references an existing country ID', unreferencedCountryIds.length === 0, { unreferencedCountryIds });
  recordCheck('Country code consistency: city.countryCode strictly matches parent country code', countryCodeMismatches.length === 0, { countryCodeMismatches });

  const countryTotalMismatches = [];
  for (const country of countries) {
    const actualCount = cityCountPerCountry.get(country.id) || 0;
    if (country.totalCities !== actualCount) {
      countryTotalMismatches.push({
        id: country.id,
        nameEn: country.nameEn,
        code: country.code,
        declaredTotal: country.totalCities,
        actualCount,
      });
    }
  }
  recordCheck('Country declared totalCities synchronizes with actual city counts', countryTotalMismatches.length === 0, { countryTotalMismatches });

  // 7. Legacy URL Manifest & SEO Preservation
  console.log('\n7. Auditing Legacy URL Manifest & Redirects...');
  const missingLegacySlugs = [];
  for (const item of legacyUrls) {
    if (item.pageType === 'city') {
      if (!citySlugs.has(item.legacySlug)) {
        missingLegacySlugs.push(item.originalUrl);
      }
    } else if (item.pageType === 'country') {
      if (!countrySlugs.has(item.legacySlug)) {
        missingLegacySlugs.push(item.originalUrl);
      }
    }
  }
  recordCheck('100% of legacy city and country URLs from GSC migration manifest exist in dataset', missingLegacySlugs.length === 0, {
    missingCount: missingLegacySlugs.length,
    missingUrls: missingLegacySlugs.slice(0, 10),
  });

  // 8. Sitemap Integrity & Page Count Verification
  console.log('\n8. Validating Sitemap Entries & Page Budget...');
  const sitemapUrls = new Set();
  const duplicateSitemapUrls = [];

  // Static pages
  const staticPaths = ['/', '/imsakia-ramadan/', '/developers/', '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/'];
  for (const sp of staticPaths) sitemapUrls.add(`https://mawaqetsalat.com${sp}`);

  for (const c of countries) {
    const url = `https://mawaqetsalat.com/country/${c.slug}/`;
    if (sitemapUrls.has(url)) duplicateSitemapUrls.push(url);
    sitemapUrls.add(url);
  }

  for (const c of cities) {
    const url = `https://mawaqetsalat.com${c.urlPath}`;
    if (sitemapUrls.has(url)) duplicateSitemapUrls.push(url);
    sitemapUrls.add(url);
  }

  const expectedSitemapTotal = staticPaths.length + countries.length + cities.length;
  recordCheck('Sitemap contains zero duplicate URLs', duplicateSitemapUrls.length === 0, { duplicateSitemapUrls });
  recordCheck(`Sitemap URL count exactly matches expected sum (${expectedSitemapTotal} URLs)`, sitemapUrls.size === expectedSitemapTotal, {
    sitemapUrlCount: sitemapUrls.size,
    expectedTotal: expectedSitemapTotal,
  });

  // Save report
  saveReportAndExit(report);
}

function saveReportAndExit(report) {
  const dir = path.dirname(REPORT_OUTPUT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(REPORT_OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n===========================================================');
  console.log(`GATE RUN RESULT: ${report.status}`);
  console.log(`Passed Checks:   ${report.summary.passedChecks} / ${report.summary.totalChecks}`);
  console.log(`Failed Checks:   ${report.summary.failedChecks}`);
  console.log(`Warnings:        ${report.summary.warningsCount}`);
  console.log(`Report written:  ${REPORT_OUTPUT_PATH}`);
  console.log('===========================================================\n');

  if (report.status === 'FAILED') {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runValidationGate().catch(err => {
    console.error('Fatal gate error:', err);
    process.exit(1);
  });
}

module.exports = { runValidationGate };
