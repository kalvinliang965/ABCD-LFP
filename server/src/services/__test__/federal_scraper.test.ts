import fs from 'fs';
import path from 'path';
import { parse_capital_gains, extractNumbers } from '../FederalTaxScraper';
import { TaxFilingStatus } from '../../core/Enums';
import { save_bracket } from '../../db/repositories/TaxBracketRepository';
import { json } from 'body-parser';

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


// The following are my own code, but us AI to come up with random sentences.
describe("general helper function", () => {

  test("extract number test one", async() => {
    const sentence = "The investment grew to over $200,000 within five years";
    const number_list = extractNumbers(sentence, 1);
    expect(number_list.length)
      .toEqual(1);
    expect(number_list[0])
      .toEqual(200000);
  });
  test("extract number test two", async() => {
    const sentence = "He donated $50,000";
    const number_list = extractNumbers(sentence, 1);
    expect(number_list.length)
      .toEqual(1);
    expect(number_list[0])
      .toEqual(50000);
  });
  test("extract number test three", async() => {
      const sentence = `
      For incomes more than $44,625 but less than or equal to $492,300 for single filers, and more than $89,250 but less than or equal to $553,850 for married filing jointly, the capital gains tax rate is 15%
    `;
    const number_list = extractNumbers(sentence, 5);
    expect(number_list.length)
      .toEqual(5);
    expect(number_list[0])
      .toEqual(44625);
    expect(number_list[1])
      .toEqual(492300);
    expect(number_list[2])
      .toEqual(89250);
    expect(number_list[3])
      .toEqual(553850);
    expect(number_list[4])
      .toEqual(15);
  });test("extract number test four", async () => {
    const sentence = `
      A couple with a combined income of $150,000 and investment gains of $45,000 would face a tax bill of approximately $22,500.
    `;
    const number_list = extractNumbers(sentence, 3);
    expect(number_list.length).toEqual(3);
    expect(number_list[0]).toEqual(150000);
    expect(number_list[1]).toEqual(45000);
    expect(number_list[2]).toEqual(22500);
  });

  test("extract number test five", async () => {
    const sentence = `
      More than $250,000 but less than or equal to $500,000 for property sales, 
      and more than $500,000 but less than or equal to $1,000,000 for business sales.
    `;
    const number_list = extractNumbers(sentence, 4);
    expect(number_list.length).toEqual(4);
    expect(number_list[0]).toEqual(250000);
    expect(number_list[1]).toEqual(500000);
    expect(number_list[2]).toEqual(500000);
    expect(number_list[3]).toEqual(1000000);
  });

  test("extract number test six", async () => {
    const sentence = `
      For tax purposes, contributions exceeding $10,000 but not surpassing $20,000 are deductible at a rate of 25%, 
      while contributions above $20,000 are deductible at 30%.
    `;
    const number_list = extractNumbers(sentence, 5);
    expect(number_list.length).toEqual(5);
    expect(number_list[0]).toEqual(10000);
    expect(number_list[1]).toEqual(20000);
    expect(number_list[2]).toEqual(25);
    expect(number_list[3]).toEqual(20000);
    expect(number_list[4]).toEqual(30);
  });

  test("extract number test seven", async () => {
    const sentence = `
      If the total amount of earned income exceeds $150,000 and investment income exceeds $50,000, the tax rate increases by 3%.
    `;
    const number_list = extractNumbers(sentence, 3);
    expect(number_list.length).toEqual(3);
    expect(number_list[0]).toEqual(150000);
    expect(number_list[1]).toEqual(50000);
    expect(number_list[2]).toEqual(3);
  });

  test("extract number test eight", async () => {
    const sentence = `
      A portfolio containing $300,000 in stocks, $150,000 in bonds, and $50,000 in real estate generated a total annual return of $45,000.
    `;
    const number_list = extractNumbers(sentence, 4);
    expect(number_list.length).toEqual(4);
    expect(number_list[0]).toEqual(300000);
    expect(number_list[1]).toEqual(150000);
    expect(number_list[2]).toEqual(50000);
    expect(number_list[3]).toEqual(45000);
  });
})