import axios from "axios";
import "cheerio";
import { load } from "cheerio";

const SINGLE_TABLE: number = 0;
const MARRIED_JOINT_TABLE: number = 1;
const FEDERAL_TAX_URL: string = "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";

async function scrape_federal_tax_tables(url: string) {
    const federal_tax_tables = new Array();
    try {
        const  { data: html } = await axios.get(url)
        const $ = load(html);

        $('table').each((_, dom_element) => {
            const table = $(dom_element);
            federal_tax_tables.push(table);
            
        });
    } catch (error) {
        console.error("Error fetching the federal tax URL:", error);
    }
    return federal_tax_tables;
}

function parse_table(table: cheerio.Cheerio) {
    
}


async function main() {

    const federal_tax_table = await scrape_federal_tax_tables(FEDERAL_TAX_URL)
   
    const single_table = federal_tax_table[SINGLE_TABLE];
    const $single = load(single_table.html());
    console.log(single_table.text());

    const married_joint_table = federal_tax_table[MARRIED_JOINT_TABLE];
    const $married = load(married_joint_table.html());
    console.log(married_joint_table.text());
} 

main()
console.log("HELLO")