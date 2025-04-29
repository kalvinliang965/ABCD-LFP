export function deep_serialize(obj: any): any {
    if (obj instanceof Set) {
        return Array.from(obj).map(deep_serialize);
    } else if (obj instanceof Map) {
        return Array.from(obj.entries()).map(([key, value]) => [key, deep_serialize(value)]);
    } else if (Array.isArray(obj)) {
        return obj.map(deep_serialize);
    } else if (obj !== null && typeof obj === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            serialized[key] = deep_serialize(value);
        }
        return serialized;
    } else {
        return obj;
    }
}
