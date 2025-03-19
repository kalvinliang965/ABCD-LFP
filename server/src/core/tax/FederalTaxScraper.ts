import axios from "axios";
import "cheerio";
import { load } from "cheerio";
import { TaxBrackets, TaxBracketsObject } from "./TaxBrackets";
import { TaxFilingStatus } from "../Enums";

const SINGLE_TABLE: number = 0;
const MARRIED_TABLE: number = 1;
const FEDERAL_TAX_URL: string = "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";

// Function to parse table rows and extract tax bracket data
function parse_table_rows(taxBrackets: TaxBracketsObject, status: TaxFilingStatus, table: string): void {
    const $ = load("<table>" + table + "</table");
    // remove header row
    const rows = $("tr").slice(1);
    rows.each((idx, row) => {
        const cells = $(row).find('td');
        if (cells.length < 3) return;
        const rate_text = $(cells[0]).text().trim();
        const min_text = $(cells[1]).text().trim();
        const max_text = $(cells[2]).text().trim();
        const min = cleanCurrency(min_text);
        const max = max_text.toLowerCase() === "over" ? Infinity: cleanCurrency(max_text);
        const rate = cleanPercentage(rate_text);
        taxBrackets.add_rate(min, max, rate, status);
    });
}

// Function to parse federal tax tables
function parse_federal_tax_tables(tables: Array<string>) {
    if (!tables || tables.length < 4) {
        throw new Error("Not enough table found");
    }
    const taxBrackets = TaxBrackets();    
    const single_table = tables[SINGLE_TABLE];
    if (!single_table) {
        throw new Error("Missing single taxpayer table");
    }
    parse_table_rows(taxBrackets, TaxFilingStatus.SINGLE, single_table);
    const married_table = tables[MARRIED_TABLE];
    if (!married_table) {
        throw new Error("Misssing married table");
    }
    parse_table_rows(taxBrackets, TaxFilingStatus.MARRIED, married_table);
    return taxBrackets;
}

// Function to fetch and parse the federal tax brackets
async function parse_federal_tax_brackets(): Promise<TaxBracketsObject> {
    try {
        const  { data: html } = await axios.get(FEDERAL_TAX_URL);
        const $ = load(html);
        const federal_tax_tables: string[] = new Array();
        $('table').each((_, dom_element) => {
            const table = $(dom_element);
            const table_str = table.html();
            if (!table_str) {
                throw new Error("Missing a table");
            }
            federal_tax_tables.push(table_str);
        });
        
        if (federal_tax_tables.length < 4) {
            throw new Error("Not enough table found");
        }
        return parse_federal_tax_tables(federal_tax_tables);
    } catch (error) {
        console.error("Error fetching the federal tax brackets:", error);
        throw new Error("Federal tax data unavailable. Try again Later");
    }
}

const cleanCurrency = (text: string): number => 
    parseFloat(text.replace(/[^0-9.]/g, ''));

const cleanPercentage = (text: string): number =>
    parseFloat(text.replace('%', '')) / 100;

async function main() {
    const taxBracket = await parse_federal_tax_brackets();
    console.log(taxBracket.to_string());
} 

main()