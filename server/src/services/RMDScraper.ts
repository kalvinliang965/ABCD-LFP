/**
 * RMD Scraper Service
 * Fetches Required Minimum Distribution (RMD) factors from the IRS website.
 */

import axios from 'axios';

const RMD_URL = 'https://www.irs.gov/retirement-plans/plan-participant-employee/required-minimum-distributions-from-iras-and-qualified-plans';

const getRMDFactors = () => RMD_URL
// TODO: Implement scraping logic here

export default getRMDFactors;
