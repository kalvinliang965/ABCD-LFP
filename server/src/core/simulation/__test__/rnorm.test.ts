// rnorm.test.ts
import normal from "@stdlib/random-base-normal";

describe("normal distribution single sample", () => {
  it("should generate a single normal random number", () => {
    const mean = 0;
    const stdev = 1;

    // 直接调用 normal(...) 拿到一个随机数
    const value = normal(mean, stdev);

    // value 就是 number
    console.log("Random sample =", value);

    // 断言 value 是 number
    expect(typeof value).toBe("number");
  });
});
