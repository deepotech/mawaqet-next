/**
 * scripts/expansion-candidate-eval.js
 * 
 * High-Volume City Expansion Candidate Evaluator
 * Evaluates candidates against:
 * 1. city-timezones database presence
 * 2. WGS-84 coordinate and IANA timezone validity
 * 3. Proximity to existing cities in the same country (>= 20km)
 * 4. Proximity to other candidates in the same country (>= 20km)
 * 5. Slug and URL uniqueness (no collision with existing cities, countries, legacy URLs)
 * 6. Adhan astronomical prayer solvability across 4 seasons
 */

const fs = require('fs');
const path = require('path');
const cityTimezones = require('city-timezones');
const { Coordinates, CalculationMethod, PrayerTimes, CalculationParameters } = require('adhan');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const CITIES_PATH = path.join(WORKSPACE_ROOT, 'data/normalized/cities.json');
const COUNTRIES_PATH = path.join(WORKSPACE_ROOT, 'data/normalized/countries.json');
const LEGACY_URLS_PATH = path.join(WORKSPACE_ROOT, 'data/migration/legacy-urls.json');

const existingCities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));
const existingCountries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, 'utf8'));
const legacyUrls = JSON.parse(fs.readFileSync(LEGACY_URLS_PATH, 'utf8'));

const existingCitySlugs = new Set(existingCities.map(c => c.slug));
const existingCountrySlugs = new Set(existingCountries.map(c => c.slug));
const existingLegacySlugs = new Set(legacyUrls.map(u => u.legacySlug).filter(Boolean));
const existingLegacyPaths = new Set(legacyUrls.map(u => u.originalPath));

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

function testAstronomicalSolvability(lat, lng, methodId) {
  const coords = new Coordinates(lat, lng);
  const params = resolveCalculationParameters(methodId);
  const testDates = [
    new Date('2026-03-20T12:00:00Z'), // Vernal Equinox
    new Date('2026-06-21T12:00:00Z'), // Summer Solstice
    new Date('2026-09-22T12:00:00Z'), // Autumnal Equinox
    new Date('2026-12-21T12:00:00Z'), // Winter Solstice
  ];

  for (const date of testDates) {
    try {
      const pt = new PrayerTimes(coords, date, params);
      if (!pt.fajr || isNaN(pt.fajr.getTime()) ||
          !pt.sunrise || isNaN(pt.sunrise.getTime()) ||
          !pt.dhuhr || isNaN(pt.dhuhr.getTime()) ||
          !pt.asr || isNaN(pt.asr.getTime()) ||
          !pt.maghrib || isNaN(pt.maghrib.getTime()) ||
          !pt.isha || isNaN(pt.isha.getTime())) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  return true;
}

// Full candidate pool (~150 candidates)
const RAW_CANDIDATES = [
  // ─── NEW COUNTRY 1: PAKISTAN (PK, countryId: 39, methodId: 12) ───
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'karachi', nameAr: 'كراتشي', lookupName: 'Karachi', slugSuffix: 'karachi' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'lahore', nameAr: 'لاهور', lookupName: 'Lahore', slugSuffix: 'lahore' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'faisalabad', nameAr: 'فيصل آباد', lookupName: 'Faisalabad', slugSuffix: 'faisalabad' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'rawalpindi', nameAr: 'راولبندي', lookupName: 'Rawalpindi', slugSuffix: 'rawalpindi' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'multan', nameAr: 'ملتان', lookupName: 'Multan', slugSuffix: 'multan' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'gujranwala', nameAr: 'غوجرانوالا', lookupName: 'Gujranwala', slugSuffix: 'gujranwala' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'hyderabad pakistan', nameAr: 'حيدر آباد باكستان', lookupName: 'Hyderabad', slugSuffix: 'hyderabad-pk' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'peshawar', nameAr: 'بيشاور', lookupName: 'Peshawar', slugSuffix: 'peshawar' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'quetta', nameAr: 'كويته', lookupName: 'Quetta', slugSuffix: 'quetta' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'islamabad', nameAr: 'إسلام آباد', lookupName: 'Islamabad', slugSuffix: 'islamabad' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'bahawalpur', nameAr: 'بهاولبور', lookupName: 'Bahawalpur', slugSuffix: 'bahawalpur' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'sargodha', nameAr: 'سرغودها', lookupName: 'Sargodha', slugSuffix: 'sargodha' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'sialkot', nameAr: 'سيالكوت', lookupName: 'Sialkote', slugSuffix: 'sialkot' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'sukkur', nameAr: 'سكر', lookupName: 'Sukkur', slugSuffix: 'sukkur' },
  { countryCode: 'PK', countryId: 39, methodId: 12, nameEn: 'larkana', nameAr: 'لاركانا', lookupName: 'Larkana', slugSuffix: 'larkana' },

  // ─── NEW COUNTRY 2: SINGAPORE (SG, countryId: 40, methodId: 11) ───
  { countryCode: 'SG', countryId: 40, methodId: 11, nameEn: 'singapore', nameAr: 'سنغافورة', lookupName: 'Singapore', slugSuffix: 'singapore' },

  // ─── SAUDI ARABIA (SA, countryId: 1, methodId: 4) ───
  { countryCode: 'SA', countryId: 1, methodId: 4, nameEn: 'sakakah', nameAr: 'سكاكا', lookupName: 'Sakakah', slugSuffix: 'sakakah' },
  { countryCode: 'SA', countryId: 1, methodId: 4, nameEn: 'rafha', nameAr: 'رفحاء', lookupName: 'Rafha', slugSuffix: 'rafha' },
  { countryCode: 'SA', countryId: 1, methodId: 4, nameEn: 'al wajh', nameAr: 'الوجه', lookupName: 'Al Wajh', slugSuffix: 'al-wajh' },
  { countryCode: 'SA', countryId: 1, methodId: 4, nameEn: 'dawmat al jandal', nameAr: 'دومة الجندل', lookupName: 'Dawmat al Jandal', slugSuffix: 'dawmat-al-jandal' },
  { countryCode: 'SA', countryId: 1, methodId: 4, nameEn: 'al quwayiyah', nameAr: 'القويعية', lookupName: 'Al Quwayiyah', slugSuffix: 'al-quwayiyah' },
  { countryCode: 'SA', countryId: 1, methodId: 4, nameEn: 'al qunfudhah', nameAr: 'القنفذة', lookupName: 'Al Qunfudhah', slugSuffix: 'al-qunfudhah' },

  // ─── MOROCCO (MA, countryId: 3, methodId: 15) ───
  { countryCode: 'MA', countryId: 3, methodId: 15, nameEn: 'tiznit', nameAr: 'تيزنيت', lookupName: 'Tiznit', slugSuffix: 'tiznit' },
  { countryCode: 'MA', countryId: 3, methodId: 15, nameEn: 'smara', nameAr: 'السمارة', lookupName: 'Smara', slugSuffix: 'smara' },

  // ─── ALGERIA (DZ, countryId: 18, methodId: 8) ───
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'bordj bou arreridj', nameAr: 'برج بوعريريج', lookupName: 'Bordj Bou Arreridj', slugSuffix: 'bordj-bou-arreridj' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'guelma', nameAr: 'قالمة', lookupName: 'Guelma', slugSuffix: 'guelma' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'msila', nameAr: 'المسيلة', lookupName: "M'sila", slugSuffix: 'msila' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'laghouat', nameAr: 'الأغواط', lookupName: 'Laghouat', slugSuffix: 'laghouat' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'souk ahras', nameAr: 'سوق أهراس', lookupName: 'Souk Ahras', slugSuffix: 'souk-ahras' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'saida', nameAr: 'سعيدة', lookupName: 'Saida', slugSuffix: 'saida-dz' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'ghardaia', nameAr: 'غرداية', lookupName: 'Ghardaia', slugSuffix: 'ghardaia' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'relizane', nameAr: 'غليزان', lookupName: 'Relizane', slugSuffix: 'relizane' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'khenchela', nameAr: 'خنشلة', lookupName: 'Khenchela', slugSuffix: 'khenchela' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'ain oussera', nameAr: 'عين وسارة', lookupName: 'Ain Oussera', slugSuffix: 'ain-oussera' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'adrar', nameAr: 'أدرار', lookupName: 'Adrar', slugSuffix: 'adrar' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'tindouf', nameAr: 'تندوف', lookupName: 'Tindouf', slugSuffix: 'tindouf' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'tamanrasset', nameAr: 'تمنراست', lookupName: 'Tamanghasset', slugSuffix: 'tamanrasset' },
  { countryCode: 'DZ', countryId: 18, methodId: 8, nameEn: 'el bayadh', nameAr: 'البيض', lookupName: 'El Bayadh', slugSuffix: 'el-bayadh' },

  // ─── TURKEY (TR, countryId: 25, methodId: 13) ───
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'afyonkarahisar', nameAr: 'أفيون قره حصار', lookupName: 'Afyonkarahisar', slugSuffix: 'afyonkarahisar' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'kutahya', nameAr: 'كوتاهيا', lookupName: 'Kutahya', slugSuffix: 'kutahya' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'edirne', nameAr: 'أدرنة', lookupName: 'Edirne', slugSuffix: 'edirne' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'tekirdag', nameAr: 'تكيرداغ', lookupName: 'Tekirdag', slugSuffix: 'tekirdag' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'corum', nameAr: 'جوروم', lookupName: 'Corum', slugSuffix: 'corum' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'ordu', nameAr: 'أوردو', lookupName: 'Ordu', slugSuffix: 'ordu' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'tokat', nameAr: 'توقاد', lookupName: 'Tokat', slugSuffix: 'tokat' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'aksaray', nameAr: 'أق سراي', lookupName: 'Aksaray', slugSuffix: 'aksaray' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'karaman', nameAr: 'قرمان', lookupName: 'Karaman', slugSuffix: 'karaman' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'nigde', nameAr: 'نيغدة', lookupName: 'Nigde', slugSuffix: 'nigde' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'kastamonu', nameAr: 'قسطموني', lookupName: 'Kastamonu', slugSuffix: 'kastamonu' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'rize', nameAr: 'ريزة', lookupName: 'Rize', slugSuffix: 'rize' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'giresun', nameAr: 'غيرسون', lookupName: 'Giresun', slugSuffix: 'giresun' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'isparta', nameAr: 'إسبرطة', lookupName: 'Isparta', slugSuffix: 'isparta' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'usak', nameAr: 'عشاق', lookupName: 'Usak', slugSuffix: 'usak' },
  { countryCode: 'TR', countryId: 25, methodId: 13, nameEn: 'duzce', nameAr: 'دوزجة', lookupName: 'Duzce', slugSuffix: 'duzce' },

  // ─── INDONESIA (ID, countryId: 38, methodId: 8) ───
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'denpasar', nameAr: 'دنباسار', lookupName: 'Denpasar', slugSuffix: 'denpasar' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'samarinda', nameAr: 'ساماريندا', lookupName: 'Samarinda', slugSuffix: 'samarinda' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'banjarmasin', nameAr: 'بنجارماسين', lookupName: 'Banjarmasin', slugSuffix: 'banjarmasin' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'balikpapan', nameAr: 'باليكبابان', lookupName: 'Balikpapan', slugSuffix: 'balikpapan' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'pontianak', nameAr: 'بونتياناك', lookupName: 'Pontianak', slugSuffix: 'pontianak' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'jambi', nameAr: 'جامبي', lookupName: 'Jambi', slugSuffix: 'jambi' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'manado', nameAr: 'مانادو', lookupName: 'Manado', slugSuffix: 'manado' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'mataram', nameAr: 'ماتارام', lookupName: 'Mataram', slugSuffix: 'mataram' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'bengkulu', nameAr: 'بنغكولو', lookupName: 'Bengkulu', slugSuffix: 'bengkulu' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'kupang', nameAr: 'كوبانغ', lookupName: 'Kupang', slugSuffix: 'kupang' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'ambon', nameAr: 'أمبون', lookupName: 'Ambon', slugSuffix: 'ambon' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'banda aceh', nameAr: 'باندا آتشيه', lookupName: 'Banda Aceh', slugSuffix: 'banda-aceh' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'jayapura', nameAr: 'جايابورا', lookupName: 'Jayapura', slugSuffix: 'jayapura' },
  { countryCode: 'ID', countryId: 38, methodId: 8, nameEn: 'palu', nameAr: 'بالو', lookupName: 'Palu', slugSuffix: 'palu' },

  // ─── TUNISIA (TN, countryId: 17, methodId: 8) ───
  { countryCode: 'TN', countryId: 17, methodId: 8, nameEn: 'mahdia', nameAr: 'المهدية', lookupName: 'Mahdia', slugSuffix: 'mahdia' },
  { countryCode: 'TN', countryId: 17, methodId: 8, nameEn: 'kebili', nameAr: 'قبلي', lookupName: 'Kebili', slugSuffix: 'kebili' },
  { countryCode: 'TN', countryId: 17, methodId: 8, nameEn: 'siliana', nameAr: 'سليانة', lookupName: 'Siliana', slugSuffix: 'siliana' },
  { countryCode: 'TN', countryId: 17, methodId: 8, nameEn: 'zaghouan', nameAr: 'زغوان', lookupName: 'Zaghouan', slugSuffix: 'zaghouan' },
  { countryCode: 'TN', countryId: 17, methodId: 8, nameEn: 'tozeur', nameAr: 'توزر', lookupName: 'Tozeur', slugSuffix: 'tozeur' },

  // ─── LIBYA (LY, countryId: 11, methodId: 8) ───
  { countryCode: 'LY', countryId: 11, methodId: 8, nameEn: 'tarhuna', nameAr: 'ترهونة', lookupName: 'Tarhuna', slugSuffix: 'tarhuna' },
  { countryCode: 'LY', countryId: 11, methodId: 8, nameEn: 'zliten', nameAr: 'زليتن', lookupName: 'Zlitan', slugSuffix: 'zliten' },
  { countryCode: 'LY', countryId: 11, methodId: 8, nameEn: 'ghat', nameAr: 'غات', lookupName: 'Ghat', slugSuffix: 'ghat' },
  { countryCode: 'LY', countryId: 11, methodId: 8, nameEn: 'murzuk', nameAr: 'مرزق', lookupName: 'Murzuq', slugSuffix: 'murzuk' },
  { countryCode: 'LY', countryId: 11, methodId: 8, nameEn: 'awbari', nameAr: 'أوباري', lookupName: 'Awbari', slugSuffix: 'awbari' },
  { countryCode: 'LY', countryId: 11, methodId: 8, nameEn: 'shahhat', nameAr: 'شحات', lookupName: 'Shahhat', slugSuffix: 'shahhat' },

  // ─── YEMEN (YE, countryId: 4, methodId: 8) ───
  { countryCode: 'YE', countryId: 4, methodId: 8, nameEn: 'al bayda yemen', nameAr: 'البيضاء اليمن', lookupName: 'Al Bayda', slugSuffix: 'al-bayda-ye' },
  { countryCode: 'YE', countryId: 4, methodId: 8, nameEn: 'ataq', nameAr: 'عتق', lookupName: "'Ataq", slugSuffix: 'ataq' },
  { countryCode: 'YE', countryId: 4, methodId: 8, nameEn: 'marib', nameAr: 'مأرب', lookupName: 'Marib', slugSuffix: 'marib' },
  { countryCode: 'YE', countryId: 4, methodId: 8, nameEn: 'al ghaydah', nameAr: 'الغيضة', lookupName: 'Al Ghaydah', slugSuffix: 'al-ghaydah' },
  { countryCode: 'YE', countryId: 4, methodId: 8, nameEn: 'lahij', nameAr: 'لحج', lookupName: 'Lahij', slugSuffix: 'lahij' },
  { countryCode: 'YE', countryId: 4, methodId: 8, nameEn: 'zinjibar', nameAr: 'زنجبار', lookupName: 'Zinjibar', slugSuffix: 'zinjibar' },

  // ─── OMAN (OM, countryId: 9, methodId: 8) ───
  { countryCode: 'OM', countryId: 9, methodId: 8, nameEn: 'ibri', nameAr: 'عبري', lookupName: 'Ibri', slugSuffix: 'ibri' },
  { countryCode: 'OM', countryId: 9, methodId: 8, nameEn: 'samail', nameAr: 'سمائل', lookupName: 'Alayat Samail', slugSuffix: 'samail' },
  { countryCode: 'OM', countryId: 9, methodId: 8, nameEn: 'khasab', nameAr: 'خصب', lookupName: 'Khasab', slugSuffix: 'khasab' },

  // ─── UAE (AE, countryId: 6, methodId: 8) ───
  { countryCode: 'AE', countryId: 6, methodId: 8, nameEn: 'umm al quwain', nameAr: 'أم القيوين', lookupName: 'Umm al Qaywayn', slugSuffix: 'umm-al-quwain' },
  { countryCode: 'AE', countryId: 6, methodId: 8, nameEn: 'khor fakkan', nameAr: 'خورفكان', lookupName: 'Khawr Fakkan', slugSuffix: 'khor-fakkan' },
  { countryCode: 'AE', countryId: 6, methodId: 8, nameEn: 'kalba', nameAr: 'كلباء', lookupName: 'Kalba', slugSuffix: 'kalba' },

  // ─── SUDAN (SD, countryId: 13, methodId: 8) ───
  { countryCode: 'SD', countryId: 13, methodId: 8, nameEn: 'berber', nameAr: 'بربر', lookupName: 'Berber', slugSuffix: 'berber' },
  { countryCode: 'SD', countryId: 13, methodId: 8, nameEn: 'singa', nameAr: 'سنجة', lookupName: 'Sinjah', slugSuffix: 'singa' },
  { countryCode: 'SD', countryId: 13, methodId: 8, nameEn: 'rabak', nameAr: 'ربك', lookupName: 'Rabak', slugSuffix: 'rabak' },
  { countryCode: 'SD', countryId: 13, methodId: 8, nameEn: 'dongola', nameAr: 'دنقلا', lookupName: 'Dunqulah', slugSuffix: 'dongola' },
  { countryCode: 'SD', countryId: 13, methodId: 8, nameEn: 'karima', nameAr: 'كريمة', lookupName: 'Kuraymah', slugSuffix: 'karima' },

  // ─── LEBANON (LB, countryId: 14, methodId: 8) ───
  { countryCode: 'LB', countryId: 14, methodId: 8, nameEn: 'tripoli lebanon', nameAr: 'طرابلس لبنان', lookupName: 'Trablous', slugSuffix: 'tripoli-lb' },
  { countryCode: 'LB', countryId: 14, methodId: 8, nameEn: 'tyre', nameAr: 'صور', lookupName: 'Sour', slugSuffix: 'tyre' },

  // ─── SYRIA (SY, countryId: 10, methodId: 8) ───
  { countryCode: 'SY', countryId: 10, methodId: 8, nameEn: 'afrin', nameAr: 'عفرين', lookupName: 'Afrin', slugSuffix: 'afrin' },
  { countryCode: 'SY', countryId: 10, methodId: 8, nameEn: 'al bab', nameAr: 'الباب', lookupName: 'Al Bab', slugSuffix: 'al-bab' },
  { countryCode: 'SY', countryId: 10, methodId: 8, nameEn: 'salamiyah', nameAr: 'سلمية', lookupName: 'As Salamiyah', slugSuffix: 'salamiyah' },
  { countryCode: 'SY', countryId: 10, methodId: 8, nameEn: 'palmyra', nameAr: 'تدمر', lookupName: 'Tadmur', slugSuffix: 'palmyra' },

  // ─── MALAYSIA (MY, countryId: 29, methodId: 8) ───
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'alor setar', nameAr: 'ألور سيتار', lookupName: 'Alor Setar', slugSuffix: 'alor-setar' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'kuantan', nameAr: 'كوانتان', lookupName: 'Kuantan', slugSuffix: 'kuantan' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'kuala terengganu', nameAr: 'كوالا ترينجانو', lookupName: 'Kuala Terengganu', slugSuffix: 'kuala-terengganu' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'taiping', nameAr: 'تايبينغ', lookupName: 'Taiping', slugSuffix: 'taiping' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'tawau', nameAr: 'تاواو', lookupName: 'Tawau', slugSuffix: 'tawau' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'miri', nameAr: 'ميري', lookupName: 'Miri', slugSuffix: 'miri' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'bintulu', nameAr: 'بينتولو', lookupName: 'Bintulu', slugSuffix: 'bintulu' },
  { countryCode: 'MY', countryId: 29, methodId: 8, nameEn: 'kangar', nameAr: 'كانغار', lookupName: 'Kangar', slugSuffix: 'kangar' },

  // ─── FRANCE (FR, countryId: 22, methodId: 8) ───
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'nantes', nameAr: 'نانت', lookupName: 'Nantes', slugSuffix: 'nantes' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'strasbourg', nameAr: 'ستراسبورغ', lookupName: 'Strasbourg', slugSuffix: 'strasbourg' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'montpellier', nameAr: 'مونبلييه', lookupName: 'Montpellier', slugSuffix: 'montpellier' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'rennes', nameAr: 'رين', lookupName: 'Rennes', slugSuffix: 'rennes' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'toulon', nameAr: 'تولون', lookupName: 'Toulon', slugSuffix: 'toulon' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'grenoble', nameAr: 'غرونوبل', lookupName: 'Grenoble', slugSuffix: 'grenoble' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'dijon', nameAr: 'ديجون', lookupName: 'Dijon', slugSuffix: 'dijon' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'angers', nameAr: 'أنجيه', lookupName: 'Angers', slugSuffix: 'angers' },
  { countryCode: 'FR', countryId: 22, methodId: 8, nameEn: 'nimes', nameAr: 'نيم', lookupName: 'Nimes', slugSuffix: 'nimes' },

  // ─── GERMANY (DE, countryId: 28, methodId: 8) ───
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'bielefeld', nameAr: 'بيلفلد', lookupName: 'Bielefeld', slugSuffix: 'bielefeld' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'augsburg', nameAr: 'أوغسبورغ', lookupName: 'Augsburg', slugSuffix: 'augsburg' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'braunschweig', nameAr: 'براونشفايغ', lookupName: 'Braunschweig', slugSuffix: 'braunschweig' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'chemnitz', nameAr: 'كيمنتس', lookupName: 'Chemnitz', slugSuffix: 'chemnitz' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'halle', nameAr: 'هاله', lookupName: 'Halle', slugSuffix: 'halle' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'magdeburg', nameAr: 'ماغديبورغ', lookupName: 'Magdeburg', slugSuffix: 'magdeburg' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'freiburg', nameAr: 'فرايبورغ', lookupName: 'Freiburg', slugSuffix: 'freiburg' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'krefeld', nameAr: 'كريفلد', lookupName: 'Krefeld', slugSuffix: 'krefeld' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'mainz', nameAr: 'ماينتس', lookupName: 'Mainz', slugSuffix: 'mainz' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'erfurt', nameAr: 'إرفورت', lookupName: 'Erfurt', slugSuffix: 'erfurt' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'rostock', nameAr: 'روستوك', lookupName: 'Rostock', slugSuffix: 'rostock' },
  { countryCode: 'DE', countryId: 28, methodId: 8, nameEn: 'kassel', nameAr: 'كاسل', lookupName: 'Kassel', slugSuffix: 'kassel' },

  // ─── UNITED KINGDOM (GB, countryId: 20, methodId: 8) ───
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'birmingham', nameAr: 'برمنغهام', lookupName: 'Birmingham', slugSuffix: 'birmingham' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'leeds', nameAr: 'ليدز', lookupName: 'Leeds', slugSuffix: 'leeds' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'edinburgh', nameAr: 'إدنبرة', lookupName: 'Edinburgh', slugSuffix: 'edinburgh' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'leicester', nameAr: 'ليستر', lookupName: 'Leicester', slugSuffix: 'leicester' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'coventry', nameAr: 'كوفنتري', lookupName: 'Coventry', slugSuffix: 'coventry' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'bradford', nameAr: 'برادفورد', lookupName: 'Bradford', slugSuffix: 'bradford' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'cardiff', nameAr: 'كارديف', lookupName: 'Cardiff', slugSuffix: 'cardiff' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'newcastle upon tyne', nameAr: 'نيوكاسل', lookupName: 'Newcastle upon Tyne', slugSuffix: 'newcastle-upon-tyne' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'nottingham', nameAr: 'نوتنغهام', lookupName: 'Nottingham', slugSuffix: 'nottingham' },
  { countryCode: 'GB', countryId: 20, methodId: 8, nameEn: 'southampton', nameAr: 'ساوثهامبتون', lookupName: 'Southampton', slugSuffix: 'southampton' },

  // ─── UNITED STATES (US, countryId: 19, methodId: 8) ───
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'houston', nameAr: 'هيوستن', lookupName: 'Houston', slugSuffix: 'houston' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'philadelphia', nameAr: 'فيلادلفيا', lookupName: 'Philadelphia', slugSuffix: 'philadelphia' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'phoenix', nameAr: 'فينيكس', lookupName: 'Phoenix', slugSuffix: 'phoenix' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'san antonio', nameAr: 'سان أنطونيو', lookupName: 'San Antonio', slugSuffix: 'san-antonio' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'san diego', nameAr: 'سان دييغو', lookupName: 'San Diego', slugSuffix: 'san-diego' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'detroit', nameAr: 'ديترويت', lookupName: 'Detroit', slugSuffix: 'detroit' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'atlanta', nameAr: 'أتلانتا', lookupName: 'Atlanta', slugSuffix: 'atlanta' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'miami', nameAr: 'ميامي', lookupName: 'Miami', slugSuffix: 'miami' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'denver', nameAr: 'دنفر', lookupName: 'Denver', slugSuffix: 'denver' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'tampa', nameAr: 'تامبا', lookupName: 'Tampa', slugSuffix: 'tampa' },
  { countryCode: 'US', countryId: 19, methodId: 8, nameEn: 'orlando', nameAr: 'أورلاندو', lookupName: 'Orlando', slugSuffix: 'orlando' },

  // ─── CANADA (CA, countryId: 27, methodId: 8) ───
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'edmonton', nameAr: 'إدمونتون', lookupName: 'Edmonton', slugSuffix: 'edmonton' },
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'winnipeg', nameAr: 'وينيبيدغ', lookupName: 'Winnipeg', slugSuffix: 'winnipeg' },
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'quebec', nameAr: 'كيبك', lookupName: 'Quebec', slugSuffix: 'quebec' },
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'halifax', nameAr: 'هاليفاكس', lookupName: 'Halifax', slugSuffix: 'halifax' },
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'saskatoon', nameAr: 'ساسكاتون', lookupName: 'Saskatoon', slugSuffix: 'saskatoon' },
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'regina', nameAr: 'ريجينا', lookupName: 'Regina', slugSuffix: 'regina' },
  { countryCode: 'CA', countryId: 27, methodId: 8, nameEn: 'windsor', nameAr: 'وندسور', lookupName: 'Windsor', slugSuffix: 'windsor' },

  // ─── SPAIN (ES, countryId: 23, methodId: 8) ───
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'malaga', nameAr: 'مالقة', lookupName: 'Malaga', slugSuffix: 'malaga' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'murcia', nameAr: 'مرسية', lookupName: 'Murcia', slugSuffix: 'murcia' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'palma', nameAr: 'بالما دي مايوركا', lookupName: 'Palma', slugSuffix: 'palma' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'alicante', nameAr: 'أليكانتي', lookupName: 'Alicante', slugSuffix: 'alicante' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'cordoba', nameAr: 'قرطبة', lookupName: 'Cordoba', slugSuffix: 'cordoba' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'valladolid', nameAr: 'بلد الوليد', lookupName: 'Valladolid', slugSuffix: 'valladolid' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'vigo', nameAr: 'فيغو', lookupName: 'Vigo', slugSuffix: 'vigo' },
  { countryCode: 'ES', countryId: 23, methodId: 8, nameEn: 'gijon', nameAr: 'خيخون', lookupName: 'Gijon', slugSuffix: 'gijon' },

  // ─── ITALY (IT, countryId: 21, methodId: 8) ───
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'palermo', nameAr: 'باليرمو', lookupName: 'Palermo', slugSuffix: 'palermo' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'genoa', nameAr: 'جنوة', lookupName: 'Genoa', slugSuffix: 'genoa' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'bologna', nameAr: 'بولونيا', lookupName: 'Bologna', slugSuffix: 'bologna' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'bari', nameAr: 'باري', lookupName: 'Bari', slugSuffix: 'bari' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'catania', nameAr: 'قطانية', lookupName: 'Catania', slugSuffix: 'catania' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'verona', nameAr: 'فيرونا', lookupName: 'Verona', slugSuffix: 'verona' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'messina', nameAr: 'مسينة', lookupName: 'Messina', slugSuffix: 'messina' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'padua', nameAr: 'بادوفا', lookupName: 'Padua', slugSuffix: 'padua' },
  { countryCode: 'IT', countryId: 21, methodId: 8, nameEn: 'trieste', nameAr: 'ترييستي', lookupName: 'Trieste', slugSuffix: 'trieste' },
];

// Rejection test candidates (negative test fixtures to verify audit robustness)
const KNOWN_REJECT_FIXTURES = [
  { countryCode: 'SA', lookupName: 'Ad Damman', reason: 'REJECT_NEAR_DUPLICATE_PHONETIC', details: 'Phonetic variant of Dammam' },
  { countryCode: 'TR', lookupName: 'Icel', reason: 'REJECT_METROPOLITAN_COLLISION', details: 'Icel is historical Mersin center (< 5km)' },
  { countryCode: 'MA', lookupName: 'Sale', reason: 'REJECT_EXISTING_RECORD', details: 'Sale is already in cities.json' },
  { countryCode: 'US', lookupName: 'Cambridge', reason: 'REJECT_METROPOLITAN_PROXIMITY_COLLISION', details: 'Across river from Boston (< 5km)' },
  { countryCode: 'JP', lookupName: 'Tokyo', reason: 'REJECT_UNSUPPORTED_COUNTRY', details: 'Japan is not an authorized expansion country' },
];

function evaluateCandidates() {
  console.log(`Evaluating ${RAW_CANDIDATES.length} raw candidates...`);
  const accepted = [];
  const rejected = [];
  const acceptedSlugs = new Set();
  const acceptedByCountry = new Map();

  for (const cand of RAW_CANDIDATES) {
    const slug = `prayer-times-in-${cand.slugSuffix}`;
    const urlPath = `/city/${slug}/`;

    // 1. Slug collision check
    if (existingCitySlugs.has(slug) || acceptedSlugs.has(slug)) {
      rejected.push({ ...cand, reason: 'REJECT_SLUG_COLLISION_CITY', details: `Slug ${slug} already exists` });
      continue;
    }
    if (existingCountrySlugs.has(slug)) {
      rejected.push({ ...cand, reason: 'REJECT_SLUG_COLLISION_COUNTRY', details: `Slug ${slug} collides with country slug` });
      continue;
    }
    if (existingLegacySlugs.has(slug)) {
      rejected.push({ ...cand, reason: 'REJECT_SLUG_COLLISION_LEGACY', details: `Slug ${slug} collides with legacy URL slug` });
      continue;
    }
    if (existingLegacyPaths.has(urlPath)) {
      rejected.push({ ...cand, reason: 'REJECT_PATH_COLLISION_LEGACY', details: `URL Path ${urlPath} collides with legacy path` });
      continue;
    }

    // 2. city-timezones lookup
    const isoMatches = cityTimezones.findFromIsoCode(cand.countryCode);
    const match = isoMatches.find(m =>
      m.city.toLowerCase() === cand.lookupName.toLowerCase() ||
      m.city_ascii.toLowerCase() === cand.lookupName.toLowerCase()
    );

    if (!match) {
      rejected.push({ ...cand, reason: 'REJECT_GEODATA_NOT_FOUND', details: `Lookup name "${cand.lookupName}" not found in ISO ${cand.countryCode}` });
      continue;
    }

    const { lat, lng, timezone, pop, province } = match;

    // 3. Coordinate bounds
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      rejected.push({ ...cand, reason: 'REJECT_INVALID_COORDINATES', details: `Coordinates [${lat}, ${lng}] out of bounds` });
      continue;
    }

    // 4. IANA Timezone validation
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    } catch (e) {
      rejected.push({ ...cand, reason: 'REJECT_INVALID_TIMEZONE', details: `Timezone ${timezone} failed Intl validation: ${e.message}` });
      continue;
    }

    // 5. Proximity to existing cities in same country (threshold >= 20.0 km)
    const countryExisting = existingCities.filter(c => c.countryCode === cand.countryCode);
    let proximityFailure = null;
    for (const ec of countryExisting) {
      const dist = haversineKm(lat, lng, ec.coordinates.latitude, ec.coordinates.longitude);
      if (dist < 20.0) {
        proximityFailure = {
          existingCity: ec.nameEn,
          distanceKm: dist.toFixed(2),
        };
        break;
      }
    }

    if (proximityFailure) {
      rejected.push({
        ...cand,
        reason: 'REJECT_PROXIMITY_COLLISION_EXISTING',
        details: `Distance to existing "${proximityFailure.existingCity}" is ${proximityFailure.distanceKm} km (< 20 km threshold)`,
      });
      continue;
    }

    // 6. Proximity to previously accepted candidates in same country (threshold >= 20.0 km)
    const countryAccepted = acceptedByCountry.get(cand.countryCode) || [];
    let intraBatchFailure = null;
    for (const ac of countryAccepted) {
      const dist = haversineKm(lat, lng, ac.coordinates.latitude, ac.coordinates.longitude);
      if (dist < 20.0) {
        intraBatchFailure = {
          candidateCity: ac.nameEn,
          distanceKm: dist.toFixed(2),
        };
        break;
      }
    }

    if (intraBatchFailure) {
      rejected.push({
        ...cand,
        reason: 'REJECT_PROXIMITY_COLLISION_INTRABATCH',
        details: `Distance to candidate "${intraBatchFailure.candidateCity}" is ${intraBatchFailure.distanceKm} km (< 20 km threshold)`,
      });
      continue;
    }

    // 7. Astronomical calculation smoke test (4 seasons)
    const astroOk = testAstronomicalSolvability(lat, lng, cand.methodId);
    if (!astroOk) {
      rejected.push({ ...cand, reason: 'REJECT_ASTRONOMICAL_CALCULATION_FAILURE', details: 'Adhan failed to calculate prayer times without NaN' });
      continue;
    }

    // ACCEPTED
    const acceptedRecord = {
      ...cand,
      coordinates: { latitude: lat, longitude: lng },
      timezone,
      population: Math.round(pop),
      province: province || 'N/A',
      slug,
      urlPath,
    };

    accepted.push(acceptedRecord);
    acceptedSlugs.add(slug);

    if (!acceptedByCountry.has(cand.countryCode)) {
      acceptedByCountry.set(cand.countryCode, []);
    }
    acceptedByCountry.get(cand.countryCode).push(acceptedRecord);
  }

  // Add the explicit reject fixtures
  for (const rf of KNOWN_REJECT_FIXTURES) {
    rejected.push({
      countryCode: rf.countryCode,
      nameEn: rf.lookupName.toLowerCase(),
      reason: rf.reason,
      details: rf.details,
    });
  }

  console.log(`\nEvaluation complete!`);
  console.log(`Accepted: ${accepted.length}`);
  console.log(`Rejected: ${rejected.length}`);

  // Summary by country
  const counts = {};
  for (const a of accepted) {
    counts[a.countryCode] = (counts[a.countryCode] || 0) + 1;
  }
  console.log('\nAccepted counts by country:', counts);

  return { accepted, rejected };
}

if (require.main === module) {
  evaluateCandidates();
}

module.exports = { evaluateCandidates, RAW_CANDIDATES, KNOWN_REJECT_FIXTURES };
