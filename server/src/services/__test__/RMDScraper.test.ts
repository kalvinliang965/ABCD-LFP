import { scrape_rmd_table } from '../RMDScraper';
import { loadFixture } from './common';

describe('scrape_rmd_table', () => {
      const uniform_lifetime_table = new Map([
        [72, 27.4], [73, 26.5], [74, 25.6], [75, 24.7], [76, 23.8],
        [77, 22.9], [78, 22.0], [79, 21.1], [80, 20.2], [81, 19.4],
        [82, 18.5], [83, 17.7], [84, 16.8], [85, 16.0], [86, 15.2],
        [87, 14.4], [88, 13.7], [89, 12.9], [90, 12.2], [91, 11.5],
        [92, 10.8], [93, 10.1], [94, 9.5], [95, 8.9], [96, 8.4],
        [97, 10.2], [98, 9.6], [99, 9.1], [100, 8.6], [101, 8.1],
        [102, 7.6], [103, 7.1], [104, 6.7], [105, 6.3], [106, 5.9],
        [107, 5.5], [108, 5.2], [109, 4.9], [110, 4.5], [111, 4.2],
        [112, 3.9], [113, 3.7], [114, 3.4], [115, 3.1], [116, 2.9],
        [117, 2.6], [118, 2.4], [119, 2.1], [120, 1.9]
      ]);
    it("should scrape normal rmd table", async() => {
        const html = loadFixture("uniform_rmd_table_normal.html");
        const rmd_factor = await scrape_rmd_table(html);
        expect(rmd_factor).toEqual(uniform_lifetime_table);
    });
    it("should throw error if there are no rmd table", async() => {
        const html = loadFixture("no_rmd_table.html");
        await expect(scrape_rmd_table(html)).rejects.toThrow(/Table not found/);
    });
    it("should throw error if cell of rmd table is invalid", async() => {
        const html = loadFixture("invalid_rmd_data.html");
        await expect(scrape_rmd_table(html)).rejects.toThrow(/integer/);
    });
    it("should scrape the right rmd table from mutiple table", async() => {
        const html = loadFixture("rmd_among_mutiple_tables.html");
        const rmd_factor = await scrape_rmd_table(html);
        expect(rmd_factor).toEqual(uniform_lifetime_table);
    });
    it("should throw error if the table doesnt cover full age range", async() => {
        const html = loadFixture("rmd_not_enough_age.html");
        await expect(scrape_rmd_table(html)).rejects.toThrow(/missing/);
    });
});