export const pipe = <T> (...fns: Array<(arg: T) => T>) => 
    (initial: T) => fns.reduce((val, fn) => fn(val), initial);


export const compose = <T> (...fns: Array<(arg: T) => T>): (arg: T) => T => {
    return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
} 

export type Immutable<T> = {
    readonly [P in keyof T]: Immutable<T[P]>;
}

