export const extractNumbers = (sentence: string, num: number): number[] => {
    const matches = sentence.match(/-?\d{1,3}(?:,\d{3})*(?:\.\d+)?/g) || [];
    const res = matches.map(m => Number(m.replace(/,/g, ''))).filter(num => !isNaN(num)); 
    if (res.length != num) {
        throw new Error(`Number of integer in this sentence should be equal to "${num}"`);
    }
    return res;
} 