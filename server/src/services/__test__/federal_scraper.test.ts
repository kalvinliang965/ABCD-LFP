import fs from 'fs';
import path from 'path';
import { parse_capital_gains } from '../FederalTaxScraper';
import { TaxFilingStatus } from '../../core/Enums';
import { extractNumbers } from '../../utils/NumberUtils';

// the follow code are from AI
// im using to learn how to write test cases
const toComparableObject = <T>(obj: T): T => {
    const replacer = (key: string, value: any) => {
      if (typeof value === 'number' && !isFinite(value)) {
        return { __INFINITY__: value > 0 };
      }
      return value;
    };
  
    const reviver = (key: string, value: any) => {
      if (value?.__INFINITY__ !== undefined) {
        return value.__INFINITY__ ? Infinity : -Infinity;
      }
      return value;
    };
  
    return JSON.parse(
      JSON.stringify(obj, replacer),
      reviver
    );
  };
  

const loadFixture = (filename: string): string => {
    return fs.readFileSync(
        path.join(__dirname, 'fixtures', filename),
        'utf-8'
    );
};

jest.mock( '../../db/repositories/TaxBracketRepository');

describe('parse_capital_gains', () => {

    test("valid html file one", async() => {
        const html = loadFixture("valid_capital_gains_one.html");
        const brackets = await parse_capital_gains(html);

        const expected = [
            { min: 0, max: 44625, rate: 0 },
            { min: 44626, max: 492300, rate: 0.15 },
            { min: 492301, max: Infinity, rate: 0.20 },
        ];

        brackets.get_rates(TaxFilingStatus.SINGLE).forEach((bracket, index) => {
            expect(bracket).toMatchObject((expected)[index]);
        });

        expect(toComparableObject(brackets.get_rates(TaxFilingStatus.SINGLE)))
        .toEqual(toComparableObject(expected));
    });

    test("Invalid html file one", async() => {
        const html = loadFixture('invalid_capital_gains_one.html');
        await expect(parse_capital_gains(html))
            .rejects
            .toThrow("Capital gains data unavailable");
    });
});

