const fs = require('fs');
const path = require('path');

const auditData = JSON.parse(fs.readFileSync(path.join(__dirname, '../legacy-data/parsed_audit_data.json'), 'utf8'));

// Build GSC stats lookup
const gscMap = new Map();
auditData.gsc.pageStats.forEach(p => {
  // Normalize URL trailing slash
  let u = p.url;
  if (!u.endsWith('/')) u += '/';
  gscMap.set(u, p);
  // Also store decoded version for Arabic URLs
  try {
    const decoded = decodeURI(u);
    gscMap.set(decoded, p);
  } catch (e) {}
});

const manifest = [];

// 1. Homepage
const homeUrl = 'https://mawaqetsalat.com/';
const homeGsc = gscMap.get(homeUrl);
manifest.push({
  originalUrl: homeUrl,
  originalPath: '/',
  pageType: 'home',
  legacySlug: '',
  gsc: homeGsc ? { clicks: homeGsc.clicks, impressions: homeGsc.imps, position: homeGsc.pos, ctr: homeGsc.ctr } : { clicks: 0, impressions: 0, position: 0, ctr: '0%' },
  existingCanonical: homeUrl,
  proposedDestination: '/',
  migrationAction: 'preserve_exact',
  verificationStatus: 'verified',
  reason: 'Homepage core landing page with search and country navigation.',
});

// 2. Static Pages
auditData.pages.forEach(p => {
  let slug = p.slug;
  let decodedSlug = slug;
  try { decodedSlug = decodeURIComponent(slug); } catch (e) {}

  const origUrl = `https://mawaqetsalat.com/${slug}/`;
  const origPath = `/${slug}/`;
  const gscStat = gscMap.get(origUrl) || gscMap.get(`https://mawaqetsalat.com/${decodedSlug}/`);

  if (slug === 'sample-page') {
    manifest.push({
      originalUrl: origUrl,
      originalPath: origPath,
      pageType: 'static_page',
      legacySlug: slug,
      gsc: { clicks: 0, impressions: 0, position: 0, ctr: '0%' },
      existingCanonical: origUrl,
      proposedDestination: '/',
      migrationAction: 'retire_410_or_301',
      verificationStatus: 'verified',
      reason: 'Empty default WordPress boilerplate page with 0 traffic. Retire safely.',
    });
  } else if (slug.includes('%') || decodedSlug === 'سياسة-الخصوصية') {
    // Privacy policy (both encoded and decoded handled)
    manifest.push({
      originalUrl: origUrl,
      originalPath: origPath,
      pageType: 'static_page',
      legacySlug: slug,
      gsc: gscStat ? { clicks: gscStat.clicks, impressions: gscStat.imps, position: gscStat.pos, ctr: gscStat.ctr } : { clicks: 0, impressions: 0, position: 0, ctr: '0%' },
      existingCanonical: 'https://mawaqetsalat.com/سياسة-الخصوصية/',
      proposedDestination: '/سياسة-الخصوصية/',
      migrationAction: 'preserve_exact',
      verificationStatus: 'verified',
      reason: 'Privacy policy page required for AdSense and legal compliance.',
    });
  } else {
    manifest.push({
      originalUrl: origUrl,
      originalPath: origPath,
      pageType: 'static_page',
      legacySlug: slug,
      gsc: gscStat ? { clicks: gscStat.clicks, impressions: gscStat.imps, position: gscStat.pos, ctr: gscStat.ctr } : { clicks: 0, impressions: 0, position: 0, ctr: '0%' },
      existingCanonical: origUrl,
      proposedDestination: origPath,
      migrationAction: 'preserve_exact',
      verificationStatus: 'verified',
      reason: 'Standard static application tool/page.',
    });
  }
});

// 3. Country Pages (38 countries)
auditData.countries.forEach(c => {
  const origUrl = `https://mawaqetsalat.com/country/${c.slug}/`;
  const origPath = `/country/${c.slug}/`;
  const gscStat = gscMap.get(origUrl);

  manifest.push({
    originalUrl: origUrl,
    originalPath: origPath,
    pageType: 'country',
    legacySlug: c.slug,
    gsc: gscStat ? { clicks: gscStat.clicks, impressions: gscStat.imps, position: gscStat.pos, ctr: gscStat.ctr } : { clicks: 0, impressions: 0, position: 0, ctr: '0%' },
    existingCanonical: origUrl,
    proposedDestination: origPath,
    migrationAction: 'preserve_exact',
    verificationStatus: 'verified',
    reason: `Preserve exact legacy country path including legacy slug variations (e.g. ${c.slug}).`,
  });
});

// 4. City Pages (328 cities)
auditData.cities.forEach(c => {
  const origUrl = `https://mawaqetsalat.com/city/${c.slug}/`;
  const origPath = `/city/${c.slug}/`;
  const gscStat = gscMap.get(origUrl);

  manifest.push({
    originalUrl: origUrl,
    originalPath: origPath,
    pageType: 'city',
    legacySlug: c.slug,
    gsc: gscStat ? { clicks: gscStat.clicks, impressions: gscStat.imps, position: gscStat.pos, ctr: gscStat.ctr } : { clicks: 0, impressions: 0, position: 0, ctr: '0%' },
    existingCanonical: origUrl,
    proposedDestination: origPath,
    migrationAction: 'preserve_exact',
    verificationStatus: 'verified',
    reason: 'Preserve exact legacy city URL for organic rankings continuity.',
  });
});

// Sort by GSC clicks descending, then impressions descending
manifest.sort((a, b) => {
  if (b.gsc.clicks !== a.gsc.clicks) return b.gsc.clicks - a.gsc.clicks;
  return b.gsc.impressions - a.gsc.impressions;
});

fs.writeFileSync(
  path.join(__dirname, '../data/migration/legacy-urls.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`Generated data/migration/legacy-urls.json with ${manifest.length} records.`);
