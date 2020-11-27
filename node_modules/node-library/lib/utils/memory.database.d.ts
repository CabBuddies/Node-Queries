declare class Collection {
    private data;
    constructor();
    putItem(key: string, value: any): any;
    getItem(key: string): any;
    deleteItem(key: string): void;
    hasItem(key: string): boolean;
}
declare class Database {
    private collections;
    constructor();
    getCollection(name: string): Collection;
}
declare class Cluster {
    private databases;
    constructor();
    getDatabase(name: string): Database;
}
declare const _default: Cluster;
export default _default;
