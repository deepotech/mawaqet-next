const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3008;
const BASE_URL = `http://localhost:${PORT}`;

async function fetchWithRedirects(targetPath, maxRedirects = 5) {
  let currentPath = targetPath;
  let redirects = [];
  let response;

  for (let i = 0; i <= maxRedirects; i++) {
    const url = currentPath.startsWith('http') ? currentPath : `${BASE_URL}${currentPath}`;
    const res = await fetch(url, { redirect: 'manual' });
    const status = res.status;

    if (status >= 300 && status < 400) {
      const loc = res.headers.get('location');
      redirects.push({ status, location: loc });
      if (!loc) break;
      // Convert full URL to path if internal
      currentPath = loc.replace(/^https?:\/\/[^\/]+/, '');
      if (!currentPath.startsWith('/')) currentPath = '/' + currentPath;
    } else {
      const html = await res.text();
      return {
        initialStatus: redirects.length > 0 ? redirects[0].status : status,
        finalStatus: status,
        redirects,
        finalPath: currentPath,
        html,
      };
    }
  }

  throw new Error(`Redirect loop detected for ${targetPath}`);
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match ? match[1] : null;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

async function runAudit() {
  console.log(`=======================================================`);
  console.log(`Starting Comprehensive Legacy URL Verification (Port ${PORT})`);
  console.log(`=======================================================\n`);

  // 1. Ingest inventory & GSC
  const invPath = path.resolve(__dirname, '../legacy-data/full_url_inventory.json');
  const gscPath = path.resolve(__dirname, '../legacy-data/gsc/Pages.csv');
  const citiesPath = path.resolve(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.resolve(__dirname, '../data/normalized/countries.json');

  const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  const gscContent = fs.readFileSync(gscPath, 'utf8');
  const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  const cityMap = new Map(cities.map(c => [c.urlPath, c]));
  const countryMap = new Map(countries.map(c => [`/country/${c.slug}/`, c]));

  const gscLines = gscContent.split('\n').slice(1).map(l => l.split(',')[0].trim()).filter(Boolean);

  // Build unified deduplicated list of URLs
  const urlRegistry = new Map();

  inv.forEach(item => {
    urlRegistry.set(item.url, {
      url: item.url,
      path: item.url.replace('https://mawaqetsalat.com', ''),
      type: item.type,
      slug: item.slug,
      source: 'full_url_inventory',
    });
  });

  gscLines.forEach(u => {
    if (!urlRegistry.has(u)) {
      urlRegistry.set(u, {
        url: u,
        path: u.replace('https://mawaqetsalat.com', ''),
        type: u.includes('/city/') ? 'city' : u.includes('/country/') ? 'country' : 'static',
        slug: u.split('/').filter(Boolean).pop() || '',
        source: 'gsc_pages_csv',
      });
    }
  });

  console.log(`Total deduplicated URLs to test: ${urlRegistry.size}\n`);

  let count200 = 0;
  let count301 = 0;
  let countErrors = 0;
  let missingCanonicals = 0;
  let soft404s = 0;

  const results = [];

  for (const [rawUrl, item] of urlRegistry.entries()) {
    try {
      const res = await fetchWithRedirects(item.path);
      const canonical = extractCanonical(res.html);
      const title = extractTitle(res.html);

      // Validate status
      const isExpectedRedirect = item.path === '/sample-page/' || item.path === '/sample-page';
      const isSuccess = isExpectedRedirect ? res.initialStatus === 301 : res.finalStatus === 200;

      // Soft 404 check: does the title say "صفحة غير موجودة" or 404 when 200 returned?
      const isSoft404 = res.finalStatus === 200 && title && (title.includes('صفحة غير موجودة') || title.includes('404'));

      // Content verification based on expected entity
      let contentVerified = false;
      if (item.type === 'city') {
        const cityObj = cityMap.get(item.path);
        if (cityObj && res.html.includes(cityObj.nameAr) && res.html.includes('مواقيت الصلاة')) {
          contentVerified = true;
        }
      } else if (item.type === 'country') {
        const countryObj = countryMap.get(item.path);
        if (countryObj && res.html.includes(countryObj.nameAr) && res.html.includes('مواقيت الصلاة')) {
          contentVerified = true;
        }
      } else {
        // Static pages
        contentVerified = res.finalStatus === 200 || isExpectedRedirect;
      }

      if (isSuccess && !isSoft404) {
        if (isExpectedRedirect) count301++;
        else count200++;
      } else {
        countErrors++;
      }

      if (!canonical && !isExpectedRedirect) {
        missingCanonicals++;
      }

      if (isSoft404) {
        soft404s++;
      }

      results.push({
        url: rawUrl,
        path: item.path,
        type: item.type,
        initialStatus: res.initialStatus,
        finalStatus: res.finalStatus,
        redirects: res.redirects,
        canonical,
        title,
        contentVerified,
        isSoft404,
        passed: isSuccess && !isSoft404 && (canonical || isExpectedRedirect),
      });

    } catch (err) {
      countErrors++;
      results.push({
        url: rawUrl,
        path: item.path,
        type: item.type,
        error: err.message,
        passed: false,
      });
    }
  }

  // 404 Tests
  const notFoundTests = [
    '/city/non-existent-city-999/',
    '/country/non-existent-country-999/',
    '/completely-random-page-404/',
  ];

  let notFoundPassed = 0;
  for (const nfPath of notFoundTests) {
    const res = await fetch(`${BASE_URL}${nfPath}`);
    if (res.status === 404) {
      notFoundPassed++;
    } else {
      console.error(`Unexpected status for ${nfPath}: ${res.status}`);
    }
  }

  console.log(`-------------------------------------------------------`);
  console.log(`Summary of Legacy URL Verification:`);
  console.log(`-------------------------------------------------------`);
  console.log(`Total URLs Audited:            ${urlRegistry.size}`);
  console.log(`200 OK Direct Responses:       ${count200}`);
  console.log(`301 Intentional Redirects:     ${count301}`);
  console.log(`Errors / Failed URLs:          ${countErrors}`);
  console.log(`Missing Canonical Tags:        ${missingCanonicals}`);
  console.log(`Soft 404s Detected:            ${soft404s}`);
  console.log(`True 404 Endpoint Checks:      ${notFoundPassed} / ${notFoundTests.length} Passed`);
  console.log(`-------------------------------------------------------\n`);

  // Write detailed machine-readable audit report
  const reportPath = path.resolve(__dirname, '../docs/LEGACY_URL_FULL_AUDIT_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTested: urlRegistry.size,
    count200,
    count301,
    countErrors,
    missingCanonicals,
    soft404s,
    results,
  }, null, 2));

  console.log(`Detailed JSON results written to: docs/LEGACY_URL_FULL_AUDIT_RESULTS.json\n`);

  if (countErrors > 0 || soft404s > 0 || missingCanonicals > 0) {
    console.error(`Audit FAILED with errors.`);
    process.exit(1);
  } else {
    console.log(`Audit PASSED: 100% of legacy URLs verified.`);
  }
}

runAudit();
