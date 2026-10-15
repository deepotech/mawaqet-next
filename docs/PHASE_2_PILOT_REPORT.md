# Phase 2 — Pilot Expansion: First 50 Cities Report

**Project:** mawaqetsalat.com  
**Workspace:** `C:\Users\HP\Desktop\mawaqetsalat`  
**Date of Execution:** 2026-10-15  
**Pilot Status:** COMPLETE & VERIFIED  
**Recommendation:** **APPROVED FOR NEXT EXPANSION BATCH** (Phase 3: Staged Rollout in batches of 250–500 cities)

---

## 1. Executive Summary

Phase 2 successfully executed a controlled, reversible pilot adding **50 genuinely new cities** to `data/normalized/cities.json`, expanding the directory from **328 to 378 cities** across **10 existing countries**.

All 50 new cities were selected from high-population, underserved urban centers in existing supported countries. The import strictly satisfied all safety criteria:
1. **Zero regression on 328 pre-existing cities:** All baseline city IDs, slugs, coordinates, timezones, and calculation methods were verified 100% bit-for-bit immutable against backup snapshots.
2. **100% preservation of SEO URLs:** All 372 legacy URLs from Google Search Console and legacy WordPress manifests are preserved with zero 404s, loops, or chains.
3. **Rigorous prayer calculation validation:** All 50 new cities produce valid, chronologically ordered prayer times across all 4 astronomical seasons (Vernal Equinox, Summer Solstice, Autumnal Equinox, Winter Solstice) with zero NaNs.
4. **Validation gate enforcement:** Passed all 15 / 15 checks in `scripts/expansion-validation-gate.js`.
5. **Full test and build success:** 155/155 unit tests passed, typecheck clean, lint clean, and Next.js 15 App Router static generation built 427 routes cleanly.

---

## 2. Source Provenance & Licensing

To satisfy strict data traceability requirements, city coordinates, population figures, and timezones were derived from an authoritative, open-source geographic dataset:

| Attribute | Specification |
| :--- | :--- |
| **Dataset Name** | `city-timezones` |
| **Release Version** | `v1.3.4` |
| **Upstream Primary Sources** | GeoNames.org (`cities15000`) & SimpleMaps World Cities Database |
| **License** | MIT License (Open commercial reuse and modification) |
| **Source Repository** | [https://github.com/kevinroberts/city-timezones](https://github.com/kevinroberts/city-timezones) |
| **Download / Retrieval Date** | 2026-10-15 |
| **Provenance Tag in Records** | `GeoNames (city-timezones v1.3.4)` |
| **Verification Status** | `verified_exact` |

---

## 3. Pilot Candidate Selection & Geographical Distribution

50 high-population cities were selected across 10 countries where additional coverage provides immediate value to Arabic-speaking and Muslim communities:

| Country | Code | Country ID | Baseline Cities | Added Cities | New Total | Representative New Cities |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Algeria** | DZ | 18 | 7 | **+7** | **14** | Oran (وهران), Setif (سطيف), Batna (باتنة), Bejaia (بجاية), Skikda (سكيكدة), Biskra (بسكرة), Chlef (الشلف) |
| **Iraq** | IQ | 15 | 7 | **+7** | **14** | Kirkuk (كركوك), Sulaymaniyah (السليمانية), Hillah (الحلة), Nasiriyah (الناصرية), Diwaniyah (الديوانية), Kut (الكوت), Ramadi (الرمادي) |
| **Jordan** | JO | 16 | 3 | **+5** | **8** | Zarqa (الزرقاء), Aqaba (العقبة), Salt (السلط), Mafraq (المفرق), Karak (الكرك) |
| **Tunisia** | TN | 17 | 4 | **+6** | **10** | Sfax (صفاقس), Sousse (سوسة), Kairouan (القيروان), Nabeul (نابل), Monastir (المنستير), Gafsa (قفصة) |
| **Sudan** | SD | 13 | 5 | **+6** | **11** | Omdurman (أم درمان), Kassala (كسلا), Nyala (نيالا), Wad Madani (ود مدني), Kosti (كوستي), Gedaref (القضارف) |
| **Syria** | SY | 10 | 6 | **+5** | **11** | Latakia (اللاذقية), Deir ez-Zor (دير الزور), Raqqa (الرقة), Idlib (إدلب), Daraa (درعا) |
| **Palestine** | PS | 12 | 6 | **+3** | **9** | Hebron (الخليل), Nablus (نابلس), Ramallah (رام الله) |
| **Lebanon** | LB | 14 | 2 | **+3** | **5** | Sidon (صيدا), Zahle (زحلة), Nabatieh (النبطية) |
| **Turkey** | TR | 25 | 10 | **+5** | **15** | Konya (قونية), Kayseri (قيصرية), Diyarbakir (ديار بكر), Samsun (سامسون), Eskisehir (إسكي شهر) |
| **Libya** | LY | 11 | 6 | **+3** | **9** | Al Khums (الخمس), Zawiya (الزاوية), Derna (درنة) |
| **TOTALS** | — | — | **56** | **+50** | **106** | *(Remaining 28 countries preserved without modification)* |

---

## 4. Rejection Audit (Negative Candidate Filtering)

In accordance with Step 4 of the Pilot specification, candidate records that failed validation criteria were rejected and documented with explicit rejection codes:

| Candidate Place | Country | Rejection Code | Rationale & Evidence |
| :--- | :---: | :--- | :--- |
| **Kabul** | AF | `REJECT_UNSUPPORTED_COUNTRY` | Country AF is not in the 38 currently supported countries. |
| **Tokyo** | JP | `REJECT_UNSUPPORTED_COUNTRY` | Country JP is not in the 38 currently supported countries. |
| **Trablous** | LB | `REJECT_SLUG_COLLISION` | Candidate slug `prayer-times-in-tripoli` collides with existing Libya capital record. Resolved by excluding to prevent URL collision. |
| **I-n-Amenas** | DZ | `REJECT_LOW_POPULATION` | Population 216 is below pilot threshold of 20,000 for useful standalone city pages. |
| **Sayhut** | YE | `REJECT_LOW_POPULATION` | Population 189 is below pilot viability threshold. |
| **Dawwah** | OM | `REJECT_LOW_POPULATION` | Population 1,485 is a rural locality. |
| **Zillah** | LY | `REJECT_LOW_POPULATION` | Population 10 is an isolated desert oasis. |
| **As Sidr** | LY | `REJECT_LOW_POPULATION` | Population 50 is an industrial oil terminal, not an urban population center. |
| **Al Jaghbub** | LY | `REJECT_LOW_POPULATION` | Population 1,744 is a remote desert outpost. |
| **Dehibat** | TN | `REJECT_LOW_POPULATION` | Population 3,525 is a border transit outpost below urban threshold. |

The full machine-readable rejection log is recorded in `data/staging/city-expansion-rejections.json`.

---

## 5. Before vs. After Project Metrics

| Metric | Phase 1.5 Baseline | Phase 2 Post-Pilot | Delta / Impact |
| :--- | :---: | :---: | :--- |
| **Total Cities** | 328 | **378** | **+50 cities** (Cleanly integrated) |
| **Total Countries** | 38 | **38** | 0 (Strict country boundary maintained) |
| **Pre-existing City Record Mismatches** | 0 | **0** | **0 drift** (IDs 1–328 identical to backup) |
| **Legacy URL Manifest Preservation** | 372 / 372 (100%) | **372 / 372 (100%)** | **0 regressions** |
| **Sitemap XML URLs** | 370 | **420** | **+50 URLs** (1 home + 38 countries + 378 cities + 3 static) |
| **Expansion Validation Gate** | 15 / 15 PASSED | **15 / 15 PASSED** | Zero failures, zero warnings |
| **TypeScript Typecheck** | Exit 0 | **Exit 0** | Zero type errors |
| **ESLint** | Clean | **Clean** | Zero lint errors or warnings |
| **Vitest Unit Test Suite** | 155 / 155 PASSED | **155 / 155 PASSED** | All 12 test suites passing |
| **Next.js Static Routes Generated** | 377 | **427** | **+50 routes** generated in ~5s build |

---

## 6. Prayer Engine & Calculation Validation

### Baseline Stability Check
Representative cities from the pre-existing dataset were evaluated across 4 seasonal dates:
- Riyadh (SA): 0 min deviation across all 4 seasons.
- Cairo (EG): 0 min deviation across all 4 seasons.
- Istanbul (TR): Diyanet Method 13 parameters verified with official offsets (-7m Sunrise, +5m Dhuhr, +4m Asr, +7m Maghrib).
- Casablanca (MA): 0 min deviation across all 4 seasons.
- Paris (FR): High-latitude auto-rule (`seventh_of_the_night`) operates cleanly at latitude 48.86° N.

### Pilot 50 Cities Validation
All 50 newly imported cities were evaluated across the 4 key astronomical dates:
1. *Vernal Equinox* (2026-03-20)
2. *Summer Solstice* (2026-06-21)
3. *Autumnal Equinox* (2026-09-22)
4. *Winter Solstice* (2026-12-21)

**Results:**
- **Valid Timestamps:** 50 / 50 (100%) produced valid non-NaN timestamps.
- **Chronological Sequence:** 50 / 50 (100%) satisfied strict sequence: $\text{Fajr} < \text{Sunrise} < \text{Dhuhr} < \text{Asr} < \text{Maghrib} < \text{Isha}$.
- **Turkish Cities:** The 5 new Turkish cities (Konya, Kayseri, Diyarbakir, Samsun, Eskisehir) use Method 13 (`CalculationMethod.Turkey()`), matching official Diyanet national prayer timetables.
- **Arab World Cities:** Assigned Method 8 (National Standard / Gulf Baseline) in accordance with project policy.
- **Domain Separation:** No mosque-specific iqamah times or fabricated mosque schedules were conflated with astronomical calculation.

The full machine-readable validation report is stored in `docs/audit/pilot-prayer-validation.json`.

---

## 7. SEO, Routes, and Canonical URL Audits

- **Legacy URL Inventory:** 372 / 372 URLs cataloged from Google Search Console and WordPress crawls were tested. All continue to resolve to active pages or proper 301 redirects.
- **Critical Anomaly Canonical Preservation:**
  - `rayer-times-in-india` ➜ Preserved as canonical country route.
  - `prayer-times-in-united_arab_emirates` ➜ Preserved with underscore.
  - `prayer-times-in-eqypt` ➜ Preserved with 301 redirect from typo-corrected slug.
  - `/sample-page/` ➜ Preserved 301 redirect to `/`.
- **New City Canonical URLs:** Every new city URL matches the pattern `https://mawaqetsalat.com/city/prayer-times-in-[slug]/` with trailing slash.
- **Sitemap XML Budget:** Exactly 420 URLs indexed, matching the sum of 1 home + 38 countries + 378 cities + 3 static content pages.

The full machine-readable SEO report is stored in `docs/audit/pilot-seo-regression.json`.

---

## 8. Verification Commands Run & Outputs

```powershell
# 1. Staging & Merge Pipeline
node scripts/import-pilot-50.js --merge
# Output: 50 Pilot Cities Successfully Merged and Synchronized

# 2. TypeScript Typecheck
npm run typecheck
# Output: Exit code 0 (No type errors)

# 3. Next.js Lint
npm run lint
# Output: No ESLint warnings or errors

# 4. Vitest Unit Test Suite
npm test
# Output: 12 test files passed (155 tests passed), 0 failures

# 5. Legacy URL Preservation Validator
npm run validate:urls
# Output: 372 URLs verified, 100% top landing pages protected, 0 loops, 0 chains

# 6. Expansion Validation Gate
npm run validate:expansion
# Output: 15 / 15 checks PASSED, 0 warnings, 0 failures

# 7. Next.js Production Build
npm run build
# Output: Compiled successfully, 427 static routes generated
```

---

## 9. Rollback Instructions

Should any issue arise with this pilot batch, full rollback to the Phase 1.5 baseline is immediate and deterministic:

1. Restore backed-up JSON files:
   ```powershell
   Copy-Item "data/normalized/cities.json.bak" "data/normalized/cities.json" -Force
   Copy-Item "data/normalized/countries.json.bak" "data/normalized/countries.json" -Force
   ```
2. Or checkout Git commit `3d45efd`:
   ```bash
   git checkout 3d45efd -- data/normalized/
   ```
3. Re-run validation:
   ```bash
   npm run validate:expansion
   npm test
   ```

---

## 10. Conclusion & Next Phase Recommendation

Phase 2 proves that the expansion architecture is robust, fast, and completely safe for SEO and prayer accuracy.

**Recommendation:**  
The pilot is **APPROVED**. The team may proceed to **Phase 3: Scaled Expansion**, rolling out additional cities in controlled batches of **250 to 500 cities**, running the automated validation gate on each batch prior to merge.
