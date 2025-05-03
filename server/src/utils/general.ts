export function reset_record<T extends string | number | symbol, V>(record: Record<T, V>): void {
    Object.keys(record).forEach(key => {
      delete record[key as T];
    });
  }
  
// return true if we updated fields
export function update_record<T extends string | number | symbol, V>(record: Record<T, V>, key: T, value: V): boolean {
    let flag = (key in record) // check if key was in record    
    record[key] = value;
    return flag
}

export function equal_record(
    r1: Record<string, number>,
    r2: Record<string, number>
  ): boolean {
    const keys1 = Object.keys(r1);
    const keys2 = Object.keys(r2);
    if (keys1.length !== keys2.length) return false;
  
    for (const key of keys1) {
      if (!r2.hasOwnProperty(key)) return false;
      if (r1[key] !== r2[key]) return false;
    }
  
    return true;
  }