import { 
    EventSeries, 
    StartYearConfig,
    DurationType, 
    AmountChangeType,
    AssetAllocation,
    FixedDistribution,
    UniformDistribution,
    NormalDistribution,
    SeriesReference
  } from '../types/eventSeries';
  
  //helper to sample from normal distribution
  function sampleNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
  }
  
  //helper to sample from uniform distribution
  function sampleUniform(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
  
  //get start year based on configuration
  export function getStartYear(
    startYear: StartYearConfig, 
    eventSeriesMap: Map<string, EventSeries>
  ): number {
    switch (startYear.type) {
      case 'fixed': {
        const fixed = startYear as FixedDistribution;
        return fixed.value;
      }
      case 'uniform': {
        const uniform = startYear as UniformDistribution;
        return sampleUniform(uniform.min, uniform.max);
      }
      case 'normal': {
        const normal = startYear as NormalDistribution;
        return Math.round(sampleNormal(normal.mean, normal.stdDev));
      }
      case 'afterSeries':
      case 'withSeries': {
        const seriesRef = startYear as SeriesReference;
        const referencedSeries = eventSeriesMap.get(seriesRef.seriesName);
        if (!referencedSeries) {
          throw new Error(`Referenced series ${seriesRef.seriesName} not found`);
        }
        const refStart = getStartYear(referencedSeries.startYear, eventSeriesMap);
        if (startYear.type === 'afterSeries') {
          const refDuration = getDuration(referencedSeries.duration);
          return refStart + refDuration;
        }
        return refStart;
      }
    }
  }
  
  //get duration based on configuration
  export function getDuration(duration: DurationType): number {
    switch (duration.type) {
      case 'fixed': {
        const fixed = duration as FixedDistribution;
        return fixed.value;
      }
      case 'uniform': {
        const uniform = duration as UniformDistribution;
        return sampleUniform(uniform.min, uniform.max);
      }
      case 'normal': {
        const normal = duration as NormalDistribution;
        return Math.round(sampleNormal(normal.mean, normal.stdDev));
      }
    }
  }
  
  //get amount change based on configuration
  export function getAmountChange(change: AmountChangeType, currentAmount: number): number {
    switch (change.type) {
      case 'fixed': {
        const fixed = change as FixedDistribution;
        return fixed.value;
      }
      case 'fixedPercent':
        return currentAmount * (change.value / 100);
      case 'uniform': {
        const uniform = change as UniformDistribution;
        return sampleUniform(uniform.min, uniform.max);
      }
      case 'normal': {
        const normal = change as NormalDistribution;
        return sampleNormal(normal.mean, normal.stdDev);
      }
    }
  }
  
  //calculate asset allocation for a given year
  export function calculateAssetAllocation(
    allocation: AssetAllocation,
    currentYear: number,
    startYear: number,
    duration: number
  ): Map<string, number> {
    const result = new Map<string, number>();
    
    if (allocation.type === 'fixed') {
      allocation.investments.forEach(inv => {
        result.set(inv.id, inv.initialPercentage);
      });
    } else { //glidePath
      const progress = Math.min(1, (currentYear - startYear) / duration);
      allocation.investments.forEach(inv => {
        const finalPercentage = inv.finalPercentage ?? inv.initialPercentage;
        const currentPercentage = inv.initialPercentage + 
          (finalPercentage - inv.initialPercentage) * progress;
        result.set(inv.id, currentPercentage);
      });
    }
  
    return result;
  }
  
  //validate that percentages sum to 100
  export function validateAssetAllocation(allocation: AssetAllocation): boolean {
    const initialSum = allocation.investments.reduce(
      (sum, inv) => sum + inv.initialPercentage, 
      0
    );
    
    if (Math.abs(initialSum - 100) > 0.01) return false;
    
    if (allocation.type === 'glidePath') {
      const finalSum = allocation.investments.reduce(
        (sum, inv) => sum + (inv.finalPercentage ?? inv.initialPercentage), 
        0
      );
      if (Math.abs(finalSum - 100) > 0.01) return false;
    }
    
    return true;
  }