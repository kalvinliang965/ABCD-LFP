import { TaxFilingStatus } from "../Enums"

export interface StandardDeduction {
    add_deduction(amt: number, status: TaxFilingStatus): void,
    adjust_for_inflation(rate: number): void,
    to_string(): string,
    size(): number,
    find_deduction(status: TaxFilingStatus): number;
    clone(): StandardDeduction;
}

export function create_standard_deductions(): StandardDeduction {
    
    const deductions: Map<TaxFilingStatus, number> = new Map();


    const add_deduction = (amt: number, status: TaxFilingStatus): void => {
        if (deductions.has(status)) {
            console.error("Already have deduction for this status", status);
            return;
        }
        deductions.set(status, amt);
    }

    const adjust_for_inflation = (rate: number): void => {
        for (const [key, val] of deductions.entries()) {
            deductions.set(key, val * (1 + rate));
        }        
    }
    
    const to_string = (): string => {
        let res = `SINGLE DEDUCTION: ${deductions.get(TaxFilingStatus.SINGLE)}\nMARRIED DEDUCTION: ${deductions.get(TaxFilingStatus.MARRIED)}\n`;
        return res;
    }

    const size = (): number => {
        return deductions.size;
    }

    const find_deduction = (status: TaxFilingStatus): number => {
        const res = deductions.get(status);
        if (!res) {
            console.error(`Standard deduction table does not contain ${status}`);
            process.exit(1);
        }
        return res;
    }

    return {
        add_deduction,
        adjust_for_inflation,
        to_string,
        size,
        find_deduction,
        clone: () => {
            const cloned = create_standard_deductions();
            const all_statuses = [TaxFilingStatus.SINGLE, TaxFilingStatus.MARRIED];
            all_statuses.forEach(status => {
                const amount = deductions.get(status);
                if (amount !== undefined) {
                    cloned.add_deduction(amount, status);
                }
            });
            return cloned;
        }
    }
}