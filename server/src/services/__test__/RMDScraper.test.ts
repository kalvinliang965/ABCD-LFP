import { getRMDFactorForAge } from '../RMDScraper';
import mongoose from 'mongoose';
import { connect_database, disconnect_database } from '../../db/connections';

//how to run this test
// cd server 
// npm test -- src/services/__test__/RMDScraper.test.ts

/**
 * Test Case 1: RMD Factor Retrieval for Valid Ages

Scenario: Call getRMDFactorForAge() for ages 72, 75, 80, 85, 90, 95, and 100.
Pass Criteria:
Each factor is a number between 0 and 100
RMD factors decrease as age increases (consistent with IRS rules)

Test Case 2: Handle Edge Cases (Out-of-Range Ages)
Scenario: Call getRMDFactorForAge() with ages 60, 120, and -5.
Pass Criteria:
Age 60 → Returns 0 (below RMD age)
Age 120 → Returns a valid positive factor
Negative age → Returns 0 or valid default

Test Case 3: Handle Database Error Gracefully
Scenario: Disconnect from MongoDB and call getRMDFactorForAge(75).
Pass Criteria: System either throws an error or returns a safe default (0) Test confirms the system does not crash
 */

describe('RMDScraper', () => {
  // Connect to the database before all tests
  beforeAll(async () => {
    await connect_database();
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await disconnect_database();
  });

  test('should retrieve correct RMD factors for various ages', async () => {
    // Test a range of ages
    const age72Factor = await getRMDFactorForAge(72);
    const age75Factor = await getRMDFactorForAge(75);
    const age80Factor = await getRMDFactorForAge(80);
    const age85Factor = await getRMDFactorForAge(85);
    const age90Factor = await getRMDFactorForAge(90);
    const age95Factor = await getRMDFactorForAge(95);
    const age100Factor = await getRMDFactorForAge(100);

    // Verify the factors are numbers and within expected ranges
    // RMD factors should be between 0 and 100
    expect(age72Factor).toBeGreaterThan(0);
    expect(age72Factor).toBeLessThan(100);
    
    expect(age75Factor).toBeGreaterThan(0);
    expect(age75Factor).toBeLessThan(100);
    
    expect(age80Factor).toBeGreaterThan(0);
    expect(age80Factor).toBeLessThan(100);
    
    expect(age85Factor).toBeGreaterThan(0);
    expect(age85Factor).toBeLessThan(100);
    
    expect(age90Factor).toBeGreaterThan(0);
    expect(age90Factor).toBeLessThan(100);
    
    expect(age95Factor).toBeGreaterThan(0);
    expect(age95Factor).toBeLessThan(100);
    
    expect(age100Factor).toBeGreaterThan(0);
    expect(age100Factor).toBeLessThan(100);

    // Verify that factors decrease as age increases
    // (RMD factors should be smaller for older ages)
    expect(age75Factor).toBeLessThan(age72Factor);
    expect(age80Factor).toBeLessThan(age75Factor);
    expect(age85Factor).toBeLessThan(age80Factor);
    expect(age90Factor).toBeLessThan(age85Factor);
    expect(age95Factor).toBeLessThan(age90Factor);
    expect(age100Factor).toBeLessThan(age95Factor);
  });

  test('should handle edge cases', async () => {
    // Test age below minimum RMD age
    const age60Factor = await getRMDFactorForAge(60);
    expect(age60Factor).toBe(0); // Should return 0 or some default value for ages below RMD age
    
    // Test very high age
    const age120Factor = await getRMDFactorForAge(120);
    expect(age120Factor).toBeGreaterThan(0); // Should still return a valid factor
    
    // Test invalid age
    const negativeAgeFactor = await getRMDFactorForAge(-5);
    expect(negativeAgeFactor).toBe(0); // Should handle invalid ages gracefully
  });

  test('should handle database errors gracefully', async () => {
    // Temporarily disconnect from the database to simulate an error
    await mongoose.disconnect();
    
    try {
      // This should handle the database error gracefully
      const factor = await getRMDFactorForAge(75);
      
      // Depending on your implementation, it might return a default value or throw
      // If it returns a default value:
      expect(factor).toBe(0); // Or whatever default you use
    } catch (error) {
      // If it throws, the error should be handled here
      expect(error).toBeDefined();
    } finally {
      // Reconnect to the database for subsequent tests
      await connect_database();
    }
  });
}); 