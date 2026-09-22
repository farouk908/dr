import { Product } from '../types';

const DB_NAME = 'dr_bodyshaper_db';
const DB_VERSION = 1;
const STORE_NAME = 'products';
const LOCAL_STORAGE_KEY = 'dr_bodyshaper_products';

const FAKE_PRODUCT_IDS = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);
const FAKE_PRODUCT_SKUS = new Set([
  'DBS-SHP-A01',
  'DBS-LUN-E02',
  'DBS-SWM-Z03',
  'DBS-LUN-V04',
  'DBS-SHP-H05',
  'DBS-LUN-O06',
  'DBS-SWM-K07',
  'DBS-LIN-N08'
]);
const FAKE_PRODUCT_NAMES = new Set([
  'Aria Ultra-Sculpting Full Bodysuit',
  'Eyo Mulberry Silk Luxury Kimono Robe',
  'Zaria Resort Cut-Out Monokini',
  'Victoria Backless Satin Corset Top',
  'Hourglass 9-Steel Bone Latex Waist Clincher',
  'Odua Silk Pyjama Lounge Set',
  'Kemi Luxe Silk Kaftan Resort Cover-Up',
  'Nneka Seamless Silk Knicker Set (3-Pack)'
]);

export function isFakeProduct(product: Product): boolean {
  if (!product) return true;
  if (FAKE_PRODUCT_IDS.has(String(product.id))) return true;
  if (product.sku && FAKE_PRODUCT_SKUS.has(product.sku)) return true;
  if (product.name && FAKE_PRODUCT_NAMES.has(product.name)) return true;
  return false;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Loads products from IndexedDB (with fallback to localStorage).
 * Automatically purges any legacy demo / fake products.
 */
export async function loadStoredProducts(): Promise<Product[]> {
  let products: Product[] = [];

  try {
    const db = await openDB();
    products = await new Promise<Product[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve((req.result as Product[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read error, falling back to localStorage:', err);
  }

  // If IndexedDB was empty or failed, check localStorage
  if (!products || products.length === 0) {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        products = JSON.parse(saved);
      }
    } catch {
      products = [];
    }
  }

  // Filter out any fake products
  const cleanProducts = (products || []).filter((p) => !isFakeProduct(p));

  // If fake products were filtered out, re-persist the clean array
  if (cleanProducts.length !== (products || []).length) {
    await persistProducts(cleanProducts);
  }

  return cleanProducts;
}

/**
 * Synchronous initial read from localStorage for immediate flicker-free first render,
 * with all fake products stripped out.
 */
export function getInitialSyncProducts(): Product[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return [];
    const parsed: Product[] = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => !isFakeProduct(p));
  } catch {
    return [];
  }
}

/**
 * Persists products to IndexedDB as primary permanent storage,
 * and syncs to localStorage safely.
 */
export async function persistProducts(products: Product[]): Promise<void> {
  const cleanProducts = products.filter((p) => !isFakeProduct(p));

  // 1. Save to IndexedDB (virtually unlimited quota)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Clear existing records and re-insert
      store.clear();
      cleanProducts.forEach((product) => {
        store.put(product);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB save failed:', err);
  }

  // 2. Mirror to localStorage (with quota error guard)
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanProducts));
  } catch (err) {
    console.warn('LocalStorage quota limit reached; IndexedDB remains primary source of truth.', err);
  }
}

/**
 * Saves or updates a single product in IndexedDB and localStorage.
 */
export async function persistSingleProduct(product: Product): Promise<void> {
  if (isFakeProduct(product)) return;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(product);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB single save failed:', err);
  }

  // Also update localStorage
  try {
    const current = getInitialSyncProducts();
    const index = current.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = product;
    } else {
      updated = [product, ...current];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage single update skipped due to quota:', err);
  }
}

/**
 * Deletes a product by ID from IndexedDB and localStorage.
 */
export async function deleteStoredProduct(productId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(productId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB delete failed:', err);
  }

  try {
    const current = getInitialSyncProducts();
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage delete update skipped:', err);
  }
}
