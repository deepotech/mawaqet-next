/**
 * AUDIT C: EXPANSION VALIDATION GATE NEGATIVE-TEST VERIFIER
 * 
 * Verifies that the expansion gate strictly fails on synthetic negative test fixtures
 * without modifying or corrupting production datasets.
 * 
 * Outputs results to: docs/audit/expansion-gate-verification.json
 */

const fs = require('fs');
const path = require('path');
const { runValidationGate } = require('./expansion-validation-gate');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const TEMP_DIR = path.join(WORKSPACE_ROOT, 'tests/fixtures/_tmp_gate_test');
const VERIFICATION_REPORT_PATH = path.join(WORKSPACE_ROOT, 'docs/audit/expansion-gate-verification.json');

const REAL_CITIES = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/normalized/cities.json'), 'utf8'));
const REAL_COUNTRIES = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/normalized/countries.json'), 'utf8'));
const REAL_LEGACY_URLS = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/migration/legacy-urls.json'), 'utf8'));

function setupTempDir() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function cleanupTempDir() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

async function runNegativeTests() {
  console.log('Starting Expansion Validation Gate Negative Testing...');
  setupTempDir();

  const testResults = [];

  const scenarios = [
    {
      name: 'Duplicate City ID',
      mutateCities: (cities) => {
        cities[1].id = cities[0].id;
      },
      expectedFailedCheckPattern: /City IDs are strictly unique positive integers/,
    },
    {
      name: 'Duplicate City Slug',
      mutateCities: (cities) => {
        cities[1].slug = cities[0].slug;
        cities[1].urlPath = cities[0].urlPath;
      },
      expectedFailedCheckPattern: /City slugs are unique and follow prayer-times-in-\* format/,
    },
    {
      name: 'Malformed City URL Path (Missing Trailing Slash)',
      mutateCities: (cities) => {
        cities[0].urlPath = `/city/${cities[0].slug}`; // no trailing slash
      },
      expectedFailedCheckPattern: /City urlPath is unique and adheres to \/city\/\[slug\]\/ with trailing slash/,
    },
    {
      name: 'Out-of-Bounds Latitude (+95.5°)',
      mutateCities: (cities) => {
        cities[0].coordinates.latitude = 95.5;
      },
      expectedFailedCheckPattern: /All cities possess valid WGS-84 coordinates within terrestrial bounds/,
    },
    {
      name: 'Out-of-Bounds Longitude (-195.0°)',
      mutateCities: (cities) => {
        cities[0].coordinates.longitude = -195.0;
      },
      expectedFailedCheckPattern: /All cities possess valid WGS-84 coordinates within terrestrial bounds/,
    },
    {
      name: 'Invalid IANA Timezone ("Mars/Curiosity")',
      mutateCities: (cities) => {
        cities[0].timezone = 'Mars/Curiosity';
      },
      expectedFailedCheckPattern: /All city timezones are valid IANA identifiers recognised by the JavaScript runtime/,
    },
    {
      name: 'Unsupported Calculation Method ID (9999)',
      mutateCities: (cities) => {
        cities[0].calculationMethodId = 9999;
      },
      expectedFailedCheckPattern: /All cities map to recognized CalculationMethod IDs without unmapped fallbacks/,
    },
    {
      name: 'Foreign Key Violation (Non-Existent Country ID 9999)',
      mutateCities: (cities) => {
        cities[0].countryId = 9999;
      },
      expectedFailedCheckPattern: /Foreign key integrity: Every city references an existing country ID/,
    },
    {
      name: 'Country Code Inconsistency (City has "US" but Country is "SA")',
      mutateCities: (cities) => {
        cities[0].countryCode = 'US'; // cities[0] is in Saudi Arabia
      },
      expectedFailedCheckPattern: /Country code consistency: city\.countryCode strictly matches parent country code/,
    },
    {
      name: 'Country City-Count Synchronization Mismatch',
      mutateCountries: (countries) => {
        countries[0].totalCities = countries[0].totalCities + 10;
      },
      expectedFailedCheckPattern: /Country declared totalCities synchronizes with actual city counts/,
    },
    {
      name: 'Legacy URL Manifest Regression (Missing High-Value City)',
      mutateCities: (cities) => {
        // Remove baghdad
        const idx = cities.findIndex(c => c.slug === 'prayer-times-in-baghdad');
        if (idx !== -1) cities.splice(idx, 1);
      },
      expectedFailedCheckPattern: /100% of legacy city and country URLs from GSC migration manifest exist in dataset/,
    },
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const testCities = JSON.parse(JSON.stringify(REAL_CITIES));
    const testCountries = JSON.parse(JSON.stringify(REAL_COUNTRIES));
    const testLegacyUrls = JSON.parse(JSON.stringify(REAL_LEGACY_URLS));

    if (s.mutateCities) s.mutateCities(testCities);
    if (s.mutateCountries) s.mutateCountries(testCountries);
    if (s.mutateLegacyUrls) s.mutateLegacyUrls(testLegacyUrls);

    const tempCitiesPath = path.join(TEMP_DIR, `cities_${i}.json`);
    const tempCountriesPath = path.join(TEMP_DIR, `countries_${i}.json`);
    const tempLegacyUrlsPath = path.join(TEMP_DIR, `legacy_urls_${i}.json`);
    const tempReportPath = path.join(TEMP_DIR, `report_${i}.json`);

    fs.writeFileSync(tempCitiesPath, JSON.stringify(testCities, null, 2), 'utf8');
    fs.writeFileSync(tempCountriesPath, JSON.stringify(testCountries, null, 2), 'utf8');
    fs.writeFileSync(tempLegacyUrlsPath, JSON.stringify(testLegacyUrls, null, 2), 'utf8');

    const report = await runValidationGate({
      citiesPath: tempCitiesPath,
      countriesPath: tempCountriesPath,
      legacyUrlsPath: tempLegacyUrlsPath,
      reportOutputPath: tempReportPath,
      exitOnFinish: false,
      silent: true,
    });

    const failedCheck = report.checks.find(c => c.status === 'FAILED' && s.expectedFailedCheckPattern.test(c.name));
    const isOverallFailed = report.status === 'FAILED';
    const testPassed = isOverallFailed && !!failedCheck;

    console.log(`  ${testPassed ? '✓' : '✗'} Scenario ${i + 1}: ${s.name} -> ${testPassed ? 'Correctly Rejected' : 'UNEXPECTED PASS'}`);

    testResults.push({
      scenarioIndex: i + 1,
      name: s.name,
      overallStatus: report.status,
      expectedFailedCheck: s.expectedFailedCheckPattern.toString(),
      matchedFailedCheck: failedCheck ? failedCheck.name : null,
      failedCheckDetails: failedCheck ? failedCheck.details : null,
      testPassed,
    });
  }

  cleanupTempDir();

  const allPassed = testResults.every(r => r.testPassed);

  const verificationOutput = {
    timestamp: new Date().toISOString(),
    status: allPassed ? 'ALL_NEGATIVE_TESTS_CONFIRMED' : 'NEGATIVE_TEST_FAILURES',
    summary: {
      totalScenariosTested: scenarios.length,
      scenariosPassed: testResults.filter(r => r.testPassed).length,
      scenariosFailed: testResults.filter(r => !r.testPassed).length,
    },
    scenarios: testResults,
  };

  fs.writeFileSync(VERIFICATION_REPORT_PATH, JSON.stringify(verificationOutput, null, 2), 'utf8');
  console.log(`\nExpansion Gate Negative Verification written to: ${VERIFICATION_REPORT_PATH}`);
  console.log(`Results: ${verificationOutput.summary.scenariosPassed} / ${scenarios.length} Scenarios Correctly Caught.`);

  if (!allPassed) {
    process.exit(1);
  }
}

runNegativeTests().catch(err => {
  console.error('Negative testing crashed:', err);
  cleanupTempDir();
  process.exit(1);
});
