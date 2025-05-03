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