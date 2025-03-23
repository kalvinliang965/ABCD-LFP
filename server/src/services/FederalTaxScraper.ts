import axios from "axios";
import "cheerio";
import { load } from "cheerio";
import { create_tax_brackets, TaxBrackets } from "../core/tax/TaxBrackets";
import { IncomeType, TaxFilingStatus } from "../core/Enums";
import { StandardDeduction, create_standard_deductions } from "../core/tax/StandardDeduction";
import { tax_config } from "../config/tax";
import { save_bracket } from "../db/repositories/TaxBracketRepository";


const SINGLE_TABLE: number = 0;
const MARRIED_TABLE: number = 1;

// Function to parse table rows and extract tax bracket data
async function parse_table_rows(taxBrackets: TaxBrackets, status: TaxFilingStatus, table: string): Promise<void> {
    const $ = load("<table>" + table + "</table");
    // remove header row
    const rows = $("tr").slice(1);
    rows.each(async (idx, row) => {
        const cells = $(row).find('td');
        if (cells.length < 3) return;
        const rate_text = $(cells[0]).text().trim();
        const min_text = $(cells[1]).text().trim();
        const max_text = $(cells[2]).text().trim();
        const min = extractNumbers(min_text, 1)[0];
        const max = max_text.toLowerCase() === "and up" ? Infinity: extractNumbers(max_text, 1)[0];
        const rate = extractNumbers(rate_text, 1)[0] / 100;
        taxBrackets.add_rate(min, max, rate, status);
        await save_bracket(min, max, rate, IncomeType.TAXABLE_INCOME, status);
    });
}

// Function to parse federal tax tables
async function parse_federal_tax_tables(tables: Array<string>) {
    if (!tables || tables.length < 4) {
        throw new Error("Not enough table found");
    }
    const taxBrackets = create_tax_brackets();    
    const single_table = tables[SINGLE_TABLE];
    if (!single_table) {
        throw new Error("Missing single taxpayer table");
    }
    await parse_table_rows(taxBrackets, TaxFilingStatus.SINGLE, single_table);
    const married_table = tables[MARRIED_TABLE];
    if (!married_table) {
        throw new Error("Misssing married table");
    }
    await parse_table_rows(taxBrackets, TaxFilingStatus.MARRIED, married_table);
    return taxBrackets;
}

// Function to fetch and parse the federal tax brackets
async function parse_taxable_income(): Promise<TaxBrackets> {
    try {
        const  { data: html } = await axios.get(tax_config.FEDERAL_TAX_URL);
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
        return await parse_federal_tax_tables(federal_tax_tables);
    } catch (error) {
        console.error("Error fetching the federal tax brackets:", error);
        throw new Error("Federal tax data unavailable");
    }
}

async function parse_standard_deductions() {
    try {
        const { data: html } = await axios.get(tax_config.STD_DEDUCTION_URL);
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
        const std_deductions: StandardDeduction = create_standard_deductions();
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

async function parse_capital_gains(): Promise<TaxBrackets> {
    try {
        const { data: html } = await axios.get(tax_config.CAPITAL_GAINS_URL);
        const $ = load(html);

        const h2 = $("h2:contains(Capital gains tax rates)");
        const paragraph = h2.nextAll('p').filter((_, el) => 
             $(el).text().toLowerCase().includes("a capital gains rate of")
        );

        // console.log(paragraph.html());
        if (!paragraph || paragraph.length != 3) {
             throw new Error(`Expected 3 paragraph contain the text: "a capital gains rate of "`);
        }
        const taxBrackets = create_tax_brackets();
        paragraph.each(async (idx,el) => {
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
                li.each(async (idx, el) => {
                    const list_item = $(el);
                    const upperbound = extractNumbers(list_item.text(), 1)[0];
                    if (idx == 0) {
                        taxBrackets.add_rate(0, upperbound, rate, TaxFilingStatus.SINGLE);
                        await save_bracket(0, upperbound, rate, IncomeType.CAPITAL_GAINS, TaxFilingStatus.SINGLE);
                    } else if (idx == 1) {
                        taxBrackets.add_rate(0, upperbound, rate, TaxFilingStatus.MARRIED);
                        await save_bracket(0, upperbound, rate, IncomeType.CAPITAL_GAINS, TaxFilingStatus.MARRIED);
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
                li.each(async (idx, el) => {
                const list_item = $(el);
                const [lowerbound, upperbound] = extractNumbers(list_item.text(), 2);
                    if (idx == 0) {
                        taxBrackets.add_rate(lowerbound + 1, upperbound, rate, TaxFilingStatus.SINGLE);
                        await save_bracket(lowerbound, upperbound, rate, IncomeType.CAPITAL_GAINS, TaxFilingStatus.SINGLE);
                    } else if (idx == 2) {
                        taxBrackets.add_rate(lowerbound + 1, upperbound, rate, TaxFilingStatus.MARRIED);
                        await save_bracket(lowerbound, upperbound, rate, IncomeType.CAPITAL_GAINS, TaxFilingStatus.MARRIED);
                    }
                });
            }
            // third p
            else if (idx == 2) {
                const [upper_rate, lower_rate] = extractNumbers(p.text(), 2).map((x) => x/100);
                if (upper_rate < lower_rate) {
                    throw new Error(`Sentence read is invalid: ${p.text()}`);
                }
                const bracket_tuple_list = taxBrackets.find_highest_brackets();
                bracket_tuple_list.forEach(async (tuple) => {
                    const {taxpayer_type, taxbracket} = tuple;
                    const { max, rate} = taxbracket;
                    if (rate >= upper_rate) {
                        console.error(`Invalid highest rate: ${upper_rate} <= ${rate}`);
                        throw new Error("Invalid highest rate scrapped");
                    }
                    taxBrackets.add_rate(max + 1, Infinity, upper_rate, taxpayer_type);
                    await save_bracket(max + 1, Infinity, upper_rate, IncomeType.CAPITAL_GAINS, taxpayer_type);
                })
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
    
export {
    parse_capital_gains,
    parse_taxable_income,
    parse_standard_deductions,
}
