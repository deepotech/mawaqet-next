const fs = require('fs');
const readline = require('readline');

async function analyzeFull() {
  const fileStream = fs.createReadStream('docs/extracted_wpress/database.sql', { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const posts = new Map();
  const postmeta = new Map(); // postId -> { [meta_key]: meta_value }

  for await (const line of rl) {
    if (line.startsWith('INSERT INTO `SERVMASK_PREFIX_posts` VALUES')) {
      const m = line.match(/^INSERT INTO `SERVMASK_PREFIX_posts` VALUES \((\d+),(\d+),'([^']*)','([^']*)','(.*?)','(.*?)','(.*?)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)','(.*?)',(\d+),'(.*?)',(\d+),'([^']*)','([^']*)',(\d+)\);$/);
      if (m) {
        posts.set(parseInt(m[1]), {
          id: parseInt(m[1]),
          date: m[3],
          title: m[6],
          status: m[8],
          slug: m[12],
          type: m[21]
        });
      }
    } else if (line.startsWith('INSERT INTO `SERVMASK_PREFIX_postmeta` VALUES')) {
      const m = line.match(/^INSERT INTO `SERVMASK_PREFIX_postmeta` VALUES \((\d+),(\d+),'([^']*)','(.*?)'\);$/);
      if (m) {
        const postId = parseInt(m[2]);
        const key = m[3];
        const val = m[4];
        if (!postmeta.has(postId)) {
          postmeta.set(postId, {});
        }
        postmeta.get(postId)[key] = val;
      }
    }
  }

  console.log('Posts:', posts.size, 'Postmeta objects:', postmeta.size);

  const fullCities = [];
  const fullCountries = [];

  for (const [id, post] of posts.entries()) {
    const meta = postmeta.get(id) || {};
    if (post.type === 'city' && post.status === 'publish') {
      fullCities.push({
        ...post,
        meta: {
          city_name_ar: meta['city_name_ar'],
          city_name_en: meta['city_name_en'],
          city_text: meta['city_text'],
          rank_math_title: meta['rank_math_title'],
          rank_math_description: meta['rank_math_description'],
          rank_math_focus_keyword: meta['rank_math_focus_keyword'],
          rank_math_canonical_url: meta['rank_math_canonical_url'],
          rank_math_robots: meta['rank_math_robots']
        }
      });
    } else if (post.type === 'country' && post.status === 'publish') {
      fullCountries.push({
        ...post,
        meta: {
          country_name: meta['country_name'],
          country_name_en: meta['country_name_en'],
          country_flag: meta['country_flag'],
          country_text: meta['country_text'],
          cities: meta['cities'], // serialized array of city IDs
          rank_math_title: meta['rank_math_title'],
          rank_math_description: meta['rank_math_description'],
          rank_math_focus_keyword: meta['rank_math_focus_keyword'],
          rank_math_canonical_url: meta['rank_math_canonical_url']
        }
      });
    }
  }

  console.log('Enriched Cities:', fullCities.length);
  console.log('Enriched Countries:', fullCountries.length);

  fs.writeFileSync('docs/enriched_cities.json', JSON.stringify(fullCities, null, 2));
  fs.writeFileSync('docs/enriched_countries.json', JSON.stringify(fullCountries, null, 2));

  // Print first 3 cities and countries
  console.log('Sample city:', fullCities[0]);
  console.log('Sample country:', fullCountries[0]);
}

analyzeFull().catch(console.error);
