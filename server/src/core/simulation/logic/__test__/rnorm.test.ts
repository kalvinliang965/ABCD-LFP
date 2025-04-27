// rnorm.test.ts
import normal = require("@stdlib/random-base-normal");

describe("normal distribution single sample", () => {
  it("should generate a single normal random number", () => {
    const mean = 0.02;
    const stdev = 0.01;
    const num_samples = 5000;

    const value = normal(mean, stdev);
    console.log("value", value);
    console.log("num_samples", num_samples);

    const final_value = num_samples + value * num_samples;
    console.log("final_value", final_value);
    console.log("Random sample =", value);

    expect(typeof value).toBe("number");
  });
});
