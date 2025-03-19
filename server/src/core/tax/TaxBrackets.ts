import { TaxFilingStatus } from "../Enums";

export function TaxBrackets() {

    // single tax payer bracket
    // married filing jointly brakcet
    const brackets: Map<TaxFilingStatus, Map<[number, number], number>> = new Map();
    brackets.set(TaxFilingStatus.SINGLE, new Map());
    brackets.set(TaxFilingStatus.MARRIED, new Map());

    const adjust_for_inflation = (rate: number) => {
        for (let [_, bracket] of brackets) {
            for (let [key, val] of bracket) {
                bracket.set(key, val * (1 + rate));
            }
        }
    }


    const add_rate = (lowerbound: number, upperbound: number, rate: number, status: TaxFilingStatus) => {
        const bracket: Map<[number, number], number> | undefined = brackets.get(status); 
        if (bracket == undefined) {
            console.error("Invalid TaxFilingStatus", status);
            process.exit(1);
        }
        bracket.set([lowerbound, upperbound], rate);
    }

    const find_rate = (income: number, status: TaxFilingStatus) => {
        const bracket: Map<[number, number], number> | undefined = brackets.get(status); 
        if (bracket == undefined) {
            console.error("Invalid TaxFilingStatus", status);
            process.exit(1);
        }
        for (let [key, val] of bracket) {
            const [min, max] = key;
            if (min <= income && income <= max) {
                return val;
            }
        }
        // not found
        return -1;
    }

    return {
        add_rate,
        find_rate,
        adjust_for_inflation,
    }
};

