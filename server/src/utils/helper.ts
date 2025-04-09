export function clone_map<K, V extends Cloneable<V>>(map: Map<K, V>): Map<K, V> {
    return new Map(Array.from(map, ([k, v]) => [k, v.clone()]));
}

export interface Cloneable<T> {
    clone(): T;
}