import { TaxFilingStatus } from "../Enums";

export type TaxBracket = {
    min: number,
    max: number,
    rate: number,
} 

export type TaxBracketSet = TaxBracket[];

export interface TaxBrackets {
    add_rate: (min: number, max: number, rate: number, status: TaxFilingStatus) => void;
    find_rate: (income: number, status: TaxFilingStatus) => number;
    adjust_for_inflation: (rate: number) => void;
    to_string: () => string;
    find_highest_brackets: () => Array<{taxpayer_type: TaxFilingStatus, taxbracket: TaxBracket}>;
    find_bracket(rate: number, status: TaxFilingStatus): TaxBracket;
};

export function create_tax_brackets(): TaxBrackets {

    // single tax payer bracket
    // married filing jointly brakcet
    const brackets: Map<TaxFilingStatus, TaxBracketSet> = new Map ([
        [TaxFilingStatus.SINGLE, []],
        [TaxFilingStatus.MARRIED, []],
    ]);
    
    const add_rate = (
        min: number,
        max: number,
        rate: number, 
        status: TaxFilingStatus,
    ): void => {
        const bracketSet = brackets.get(status); 
        if (!bracketSet) {
            throw new Error(`Invalid TaxFilingStatus: ${status}`);
        }
        
        if (min >= max || min < 0) {
            throw new Error(`Invalid tax bracket [${min}, ${max}]`);
        }
        const newBracket: TaxBracket = {min, max, rate };
        bracketSet.push(newBracket);
        // sort it for easier retrieve
        bracketSet.sort((a, b) => a.min - b.min); 
    }

    const find_rate = (income: number, status: TaxFilingStatus): number => {
        const bracketSet = brackets.get(status); 
        if (!bracketSet) {
            throw new Error(`Invalid TaxFilingStatus: ${status}`);
        }

        const N: number = bracketSet.length; 
        let [l, r] = [0, N - 1];
        while (l <= r) {
            const m = l + Math.floor((r - l) / 2);
            const bracket = bracketSet[m];
            if (income < bracket.min) {
                r = m - 1;
            } else if (income > bracket.max) {
                l = m + 1;
            } else {
                return bracket.rate;
            }
        }
        // There should always exist a rate for income.
        // The table should cover all range.
        console.error(`Invalid bracket data for ${status} status`);
        console.error(to_string());
        process.exit(1);
    }

    const find_bracket = (rate: number, status: TaxFilingStatus): TaxBracket => {
        const bracketSet = brackets.get(status); 
        if (!bracketSet) {
            throw new Error(`Invalid TaxFilingStatus: ${status}`);
        }
        const N: number = bracketSet.length; 
        let [l, r] = [0, N - 1];
        while (l <= r) {
            const m = l + Math.floor((r - l) / 2);
            const bracket = bracketSet[m];
            if (rate < bracket.rate) {
                r = m - 1;
            } else if (rate > bracket.rate) {
                l = m + 1;
            } else {
                return bracket;
            }
        }

        // There should always exist a range for an income.
        // The table should cover all range.
        console.error(`Invalid bracket data for ${status} status`);
        console.error(to_string());
        process.exit(1);
    }

    const adjust_for_inflation = (rate: number):void => {
        for (const bracketSet of brackets.values()) {
            for (const bracket of bracketSet) {
                bracket.min *= 1 + rate;
                bracket.max *= 1 + rate;
            }
        }
    }

    const to_string = (): string => {
        let res = "SINGLE\n";
        const single_bracket_set = brackets.get(TaxFilingStatus.SINGLE);
        if (!single_bracket_set) {
            throw new Error("Missing single taxpayer bracket");
        }
        for (const bracket of single_bracket_set) {
            res += `[${bracket.min}, ${bracket.max}]: ${bracket.rate}\n`
        }
        res += "\nMARRIED\n"
        const married_bracket_set = brackets.get(TaxFilingStatus.MARRIED);
        if (!married_bracket_set) {
            throw new Error("Missing married filing jointly taxpayer bracket");
        }
        for (const bracket of married_bracket_set) {
            res += `[${bracket.min}, ${bracket.max}]: ${bracket.rate}\n`
        }
        return res;
    }

    const find_highest_brackets = (): Array<{taxpayer_type: TaxFilingStatus, taxbracket: TaxBracket}> => {
        const res = [];
        for (const [taxpayer_type, bracketSet] of brackets.entries()) {
            const N = bracketSet.length
            const last_bracket = bracketSet[N - 1];
            res.push({taxpayer_type, taxbracket: last_bracket});
        }
        return res
    }
    return {
        add_rate,
        find_rate,
        adjust_for_inflation,
        to_string,
        find_highest_brackets,
        find_bracket,
    } as const;
};

