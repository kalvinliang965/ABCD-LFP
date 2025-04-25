/**
 * RMD Scraper Service
 * 
 * This service provides functions to get Required Minimum Distribution (RMD) factors
 * from IRS Publication 590-B.
 */
import axios from 'axios';
import cheerio from 'cheerio';
import { tax_config } from '../config/tax';
import { simulation_logger } from '../utils/logger/logger';
import { extractNumbers } from '../utils/NumberUtils';
import { dev } from '../config/environment';

const RMD_URL = tax_config.RMD_URL;

export async function fetch_and_parse_rmd(url: string): Promise<Map<number, number>> {
    try {
        // Fetch the IRS page with RMD tables
        const { data: html } = await axios.get(RMD_URL);
        return await scrape_rmd_table(html);
    } catch (error) {
        simulation_logger.error("Failed to fetch capital gains data:", error);
        throw new Error("Capital gains data acquisition failed");
    }
}
export async function scrape_rmd_table(html: string): Promise<Map<number, number>> {
  try {
    const $ = cheerio.load(html);
    // Find all tables and log their content
    const tables = $('table');
    console.log(`Found ${tables.length} tables on the page`);
    // Find the Uniform Lifetime Table
    // Look for a table with a caption or heading containing "Uniform Lifetime Table"
    const uniformLifetimeTable = $('table.table.table-condensed[summary*="Uniform Lifetime"]').filter((_, table) => {
      const tableHtml = $(table).html() || '';
      const tableText = $(table).text() || '';      
      // Look for the table with "Uniform Lifetime" in its caption or content
      return (
        tableHtml.toLowerCase().includes('uniform lifetime') && 
        tableText.toLowerCase().includes('table iii') 
      );
    });
    
    if (uniformLifetimeTable.length === 0) {
      simulation_logger.error("Uniform Lifetime Table not found on the IRS website");
      throw new Error("Uniform Lifetime Table not found on the IRS website");
    }
    
    // Parse the table rows to extract age and distribution period
    const rmd_factors = new Map<number, number>();
    const $rows = $(uniformLifetimeTable).find('tr');
    const num_headers = 5;
    // remove headers
    $rows.slice(num_headers).each((_, row) => {
      const $cells = $(row).find('td');

      const N = $cells.length
      if (N < 4 || N % 2 != 0) {
        simulation_logger.error(`Not enough cell in the rmd table row`, {
          row: $cells.text(),
        })
        throw new Error("Not enough cells");
      }


      for (let i = 0; i < N; i += 2) {
        const age_string = $cells.eq(i).text().trim();
        const factor_string = $cells.eq(i + 1).text().trim();
        
        if (age_string === "" || factor_string === "") 
          continue;
        const age = extractNumbers(age_string,1)[0];
        const factor = extractNumbers(factor_string, 1)[0];


        if (rmd_factors.has(age)) {
          simulation_logger.error(`row contain duplicated data`, {
            row: $cells.text(),
          })
          throw new Error("row contian duplicated data");
        }
        rmd_factors.set(age, factor);
      }
    });
    
    // it is require to start doing rmd at 73 for previous yera that is 72
    for (let i = 72; i <= tax_config.MAX_RMD_AGE; ++i) {
      if (!rmd_factors.has(i)) {
        console.log(rmd_factors.get(i));
        simulation_logger.error(`RMD table is missing age ${i}`);
        throw new Error(`RMD table is missing age ${i}`);
      }
      if (dev.is_dev) {
        simulation_logger.debug(`RMD table contain age: ${i}, factor: ${rmd_factors.get(i)!}`);
      }
    }

    // console.log(`Successfully scraped ${rmdFactors.size} RMD factors`);
    return rmd_factors;
  } catch (error) {
    simulation_logger.error(`Failed to scrape rmd table: ${error instanceof Error ? error.stack : String(error)}`);
    throw new Error(`Failed to scrape RMD table: ${error instanceof Error? error.message: String(error)}`);
  }
}