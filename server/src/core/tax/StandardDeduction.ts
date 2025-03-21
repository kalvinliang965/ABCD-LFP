import { TaxFilingStatus } from "../Enums"

export interface StandardDeductionObject {
    add_deduction(amt: number, status: TaxFilingStatus): void,
    adjust_for_inflation(rate: number, status: TaxFilingStatus): void,
    to_string(): string,
    size(): number,
}

export function StandardDeductions(): StandardDeductionObject {
    
    const deductions: Map<TaxFilingStatus, number> = new Map();


    const add_deduction = (amt: number, status: TaxFilingStatus): void => {
        if (deductions.has(status)) {
            console.error("Already have deduction for this status", status);
            return;
        }
        deductions.set(status, amt);
    }

    const adjust_for_inflation = (rate: number, status: TaxFilingStatus): void => {
        for (const [key, val] of deductions.entries()) {
            deductions.set(key, val * (1 + rate));
        }        
    }
    
    const to_string = (): string => {
        let res = `SID DEDUCTION: ${deductions.get(TaxFilingStatus.SINGLE)}\nMARRIED DEDUCTION: ${deductions.get(TaxFilingStatus.MARRIED)}`;
        return res;
    }

    const size = (): number => {
        return deductions.size;
    }

    return {
        add_deduction,
        adjust_for_inflation,
        to_string,
        size,
    }
}