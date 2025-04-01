import { TaxInfo, create_tax_info } from "./TaxInfo";

export interface YearlyRecords {
    get_record: (year: number) => TaxInfo | undefined;
    initialize_record: (year: number) => void;
}

export function create_yearly_records(): YearlyRecords {
    const record = new Map<number, TaxInfo>();
    return {
        get_record: (year: number) => record.get(year),
        initialize_record: (year: number) => {
            if (record.has(year)) {
                console.error(`Existing record ${record.get(year)}`);
                throw new Error(`Tax info in ${year} already store in record`);
            }
            record.set(year, create_tax_info());
        },
    }
}