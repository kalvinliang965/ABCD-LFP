import { has_required_word_occurrences } from "../general";

describe("general util", () => {

    describe("has_required_word_occurrences", () => {
        // Basic functionality
        test("returns true when all required words meet occurrence thresholds", () => {
          expect(
            has_required_word_occurrences("React Vue Angular React", ["React", "Vue", "Angular"])
          ).toBe(true);
        });
      
        // Case sensitivity
        test("strictly respects case sensitivity", () => {
          // Only exact case matches count
          expect(
            has_required_word_occurrences("Python python PYTHON", ["Python"])
          ).toBe(true);
          
          expect(
            has_required_word_occurrences("PYTHON Python pythON", ["python"])
          ).toBe(false);
        });
      
        // Whitespace handling
        test("handles various whitespace scenarios", () => {
          // Leading/trailing spaces
          expect(
            has_required_word_occurrences("   Java C++   ", ["Java", "C++"])
          ).toBe(true);
      
          // Multiple internal spaces
          expect(
            has_required_word_occurrences("Python   TypeScript  Rust", ["TypeScript"])
          ).toBe(true);
      
          // All whitespace input
          expect(
            has_required_word_occurrences("     ", ["test"])
          ).toBe(false);
        });
      
        // Special characters
        test("handles words with special characters", () => {
          expect(
            has_required_word_occurrences("C++ is hard!", ["C++"])
          ).toBe(true);
      
          expect(
            has_required_word_occurrences("my_var = 42", ["my_var"])
          ).toBe(true);
        });
      
        // Occurrence thresholds
        test("validates exact occurrence requirements", () => {
          // Exact match
          expect(
            has_required_word_occurrences("A A B", ["A", "A", "B"])
          ).toBe(true);
      
          // Insufficient occurrences
          expect(
            has_required_word_occurrences("A B", ["A", "A"])
          ).toBe(false);
        });
      
        // Edge cases
        test("handles empty input scenarios", () => {
          // Empty string with requirements
          expect(
            has_required_word_occurrences("", ["test"])
          ).toBe(false);
      
          // Empty requirements list
          expect(
            has_required_word_occurrences("Hello World", [])
          ).toBe(true);
        });
      
        // Partial matching
        test("ignores non-target words", () => {
          // Substring protection
          expect(
            has_required_word_occurrences("TypeScript", ["Script"])
          ).toBe(false);
        });
      
        // Mixed scenarios
        test("returns false for partial fulfillment", () => {
          expect(
            has_required_word_occurrences("A A B", ["A", "A", "B", "C"])
          ).toBe(false);
        });
      
        // Performance boundaries
        test("handles large occurrence requirements", () => {
          const bigInput = "test ".repeat(1000) + "final";
          expect(
            has_required_word_occurrences(bigInput, ["test", ...Array(999).fill("test"), "final"])
          ).toBe(true);
        });
      
        // Negative scenarios
        test("returns false when occurrences are insufficient", () => {
          expect(
            has_required_word_occurrences("python", ["python", "python"])
          ).toBe(false);
        });
      
        // Exact match validation
        test("validates exact word matching", () => {
          // No partial word matches
          expect(
            has_required_word_occurrences("applepie", ["apple"])
          ).toBe(false);
        });
      
        // Multi-case verification
        test("verifies multiple case variants", () => {
          expect(
            has_required_word_occurrences("PYTHON Python pythON", ["PYTHON", "Python", "pythON"])
          ).toBe(true);
        });
      });

});