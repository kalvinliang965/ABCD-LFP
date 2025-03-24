/**
 * RMD Scraper Service
 * 
 * This service is responsible for scraping the latest RMD factors from the IRS website
 * and providing them to the application.
 */

import axios from 'axios';
import { load } from 'cheerio';

// URL for the IRS page containing the RMD table
const RMD_URL = 'https://www.irs.gov/retirement-plans/plan-participant-employee/required-minimum-distribution-worksheets';

// Default RMD factors based on IRS Uniform Lifetime Table (2022+)
// These will be used as a fallback if scraping fails
const DEFAULT_RMD_FACTORS: Map<number, number> = new Map([
  [72, 27.4], [73, 26.5], [74, 25.5], [75, 24.6], [76, 23.7], [77, 22.9], 
  [78, 22.0], [79, 21.1], [80, 20.2], [81, 19.4], [82, 18.5], [83, 17.7], 
  [84, 16.8], [85, 16.0], [86, 15.2], [87, 14.4], [88, 13.7], [89, 12.9], 
  [90, 12.2], [91, 11.5], [92, 10.8], [93, 10.1], [94, 9.5], [95, 8.9], 
  [96, 8.4], [97, 7.8], [98, 7.3], [99, 6.8], [100, 6.4], [101, 6.0], 
  [102, 5.6], [103, 5.2], [104, 4.9], [105, 4.6], [106, 4.3], [107, 4.1], 
  [108, 3.9], [109, 3.7], [110, 3.5], [111, 3.4], [112, 3.3], [113, 3.1], 
  [114, 3.0], [115, 2.9], [116, 2.8], [117, 2.7], [118, 2.5], [119, 2.3], 
  [120, 2.0]
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
 * Scrape RMD factors from the IRS website
 * 
 * @returns A promise that resolves to a Map of age to RMD factor
 */
export async function scrapeRMDFactors(): Promise<Map<number, number>> {
  try {
    console.log("Scraping RMD factors from IRS website...");
    
    // Fetch the IRS page with RMD tables
    const { data: html } = await axios.get(RMD_URL);
    const $ = load(html);
    
    // Find the Uniform Lifetime Table
    // Look for a table with a caption or heading containing "Uniform Lifetime Table"
    const tables = $('table');
    let uniformLifetimeTable = null;
    
    tables.each((_, table) => {
      const tableHtml = $(table).html() || '';
      if (tableHtml.toLowerCase().includes('uniform lifetime table')) {
        uniformLifetimeTable = table;
        return false; // Break the loop
      }
    });
    
    if (!uniformLifetimeTable) {
      console.warn("Uniform Lifetime Table not found on the IRS website");
      return new Map(DEFAULT_RMD_FACTORS);
    }
    
    // Parse the table rows to extract age and distribution period
    const rmdFactors = new Map<number, number>();
    const rows = $(uniformLifetimeTable).find('tr');
    
    // Skip the header row
    rows.slice(1).each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const ageText = $(cells[0]).text().trim();
        const distributionPeriodText = $(cells[1]).text().trim();
        
        const ageNumbers = extractNumbers(ageText);
        const distributionPeriodNumbers = extractNumbers(distributionPeriodText);
        
        if (ageNumbers.length > 0 && distributionPeriodNumbers.length > 0) {
          const age = ageNumbers[0];
          const distributionPeriod = distributionPeriodNumbers[0];
          
          rmdFactors.set(age, distributionPeriod);
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
  
  return factors;
}

/**
 * Get the RMD factor for a specific age
 * 
 * @param age The age to look up
 * @returns A promise that resolves to the RMD factor for the given age
 */
export async function getRMDFactorForAge(age: number): Promise<number> {
  const factors = await getRMDFactors();
  
  // Cap at 120 years
  if (age > 120) {
    return factors.get(120) || 2.0;
  }
  
  return factors.get(age) || 0;
}

