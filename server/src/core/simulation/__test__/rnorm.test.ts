// rnorm.test.ts
import normal from "@stdlib/random-base-normal";

describe("normal distribution single sample", () => {
  it("should generate a single normal random number", () => {
    const mean = 0.02;
    const stdev = 0.01;
    const num_samples = 5000;

    // 直接调用 normal(...) 拿到一个随机数
    const value = normal(mean, stdev);
    console.log("value", value);
    console.log("num_samples", num_samples);

    const final_value = num_samples + value * num_samples;
    console.log("final_value", final_value);
    // value 就是 number
    console.log("Random sample =", value);

    // 断言 value 是 number
    expect(typeof value).toBe("number");
  });
});
