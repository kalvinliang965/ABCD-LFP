import { connect_database, disconnect_database } from '../../db/connections';
import { readFileSync } from "fs";
import { scrape_rmd_table } from '../RMDScraper';
import { loadFixture } from './common';



describe('scrape_rmd_table', () => {

    it("should scrape normal rmd table", async() => {
        const html = loadFixture("uniform_rmd_table_normal.html");
        const rmd_factor = await scrape_rmd_table(html);

        const expected = new Map([
          [72, 27.4],
          [97, 7.8],
          [75, 24.6],
          [100, 6.4],
          [120, 2.0],
        ])

        expect(rmd_factor).toEqual(expected);

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
        const expected = new Map([
          [85, 16],
          [110, 3.5],
        ])
        expect(rmd_factor).toEqual(expected);
    });
});