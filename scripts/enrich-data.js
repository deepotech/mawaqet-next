const fs = require('fs');
const path = require('path');
const cityTimezones = require('city-timezones');
const ct = require('countries-and-timezones');

const auditData = JSON.parse(fs.readFileSync(path.join(__dirname, '../legacy-data/parsed_audit_data.json'), 'utf8'));

// 1. COUNTRY MAPPING & CALCULATION METHOD MAP
// Preserving verified legacy methods while mapping standard identifiers
const countryCodeMap = {
  'saudi arabia': 'SA',
  'egypt': 'EG',
  'morocco': 'MA',
  'yemen': 'YE',
  'bahrain': 'BH',
  'united arab emirates': 'AE',
  'qatar': 'QA',
  'kuwait': 'KW',
  'oman': 'OM',
  'syria': 'SY',
  'libya': 'LY',
  'palestine': 'PS',
  'sudan': 'SD',
  'lebanon': 'LB',
  'iraq': 'IQ',
  'jordan': 'JO',
  'tunisia': 'TN',
  'algeria': 'DZ',
  'usa': 'US',
  'uk': 'GB',
  'italy': 'IT',
  'france': 'FR',
  'spain': 'ES',
  'india': 'IN',
  'turkey': 'TR',
  'russia': 'RU',
  'canada': 'CA',
  'germany': 'DE',
  'malaysia': 'MY',
  'norway': 'NO',
  'sweden': 'SE',
  'philippines': 'PH',
  'china': 'CN',
  'georgia': 'GE',
  'netherlands': 'NL',
  'ukraine': 'UA',
  'Uzbekistan': 'UZ',
  'indonesia': 'ID',
};

// Legacy method map (from main.js)
// saudi arabia: 4, kuwait: 9, qatar: 10, egypt: 3, morocco: 15, default: 8
const countryDefaultMethodMap = {
  'SA': 4,
  'EG': 3,
  'MA': 15,
  'KW': 9,
  'QA': 10,
  // All others used Method 8 in legacy
};

// Map country post ID to cities array
const countryCityMap = new Map();
auditData.countries.forEach(c => {
  const metaCities = c.meta.cities;
  const cityIds = [];
  if (metaCities) {
    const matches = metaCities.matchAll(/s:\d+:"(\d+)"/g);
    for (const m of matches) {
      cityIds.push(m[1]);
    }
  }
  countryCityMap.set(c.id.toString(), { country: c, cityIds });
});

// Normalized countries
const normalizedCountries = auditData.countries.map((c, index) => {
  const code = countryCodeMap[c.meta.country_name_en] || 'XX';
  const flagUrl = `/flags/${code.toLowerCase()}.png`;
  const defaultMethodId = countryDefaultMethodMap[code] || 8;
  const cityIds = countryCityMap.get(c.id.toString())?.cityIds || [];

  return {
    id: index + 1,
    slug: c.slug,
    nameAr: c.meta.country_name.replace('مواقيت الصلاة في ', '').trim(),
    nameEn: c.meta.country_name_en,
    code,
    flagUrl,
    defaultMethodId,
    contentAr: c.meta.country_text || '',
    legacyPostId: parseInt(c.id, 10),
    totalCities: cityIds.length,
  };
});

// Create lookup for country by post ID and by English name
const countryByLegacyId = new Map(auditData.countries.map(c => [c.id.toString(), c]));
const normalizedCountryByLegacyId = new Map(normalizedCountries.map(nc => [nc.legacyPostId.toString(), nc]));

// Build city to country relationship
const cityToCountryLookup = new Map();
for (const [countryId, info] of countryCityMap) {
  const normCountry = normalizedCountryByLegacyId.get(countryId);
  for (const cId of info.cityIds) {
    cityToCountryLookup.set(cId, normCountry);
  }
}

// Known transliteration/alias overrides for GeoNames matching
const nameAliases = {
  'mecca': 'makkah',
  'madina': 'medina',
  'erbil': 'arbil',
  'najaf': 'an najaf',
  'kharkov': 'kharkiv',
  'asyut': 'asiut',
  'beni-mellal': 'beni mellal',
  'beni mellal': 'beni mellal',
  'sharm el sheikh': 'sharm el-sheikh',
  'sharm-el-sheikh': 'sharm el-sheikh',
  'al-hasakah': 'al hasakah',
  'hasaka': 'al hasakah',
  'sale': 'salé',
  'tetouan': 'tétouan',
  'taza': 'taza',
  'oujda': 'oujda',
  'temara': 'témara',
  'safi': 'safi',
  'agadir': 'agadir',
  'marrakesh': 'marrakech',
  'fes': 'fez',
  'fezs': 'fez',
  'samarkand': 'samarqand',
};

// Helper to query Nominatim OSM synchronously or with delay
async function queryNominatim(query, countryCode) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=${countryCode.toLowerCase()}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MawaqetSalat-Enrichment/1.0 (dev@mawaqetsalat.com)' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.length > 0) {
      return {
        lat: parseFloat(json[0].lat),
        lng: parseFloat(json[0].lon),
        displayName: json[0].display_name
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function enrichAll() {
  console.log('Starting data enrichment for 328 cities and 38 countries...');

  const normalizedCities = [];
  const unresolved = [];
  const provenanceStats = {
    'GeoNames (city-timezones)': 0,
    'OpenStreetMap Nominatim': 0,
    'Unresolved': 0,
  };

  for (let i = 0; i < auditData.cities.length; i++) {
    const c = auditData.cities[i];
    const normCountry = cityToCountryLookup.get(c.id.toString());
    const countryCode = normCountry ? normCountry.code : 'XX';
    const rawNameEn = (c.meta.city_name_en || '').trim();
    const cleanNameEn = rawNameEn.toLowerCase().replace(/_/g, ' ');

    let coordinates = null;
    let timezone = null;
    let verificationStatus = 'missing_coordinates';
    let enrichmentSource = 'Unresolved';
    let notes = '';

    // Step 1: Look up in GeoNames (city-timezones)
    const candidates = cityTimezones.lookupViaCity(cleanNameEn);
    const countryCandidates = candidates.filter(cand => cand.iso2 === countryCode);

    if (countryCandidates.length > 0) {
      // Pick highest population or exact match
      const best = countryCandidates.sort((a, b) => (b.pop || 0) - (a.pop || 0))[0];
      coordinates = { latitude: best.lat, longitude: best.lng };
      timezone = best.timezone;
      verificationStatus = 'verified_exact';
      enrichmentSource = 'GeoNames (city-timezones)';
      provenanceStats['GeoNames (city-timezones)']++;
    } else {
      // Try alias
      const alias = nameAliases[cleanNameEn];
      if (alias) {
        const aliasCandidates = cityTimezones.lookupViaCity(alias).filter(cand => cand.iso2 === countryCode);
        if (aliasCandidates.length > 0) {
          const best = aliasCandidates.sort((a, b) => (b.pop || 0) - (a.pop || 0))[0];
          coordinates = { latitude: best.lat, longitude: best.lng };
          timezone = best.timezone;
          verificationStatus = 'verified_exact';
          enrichmentSource = 'GeoNames (city-timezones)';
          notes = `Matched via alias "${alias}"`;
          provenanceStats['GeoNames (city-timezones)']++;
        }
      }
    }

    // Step 2: Fallback to OpenStreetMap Nominatim if not found in GeoNames
    if (!coordinates && countryCode !== 'XX') {
      console.log(`[OSM Query] ${cleanNameEn}, country: ${countryCode}...`);
      await sleep(1000); // Respect Nominatim 1 req/sec policy
      const osmRes = await queryNominatim(cleanNameEn, countryCode);
      if (osmRes) {
        coordinates = { latitude: osmRes.lat, longitude: osmRes.lng };
        // Resolve timezone by country
        const countryTzs = ct.getTimezonesForCountry(countryCode) || [];
        timezone = countryTzs.length > 0 ? countryTzs[0].name : null;
        verificationStatus = 'verified_regional';
        enrichmentSource = 'OpenStreetMap Nominatim';
        notes = `OSM match: ${osmRes.displayName}`;
        provenanceStats['OpenStreetMap Nominatim']++;
      } else {
        // Try Arabic name query on OSM
        const cleanNameAr = (c.meta.city_name_ar || '').replace('مواقيت الصلاة في ', '').trim();
        if (cleanNameAr) {
          await sleep(1000);
          const osmArRes = await queryNominatim(cleanNameAr, countryCode);
          if (osmArRes) {
            coordinates = { latitude: osmArRes.lat, longitude: osmArRes.lng };
            const countryTzs = ct.getTimezonesForCountry(countryCode) || [];
            timezone = countryTzs.length > 0 ? countryTzs[0].name : null;
            verificationStatus = 'verified_regional';
            enrichmentSource = 'OpenStreetMap Nominatim';
            notes = `OSM Arabic match: ${osmArRes.displayName}`;
            provenanceStats['OpenStreetMap Nominatim']++;
          }
        }
      }
    }

    if (!coordinates) {
      verificationStatus = 'unresolved_ambiguous';
      enrichmentSource = 'Unresolved';
      provenanceStats['Unresolved']++;
      unresolved.push({
        id: c.id,
        slug: c.slug,
        nameAr: c.meta.city_name_ar,
        nameEn: c.meta.city_name_en,
        country: normCountry?.nameEn || 'unknown',
        countryCode
      });
    }

    normalizedCities.push({
      id: i + 1,
      countryId: normCountry ? normCountry.id : 0,
      countryCode,
      slug: c.slug,
      urlPath: `/city/${c.slug}/`,
      nameAr: (c.meta.city_name_ar || '').replace('مواقيت الصلاة في ', '').trim(),
      nameEn: cleanNameEn,
      coordinates,
      timezone,
      calculationMethodId: normCountry ? normCountry.defaultMethodId : 8,
      seoTitle: c.meta.rank_math_title || '',
      seoDescription: c.meta.rank_math_description || '',
      contentAr: c.meta.city_text || '',
      legacyPostId: parseInt(c.id, 10),
      verificationStatus,
      enrichmentSource,
      notes: notes || undefined,
    });
  }

  // Save files
  fs.writeFileSync(
    path.join(__dirname, '../data/normalized/countries.json'),
    JSON.stringify(normalizedCountries, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, '../data/normalized/cities.json'),
    JSON.stringify(normalizedCities, null, 2)
  );

  const summary = {
    totalCountries: normalizedCountries.length,
    totalCities: normalizedCities.length,
    verifiedExact: normalizedCities.filter(c => c.verificationStatus === 'verified_exact').length,
    verifiedRegional: normalizedCities.filter(c => c.verificationStatus === 'verified_regional').length,
    unresolvedCount: unresolved.length,
    missingCoordinatesCount: normalizedCities.filter(c => !c.coordinates).length,
    missingTimezonesCount: normalizedCities.filter(c => !c.timezone).length,
    provenanceStats,
    unresolvedList: unresolved,
  };

  fs.writeFileSync(
    path.join(__dirname, '../data/normalized/enrichment-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('Enrichment complete! Summary:', summary);
}

enrichAll().catch(console.error);
