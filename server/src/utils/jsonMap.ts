export class JsonMap<K, V> extends Map<K, V> {
    toJSON() {
        return Object.fromEntries(this);
    }
}