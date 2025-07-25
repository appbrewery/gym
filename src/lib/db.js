const DB_NAME = 'GymBookingDB';
const DB_VERSION = 1;

class IndexedDBWrapper {
  constructor() {
    this.db = null;
  }

  async ensureConnection() {
    if (!this.db) {
      await this.init();
    }
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Classes store
        if (!db.objectStoreNames.contains('classes')) {
          const classStore = db.createObjectStore('classes', { keyPath: 'id' });
          classStore.createIndex('type', 'type');
          classStore.createIndex('dateTime', 'dateTime');
          classStore.createIndex('status', 'status');
        }

        // Bookings store
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingStore.createIndex('userId', 'userId');
          bookingStore.createIndex('classId', 'classId');
          bookingStore.createIndex('userClassCombo', ['userId', 'classId'], { unique: true });
        }

        // Waitlist store
        if (!db.objectStoreNames.contains('waitlist')) {
          const waitlistStore = db.createObjectStore('waitlist', { keyPath: 'id' });
          waitlistStore.createIndex('userId', 'userId');
          waitlistStore.createIndex('classId', 'classId');
          waitlistStore.createIndex('userClassCombo', ['userId', 'classId'], { unique: true });
        }

        // System settings store
        if (!db.objectStoreNames.contains('systemSettings')) {
          db.createObjectStore('systemSettings', { keyPath: 'id' });
        }
      };
    });
  }

  async add(storeName, data) {
    await this.ensureConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async get(storeName, key) {
    await this.ensureConnection();
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    await this.ensureConnection();
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    await this.ensureConnection();
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.get(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex(storeName, indexName, value) {
    await this.ensureConnection();
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    await this.ensureConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(storeName, key) {
    await this.ensureConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.ensureConnection();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    const storeNames = ['users', 'classes', 'bookings', 'waitlist', 'systemSettings'];
    for (const storeName of storeNames) {
      await this.clear(storeName);
    }
  }
}

// Create singleton instance
let dbInstance = null;
let dbConnection = null;

export async function getDB() {
  if (!dbInstance || !dbInstance.db) {
    dbInstance = new IndexedDBWrapper();
    await dbInstance.init();
  }
  return dbInstance;
}