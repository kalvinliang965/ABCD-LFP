import axios from 'axios';
import * as cheerio from 'cheerio';

interface RMDRow {
  age: number;
  distributionFactor: number;
}

const IRS_RMD_URL = 'https://www.irs.gov/publications/p590b#en_US_2023_publink1000231236';

export async function scrapeRMDTable(): Promise<RMDRow[]> {
  try {
    const { data } = await axios.get(IRS_RMD_URL);
    const $ = cheerio.load(data);

    const rmdRows: RMDRow[] = [];

    // Update selector based on actual table structure when inspecting IRS page
    $('table').each((i, table) => {
      const header = $(table).prev('h3, h2').text().toLowerCase();

      if (header.includes('uniform lifetime table')) {
        $(table).find('tr').each((index, row) => {
          const cols = $(row).find('td');
          if (cols.length >= 2) {
            const ageText = $(cols[0]).text().trim();
            const factorText = $(cols[1]).text().trim();

            const age = parseInt(ageText);
            const factor = parseFloat(factorText);

            if (!isNaN(age) && !isNaN(factor)) {
              rmdRows.push({ age, distributionFactor: factor });
            }
          }
        });
      }
    });

    console.log('✅ Scraped RMD Table:', rmdRows);
    return rmdRows;
  } catch (error) {
    console.error('❌ Error scraping RMD table:', error);
    throw error;
  }
}

// Example usage
scrapeRMDTable();
