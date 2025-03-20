import axios from "axios";
import "cheerio";
import { load } from "cheerio";
import { TaxBrackets, TaxBracketsObject } from "./TaxBrackets";
import { TaxFilingStatus } from "../Enums";
import { StandardDeductionObject, StandardDuction } from "./StandardDeduction";
import { Console } from "console";

const SINGLE_TABLE: number = 0;
const MARRIED_TABLE: number = 1;

const FEDERAL_TAX_URL: string = "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets";
const STD_DEDUCTION_URL: string = "https://www.irs.gov/publications/p17";
const CAPITAL_GAINS_URL: string = "https://www.irs.gov/taxtopics/tc409";

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
        const min = extractNumbers(min_text, 1)[0];
        const max = max_text.toLowerCase() === "and up" ? Infinity: extractNumbers(max_text, 1)[0];
        const rate = extractNumbers(rate_text, 1)[0] / 100;
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
        throw new Error("Federal tax data unavailable");
    }
}

async function parse_standard_deduction() {
    try {
        const { data: html } = await axios.get(STD_DEDUCTION_URL);
        const $ = load(html);

        const target_text = "Standard deduction amount increased";
        const paragraph = $("p:contains(" + target_text+ ")");
        if (!paragraph.length) {
            throw new Error("No paragraph found contianing target text.");
        }
        const itemizedList =  paragraph.next(".itemizedlist").find("ul.itemizedlist");
        if (!itemizedList) {
            throw new Error("Itemized list not found");
        }
        const std_deductions: StandardDeductionObject = StandardDuction();
        itemizedList.find("li").each((idx, item) => {
            const list_item = $(item);
            const paragraph = list_item.find("p");
            if (!paragraph) {
                console.error("Item dont contain a p tag");
                console.error(list_item.html());
                return;
            }
            const text = paragraph.text();
            const cost = extractNumbers(text, 1)[0];
            if (idx == 0) {
                std_deductions.add_deduction(cost, TaxFilingStatus.SINGLE);
            } else if (idx == 1) {
                std_deductions.add_deduction(cost, TaxFilingStatus.MARRIED);
            }
        });
        
        if (std_deductions.size() < 2) {
            throw new Error("Number of std deduction found is not sufficient");
        }
        return std_deductions;
    } catch (error) {
        console.error("Error fetching the standard deduction: ", error);
        throw new Error("Standard deduction data unavailable.");
    }
}

async function parse_capital_gains(): Promise<TaxBracketsObject> {
    try {
        const { data: html } = await axios.get(CAPITAL_GAINS_URL);
        const $ = load(html);

        const h2 = $("h2:contains(Capital gains tax rates)");
        const paragraph = h2.nextAll('p').filter((_, el) => 
             $(el).text().toLowerCase().includes("a capital gains rate of")
        );

        // console.log(paragraph.html());
        if (!paragraph || paragraph.length != 3) {
             throw new Error(`Expected 3 paragraph contain the text: "a capital gains rate of "`);
        }
        const taxBrackets = TaxBrackets();
        paragraph.each((idx,el) => {
            const p = $(el);
            // first p
            if (idx == 0) {
                const ul = p.next("ul").first();
                const first_rate_text  = p.find("b:last").first().text();
                const rate = extractNumbers(first_rate_text, 1)[0] / 100;
                if (!ul) {
                    throw new Error("Invalid structure");
                }
                const li = ul.find("li");
                if (!li || li.length != 3) {
                    throw new Error("Invalid structure.");
                }
                li.each((idx, el) => {
                    const list_item = $(el);
                    const upperbound = extractNumbers(list_item.text(), 1)[0];
                    if (idx == 0) {
                        taxBrackets.add_rate(0, upperbound, rate, TaxFilingStatus.SINGLE);
                    } else if (idx == 1) {
                        taxBrackets.add_rate(0, upperbound, rate, TaxFilingStatus.MARRIED);
                    }
                });
            }
            // second p
            else if (idx == 1) {
                const rate = extractNumbers(p.text(), 1)[0] / 100;
                const ul = p.next("ul").first();
                if (!ul) {
                    throw new Error("Invalid structure.");
                }
                const li = ul.find("li");
                if (!li || li.length != 4) {
                throw new Error("Invalid structure.");
                }
                li.each((idx, el) => {
                const list_item = $(el);
                const [lowerbound, upperbound] = extractNumbers(list_item.text(), 2);
                    if (idx == 0) {
                        taxBrackets.add_rate(lowerbound + 1, upperbound, rate, TaxFilingStatus.SINGLE);
                    } else if (idx == 2) {
                        taxBrackets.add_rate(lowerbound + 1, upperbound, rate, TaxFilingStatus.MARRIED);
                    }
                });
            }
            // third p
            else if (idx == 2) {
                const [upper_rate, lower_rate] = extractNumbers(p.text(), 2).map((x) => x/100);
                if (upper_rate < lower_rate) {
                    throw new Error(`Sentence read is invalid: ${p.text()}`);
                }
                taxBrackets.add_highest_rate(upper_rate);
            }
        });

        return taxBrackets;
    } catch (error) {
        console.error("Error fetching the cpaital gains", error);
        throw new Error("Capital gains data unavailable.");
    }
}

const extractNumbers = (sentence: string, num: number): number[] => {
    const matches = sentence.match(/-?\d{1,3}(?:,\d{3})*(?:\.\d+)?/g) || [];
    const res = matches.map(m => Number(m.replace(/,/g, ''))).filter(num => !isNaN(num)); 
    if (res.length != num) {
        console.error(res)
        console.error(sentence);
        throw new Error(`Number of of integer in this sentence should be equal to "${num}"`);
    }
    return res;
} 
    


async function main() {
    const taxBracket = await parse_federal_tax_brackets();
    console.log(taxBracket.to_string());
    const deduction = await parse_standard_deduction();
    console.log(deduction.to_string());
    const capital_gains_brakcet = await parse_capital_gains();
    console.log(capital_gains_brakcet.to_string());
} 

main();