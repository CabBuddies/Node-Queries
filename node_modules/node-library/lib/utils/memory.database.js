"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Collection {
    constructor() {
        this.data = {};
    }
    putItem(key, value) {
        this.data[key] = value;
        return this.data[key];
    }
    getItem(key) {
        return this.data[key];
    }
    deleteItem(key) {
        delete this.data[key];
    }
    hasItem(key) {
        return key in this.data;
    }
}
class Database {
    constructor() {
        this.collections = {};
    }
    getCollection(name) {
        if (name in this.collections === false)
            this.collections[name] = new Collection();
        return this.collections[name];
    }
}
class Cluster {
    constructor() {
        this.databases = {};
    }
    getDatabase(name) {
        if (name in this.databases === false)
            this.databases[name] = new Database();
        return this.databases[name];
    }
}
exports.default = new Cluster();
