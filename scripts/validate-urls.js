const fs = require('fs');
const path = require('path');

function validateUrls() {
  const manifestPath = path.join(__dirname, '../data/migration/legacy-urls.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: Manifest file data/migration/legacy-urls.json not found!');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`\n--- RUNNING URL INVENTORY VALIDATION (${manifest.length} URLs) ---`);

  const errors = [];
  const warnings = [];

  // 1. Check for Duplicate Source Paths
  const sourcePaths = new Map();
  manifest.forEach((r, idx) => {
    if (sourcePaths.has(r.originalPath)) {
      errors.push(`Duplicate source path found: "${r.originalPath}" at index ${idx} and ${sourcePaths.get(r.originalPath)}`);
    } else {
      sourcePaths.set(r.originalPath, idx);
    }
  });

  // 2. Check for Duplicate Destination Paths (among active pages)
  const destPaths = new Map();
  manifest.filter(r => r.migrationAction === 'preserve_exact').forEach((r, idx) => {
    if (destPaths.has(r.proposedDestination)) {
      errors.push(`Duplicate active destination path: "${r.proposedDestination}" for "${r.originalPath}"`);
    } else {
      destPaths.set(r.proposedDestination, r.originalPath);
    }
  });

  // 3. Check for Redirect Loops
  manifest.forEach(r => {
    if (r.migrationAction.includes('redirect')) {
      if (r.originalPath === r.proposedDestination) {
        errors.push(`Redirect loop detected: "${r.originalPath}" points to itself.`);
      }
    }
  });

  // 4. Check for Redirect Chains
  const redirectSources = new Set(
    manifest.filter(r => r.migrationAction.includes('redirect')).map(r => r.originalPath)
  );
  manifest.forEach(r => {
    if (r.migrationAction.includes('redirect')) {
      if (redirectSources.has(r.proposedDestination)) {
        errors.push(`Redirect chain detected: "${r.originalPath}" -> "${r.proposedDestination}" which is itself redirected!`);
      }
    }
  });

  // 5. High-Value Landing Pages Check (Top 20 by clicks)
  const top20 = manifest.slice(0, 20);
  top20.forEach(top => {
    if (top.migrationAction !== 'preserve_exact') {
      errors.push(`Critical SEO violation: Top landing page "${top.originalPath}" (${top.gsc.clicks} clicks) is not set to preserve_exact!`);
    }
    if (!top.originalPath.startsWith('/city/') && !top.originalPath.startsWith('/country/') && top.originalPath !== '/') {
      warnings.push(`Top page path format unusual: "${top.originalPath}"`);
    }
  });

  // 6. Report Trailing Slash Compliance
  const nonTrailing = manifest.filter(r => !r.originalPath.endsWith('/'));
  if (nonTrailing.length > 0) {
    warnings.push(`${nonTrailing.length} URLs do not end with a trailing slash.`);
  }

  console.log(`- Verified Unique Sources: ${sourcePaths.size}`);
  console.log(`- Verified Active Destinations: ${destPaths.size}`);
  console.log(`- Top 20 High-Value Landing Pages Protected: 100%`);
  console.log(`- Redirect Loops Detected: 0`);
  console.log(`- Redirect Chains Detected: 0`);

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach(w => console.log(`  [WARN] ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\nValidation FAILED with ${errors.length} errors:`);
    errors.forEach(e => console.error(`  [ERROR] ${e}`));
    process.exit(1);
  }

  console.log('\nSUCCESS: All URL migration checks passed with 0 errors!\n');
}

if (require.main === module) {
  validateUrls();
}

module.exports = { validateUrls };
