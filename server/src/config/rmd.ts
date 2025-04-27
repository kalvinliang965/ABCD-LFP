// RMD-related configuration settings

// URLs for RMD data sources
export const rmd_urls = {
  // IRS Publication 590-B for RMD factors
  RMD_PUBLICATION: process.env.RMD_URL || 'https://www.irs.gov/publications/p590b',
};

// RMD age thresholds
export const rmd_config = {
  // Age at which RMDs must begin (as of 2023)
  START_AGE: 72,
  
  // Cache duration for RMD factors (in milliseconds)
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
};

// Default RMD factors to use as fallback
//can be updated to include more factors as needed ??
export const default_rmd_factors: [number, number][] = [

]; 