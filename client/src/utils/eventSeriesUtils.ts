import { 
    EventSeries, 
    StartYearConfig,
    DistributionConfig,
    AmountChangeType,
} from '../types/eventSeries';
  
interface InvestmentAllocation {
  investment: string;
  initialPercentage: number;
  finalPercentage?: number;
}

interface AssetAllocation {
  type: 'fixed' | 'glidePath';
  investments: InvestmentAllocation[];
}
  
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
export function calculateStartYear(startYear: StartYearConfig, existingEvents: EventSeries[]): number {
  switch (startYear.type) {
    case 'fixed':
      return startYear.value || 0;
    case 'uniform':
      return Math.floor(Math.random() * ((startYear.max || 0) - (startYear.min || 0) + 1)) + (startYear.min || 0);
    case 'normal':
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const mean = startYear.mean || 0;
      const stdDev = startYear.stdDev || 1;
      return Math.round(mean + z0 * stdDev);
    case 'startWith':
      const startWithEvent = existingEvents.find(event => event.name === startYear.eventSeries);
      return startWithEvent ? calculateStartYear(startWithEvent.startYear, existingEvents) : 0;
    case 'startAfter':
      const startAfterEvent = existingEvents.find(event => event.name === startYear.eventSeries);
      if (!startAfterEvent) return 0;
      const eventStartYear = calculateStartYear(startAfterEvent.startYear, existingEvents);
      const eventDuration = calculateDuration(startAfterEvent.duration);
      return eventStartYear + eventDuration;
    default:
      return 0;
  }
}
  
//get duration based on configuration
export function getDuration(duration: DistributionConfig): number {
  switch (duration.type) {
    case 'fixed': {
      return duration.value || 1;
    }
    case 'uniform': {
      return sampleUniform(duration.min || 1, duration.max || 5);
    }
    case 'normal': {
      return Math.round(sampleNormal(duration.mean || 3, duration.stdDev || 1));
    }
  }
}
  
//get amount change based on configuration
export function getAmountChange(change: AmountChangeType, currentAmount: number): number {
  switch (change.type) {
    case 'fixed': {
      return change.value || 0;
    }
    case 'fixedPercent': {
      return currentAmount * ((change.value || 0) / 100);
    }
    case 'uniform': {
      return sampleUniform(change.min || 0, change.max || 0);
    }
    case 'normal': {
      return sampleNormal(change.mean || 0, change.stdDev || 0);
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
    allocation.investments.forEach((inv: InvestmentAllocation) => {
      result.set(inv.investment, inv.initialPercentage);
    });
  } else { //glidePath
    const progress = Math.min(1, (currentYear - startYear) / duration);
    allocation.investments.forEach((inv: InvestmentAllocation) => {
      const finalPercentage = inv.finalPercentage ?? inv.initialPercentage;
      const currentPercentage = inv.initialPercentage + 
        (finalPercentage - inv.initialPercentage) * progress;
      result.set(inv.investment, currentPercentage);
    });
  }

  return result;
}
  
//validate that percentages sum to 100
export function validateAssetAllocation(allocation: AssetAllocation): boolean {
  if (!allocation?.investments) return false;
  
  const initialSum = allocation.investments.reduce(
    (sum: number, inv: InvestmentAllocation) => sum + (inv.initialPercentage || 0), 
    0
  );
  
  if (Math.abs(initialSum - 100) > 0.01) return false;
  
  if (allocation.type === 'glidePath') {
    const finalSum = allocation.investments.reduce(
      (sum: number, inv: InvestmentAllocation) => sum + (inv.finalPercentage || 0), 
      0
    );
    if (Math.abs(finalSum - 100) > 0.01) return false;
  }
  
  return true;
}

export function calculateDuration(duration: DistributionConfig): number {
  switch (duration.type) {
    case 'fixed':
      return duration.value || 1;
    case 'uniform':
      return Math.floor(Math.random() * ((duration.max || 1) - (duration.min || 1) + 1)) + (duration.min || 1);
    case 'normal':
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const mean = duration.mean || 1;
      const stdDev = duration.stdDev || 1;
      return Math.max(1, Math.round(mean + z0 * stdDev));
    default:
      return 1;
  }
}