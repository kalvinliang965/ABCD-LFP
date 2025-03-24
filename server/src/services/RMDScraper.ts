/**
 * RMD Scraper Service
 * 
 * This service provides functions to get Required Minimum Distribution (RMD) factors
 * from IRS Publication 590-B.
 */

import axios from 'axios';
import { load } from 'cheerio';

// URL for the IRS publication containing the RMD table
const RMD_URL = 'https://www.irs.gov/publications/p590b';

// Default RMD factors based on IRS Uniform Lifetime Table (2022+)
// These will be used as a fallback if scraping fails
const DEFAULT_RMD_FACTORS: Map<number, number> = new Map([
  [72, 27.4]
]);

// Helper function to extract numbers from text
function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

// Cache for RMD factors to avoid repeated scraping
let cachedRMDFactors: Map<number, number> | null = null;
let lastScrapedTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Scrape RMD factors from the IRS publication 590-B
 * 
 * @returns A promise that resolves to a Map of age to RMD factor
 */
export async function scrapeRMDFactors(): Promise<Map<number, number>> {
  try {
    console.log("Scraping RMD factors from IRS website...");
    
    // Test URL access first
    console.log(`Attempting to access ${RMD_URL}...`);
    try {
      const response = await axios.get(RMD_URL);
      console.log(`Successfully accessed URL. Status: ${response.status}`);
    } catch (error) {
      console.error(`Failed to access URL: ${error instanceof Error ? error.message : String(error)}`);
      return new Map(DEFAULT_RMD_FACTORS);
    }
    
    // Fetch the IRS page with RMD tables
    const { data: html } = await axios.get(RMD_URL);
    console.log(`Received HTML content of length: ${html.length}`);
    
    const $ = load(html);
    
    // Find all tables and log their content
    const tables = $('table');
    console.log(`Found ${tables.length} tables on the page`);
    
    tables.each((i, table) => {
      const tableText = $(table).text().substring(0, 100);
      console.log(`Table ${i+1} preview: ${tableText}...`);
    });
    
    // Find the Uniform Lifetime Table
    // Look for a table with a caption or heading containing "Uniform Lifetime Table"
    const uniformLifetimeTable = $('table').filter((_, table) => {
      const tableHtml = $(table).html() || '';
      const tableText = $(table).text() || '';
      
      // Look for the table with "Uniform Lifetime" in its caption or content
      return (
        tableHtml.toLowerCase().includes('uniform lifetime') || 
        tableText.toLowerCase().includes('table iii') ||
        tableText.toLowerCase().includes('uniform lifetime')
      );
    });
    
    if (uniformLifetimeTable.length === 0) {
      console.warn("Uniform Lifetime Table not found on the IRS website");
      console.log("Using default RMD factors");
      return new Map(DEFAULT_RMD_FACTORS);
    }
    
    // Parse the table rows to extract age and distribution period
    const rmdFactors = new Map<number, number>();
    const rows = $(uniformLifetimeTable).find('tr');
    
    // Skip the header rows (there might be multiple header rows in this publication)
    let headerRowsSkipped = false;
    
    rows.each((_, row) => {
      const cells = $(row).find('td');
      
      // Skip header rows until we find a row with numeric data
      if (!headerRowsSkipped) {
        const firstCellText = cells.first().text().trim();
        if (!firstCellText.match(/^\d+$/)) {
          return; // Continue to next row
        }
        headerRowsSkipped = true;
      }
      
      // Process data rows - Table III might have multiple columns of age/distribution pairs
      // Each pair of columns represents an age and its distribution period
      for (let i = 0; i < cells.length; i += 2) {
        if (i + 1 < cells.length) {
          const ageText = $(cells[i]).text().trim();
          const distributionPeriodText = $(cells[i + 1]).text().trim();
          
          // Extract numbers from the text
          const ageNumbers = extractNumbers(ageText);
          const distributionPeriodNumbers = extractNumbers(distributionPeriodText);
          
          if (ageNumbers.length > 0 && distributionPeriodNumbers.length > 0) {
            const age = ageNumbers[0];
            const distributionPeriod = distributionPeriodNumbers[0];
            
            rmdFactors.set(age, distributionPeriod);
            console.log(`Scraped: Age ${age} -> Distribution Period ${distributionPeriod}`);
          }
        }
      }
    });
    
    if (rmdFactors.size === 0) {
      console.warn("Failed to extract RMD factors from the table");
      return new Map(DEFAULT_RMD_FACTORS);
    }
    
    console.log(`Successfully scraped ${rmdFactors.size} RMD factors`);
    return rmdFactors;
  } catch (error) {
    console.error("Error scraping RMD factors:", error);
    // Return default factors if scraping fails
    return new Map(DEFAULT_RMD_FACTORS);
  }
}

/**
 * Get RMD factors, using cached values if available and not expired
 * 
 * @returns A promise that resolves to a Map of age to RMD factor
 */
export async function getRMDFactors(): Promise<Map<number, number>> {
  const currentTime = Date.now();
  
  // If cache is valid, return cached factors
  if (cachedRMDFactors && (currentTime - lastScrapedTime < CACHE_DURATION)) {
    return cachedRMDFactors;
  }
  
  // Otherwise, scrape new factors
  const factors = await scrapeRMDFactors();
  
  // Update cache
  cachedRMDFactors = factors;
  lastScrapedTime = currentTime;
  console.log("RMD factors updated");

  
  return factors;
}

/**
 * Get the RMD factor for a specific age
 * 
 * @param age The age to look up
 * @returns A promise that resolves to the RMD factor for the given age
 */
export async function getRMDFactorForAge(age: number): Promise<number> {
  // Check if age is in the valid range
  if (age < 72 || age > 120) {
    console.log(`Age ${age} is outside the valid range for RMD calculations (72-120)`);
    return 0;
  }
  
  const factors = await getRMDFactors();
  const factor = factors.get(age);
  
  if (factor === undefined) {
    console.log(`No RMD factor found for age ${age}`);
    return 0;
  }
  
  return factor;
}

