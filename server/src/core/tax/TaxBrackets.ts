import { TaxFilingStatus } from "../Enums";

export type TaxBracket = {
    min: number,
    max: number,
    rate: number,
} 

export type TaxBracketSet = TaxBracket[];

export interface TaxBrackets {
    add_bracket: (min: number, max: number, rate: number, status: TaxFilingStatus) => void;
    find_rate: (income: number, status: TaxFilingStatus) => number;
    find_highest_brackets: () => Array<{taxpayer_type: TaxFilingStatus, taxbracket: TaxBracket}>;
    adjust_for_inflation: (rate: number) => void;
    to_string: () => string;
    find_highest_bracket: (status: TaxFilingStatus) => TaxBracket | undefined;
    find_bracket_with_rate(rate: number, status: TaxFilingStatus): TaxBracket;
    find_bracket_with_income(income: number, status: TaxFilingStatus): TaxBracket;
    get_rates(status: TaxFilingStatus): ReadonlyTaxBracketSet;
    clone(): TaxBrackets;
};


export type ReadonlyTaxBracketSet = Readonly<Readonly<TaxBracket>[]>;

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
        min = Math.round(min);
        max = Math.round(max)
        const newBracket: TaxBracket = { min, max, rate };
        bracketSet.push(newBracket);
        // sort it for easier retrieve
        bracketSet.sort((a, b) => a.min - b.min); 
    }

    const find_rate = (income: number, status: TaxFilingStatus): number => {
        try {
            return find_bracket_with_income(income, status).rate;
        } catch (error) {
            throw error;
        }
    }

    const find_bracket_with_income = (income: number, status: TaxFilingStatus): TaxBracket  => {
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
                return bracket;
            }
        }
        // There should always exist a rate for income.
        // The table should cover all range.
        console.error(`Invalid bracket data for ${status} status, looking bracket with income ${income}`);
        console.error(to_string());
        process.exit(1);
    }

    const find_bracket_with_rate = (rate: number, status: TaxFilingStatus): TaxBracket => {
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
        console.error(`Invalid bracket data for ${status} status, looking bracket with rate ${rate}`);
        console.error(to_string());
        process.exit(1);
    }

    const adjust_for_inflation = (rate: number):void => {
        for (const bracket_set of brackets.values()) {
            for (const bracket of bracket_set) {
                bracket.min = Math.round(bracket.min * (1 + rate));
                
                if (bracket.max !== Infinity) {
                    bracket.max = Math.round(bracket.max * (1 + rate));
                }
            }
            bracket_set.sort((a, b) => a.min - b.min);

            for (let i = 0; i < bracket_set.length - 1; i++) {
                const current = bracket_set[i];
                const next = bracket_set[i + 1];
                current.max = next.min - 1;
                if (current.max < current.min) {
                    next.min = current.min + 1;
                    current.max = next.min - 1;
                }
            }
            const last_bracket = bracket_set[bracket_set.length - 1];
            if (last_bracket) {
                last_bracket.max = Infinity;
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

    const find_highest_bracket = (status: TaxFilingStatus): TaxBracket | undefined => {
        let res;
        const bracketSet = brackets.get(status);
        if (!bracketSet) {
            return undefined
        }
        return bracketSet[bracketSet.length - 1];
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
    // This code is generated by AI
    const get_rates = (status: TaxFilingStatus): ReadonlyTaxBracketSet => {
        if (!Object.values(TaxFilingStatus).includes(status)) {
            throw new Error(`Invalid TaxFilingStatus: ${String(status)}`);
        }
        const bracketSet = brackets.get(status);
        if (!bracketSet || bracketSet.length == 0) {
            throw new Error(`No tax brackets found for status: ${String(status)}`);
        }
        return bracketSet.map(b => ({
            min: Object.freeze(b.min),
            max: Object.freeze(b.max),
            rate: Object.freeze(b.rate),
        })) as ReadonlyTaxBracketSet;
    }
    return {
        add_bracket: add_rate,
        find_rate,
        adjust_for_inflation,
        to_string,
        find_highest_bracket,
        find_highest_brackets,
        find_bracket_with_rate,
        find_bracket_with_income,
        get_rates,
        clone: (): TaxBrackets => {
            const cloned = create_tax_brackets()
            
            const valid_statuses = [TaxFilingStatus.SINGLE, TaxFilingStatus.MARRIED];

            valid_statuses.forEach(status => {
                const bracketSet = brackets.get(status);
                if (!bracketSet) return;

                bracketSet.forEach(bracket => {
                    cloned.add_bracket(
                        bracket.min,
                        bracket.max,
                        bracket.rate,
                        status
                    )
                });
            });

            return cloned;
        }
    };
};

