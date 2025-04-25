import path from "path";
import fs from "fs";

export const loadFixture = (filename: string): string => {
    return fs.readFileSync(
        path.join(__dirname, 'fixtures', filename),
        'utf-8'
    );
};