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


export function has_required_word_occurrences(inputString: string, required_words: string[]): boolean {
    const required_occurrences: Record<string, number> = {};

    for (const target_word of required_words) {
        required_occurrences[target_word] = (required_occurrences[target_word] || 0) + 1;
    }

    const words_in_input = inputString.split(' ').filter(word => word.length > 0);

    const actual_occurrences: Record<string, number> = {};
    for (const current_word of words_in_input) {
        if (current_word in required_occurrences) {
        actual_occurrences[current_word] = (actual_occurrences[current_word] || 0) + 1;
        }
    }

    return Object.keys(required_occurrences).every(requiredWord => 
        (actual_occurrences[requiredWord] || 0) >= required_occurrences[requiredWord]
    );
}