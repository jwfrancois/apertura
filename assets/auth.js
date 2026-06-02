// ====================================================================
// Apertura — UserStore
// Browser-side auth using IndexedDB + PBKDF2 password hashing via
// the Web Crypto API. Static-deploy friendly — no server required.
// ====================================================================

const DB_NAME = 'apertura';
const DB_VERSION = 1;
const STORE_USERS = 'users';
const STORE_PROGRESS = 'progress';
const STORE_ADMIN = 'admin';
const SESSION_KEY = 'apertura-current-user';

class UserStore {
  constructor() {
    this._dbPromise = null;
    this._currentUser = null;
  }

  // ---------- IndexedDB setup ----------
  _openDB() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_USERS)) {
          db.createObjectStore(STORE_USERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
          const s = db.createObjectStore(STORE_PROGRESS, { keyPath: 'key' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_ADMIN)) {
          db.createObjectStore(STORE_ADMIN, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
    return this._dbPromise;
  }

  _tx(storeName, mode = 'readonly') {
    return this._openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
  }

  _await(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ---------- password hashing (PBKDF2) ----------
  async _hashPassword(password, salt) {
    const enc = new TextEncoder();
    const useSalt = salt || crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: useSalt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    return {
      salt: this._bytesToHex(useSalt),
      hash: this._bytesToHex(new Uint8Array(bits)),
    };
  }

  _bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  _hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
  }

  async _verifyPassword(password, saltHex, expectedHashHex) {
    const result = await this._hashPassword(password, this._hexToBytes(saltHex));
    return result.hash === expectedHashHex;
  }

  // ---------- ID helper ----------
  _genId() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  // ---------- public API ----------
  async seedDefaultAdmin() {
    const store = await this._tx(STORE_ADMIN);
    const existing = await this._await(store.get('admin'));
    if (existing) return;
    const { salt, hash } = await this._hashPassword('admin123');
    const adminRecord = {
      id: 'admin',
      email: 'admin@apertura.photo',
      name: 'Demo Admin',
      role: 'admin',
      salt,
      hash,
      createdAt: Date.now(),
    };
    await this._await(store.put(adminRecord));
    // Also create a corresponding user record so the admin can appear in user lists
    const userStore = await this._tx(STORE_USERS);
    const existingAdminUser = await this._await(userStore.get('u_admin'));
    if (!existingAdminUser) {
      await this._await(userStore.put({
        id: 'u_admin',
        email: 'admin@apertura.photo',
        name: 'Demo Admin',
        role: 'admin',
        createdAt: Date.now(),
      }));
    }
  }

  // ----- register / login / logout -----
  async register({ email, name, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }
    const userStore = await this._tx(STORE_USERS);
    // Check duplicate
    const allUsers = await this._await(userStore.getAll());
    if (allUsers.find((u) => u.email === cleanEmail)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const { salt, hash } = await this._hashPassword(password);
    const id = this._genId();
    const user = {
      id,
      email: cleanEmail,
      name: (name || cleanEmail.split('@')[0]).trim(),
      role: 'student',
      salt,
      hash,
      createdAt: Date.now(),
    };
    await this._await(userStore.put(user));
    // Strip secrets from in-memory copy
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    this._currentUser = sessionUser;
    localStorage.setItem(SESSION_KEY, id);
    return { ok: true, user: sessionUser };
  }

  async login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    // First check the admin store
    const adminStore = await this._tx(STORE_ADMIN);
    const admin = await this._await(adminStore.get('admin'));
    if (admin && admin.email === cleanEmail) {
      const match = await this._verifyPassword(password, admin.salt, admin.hash);
      if (!match) return { ok: false, error: 'Incorrect password.' };
      const sessionUser = { id: 'u_admin', email: admin.email, name: admin.name, role: 'admin', createdAt: admin.createdAt };
      this._currentUser = sessionUser;
      localStorage.setItem(SESSION_KEY, sessionUser.id);
      return { ok: true, user: sessionUser };
    }
    // Then check regular users
    const userStore = await this._tx(STORE_USERS);
    const allUsers = await this._await(userStore.getAll());
    const user = allUsers.find((u) => u.email === cleanEmail && u.role !== 'admin');
    if (!user) {
      return { ok: false, error: 'No account found with that email.' };
    }
    const match = await this._verifyPassword(password, user.salt, user.hash);
    if (!match) return { ok: false, error: 'Incorrect password.' };
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    this._currentUser = sessionUser;
    localStorage.setItem(SESSION_KEY, sessionUser.id);
    return { ok: true, user: sessionUser };
  }

  async logout() {
    this._currentUser = null;
    localStorage.removeItem(SESSION_KEY);
  }

  async currentUser() {
    if (this._currentUser) return this._currentUser;
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const userStore = await this._tx(STORE_USERS);
    const user = await this._await(userStore.get(id));
    if (user) {
      this._currentUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
      return this._currentUser;
    }
    return null;
  }

  // ----- progress (per-user) -----
  _progressKey(userId, lessonId) {
    return `${userId}::${lessonId}`;
  }

  async getCompletedSet(userId) {
    if (!userId) return new Set();
    const progressStore = await this._tx(STORE_PROGRESS);
    const idx = progressStore.index('userId');
    const matches = await this._await(idx.getAll(userId));
    return new Set(matches.map((r) => r.lessonId));
  }

  async setLessonComplete(userId, lessonId, complete = true) {
    if (!userId) return;
    const progressStore = await this._tx(STORE_PROGRESS, 'readwrite');
    const key = this._progressKey(userId, lessonId);
    if (complete) {
      await this._await(progressStore.put({
        key,
        userId,
        lessonId,
        completedAt: Date.now(),
      }));
    } else {
      await this._await(progressStore.delete(key));
    }
  }

  async toggleLessonComplete(userId, lessonId) {
    if (!userId) return false;
    const progressStore = await this._tx(STORE_PROGRESS);
    const key = this._progressKey(userId, lessonId);
    const existing = await this._await(progressStore.get(key));
    if (existing) {
      await this._tx(STORE_PROGRESS, 'readwrite').then((s) => s.delete(key));
      return false;
    }
    await this._tx(STORE_PROGRESS, 'readwrite').then((s) => s.put({
      key,
      userId,
      lessonId,
      completedAt: Date.now(),
    }));
    return true;
  }

  async setAssessmentResult(userId, result) {
    if (!userId) return;
    const progressStore = await this._tx(STORE_PROGRESS, 'readwrite');
    await this._await(progressStore.put({
      key: `${userId}::assessment`,
      userId,
      lessonId: 'assessment',
      result,
      completedAt: Date.now(),
    }));
  }

  async getAssessmentResult(userId) {
    if (!userId) return null;
    const progressStore = await this._tx(STORE_PROGRESS);
    const r = await this._await(progressStore.get(`${userId}::assessment`));
    return r ? r.result : null;
  }

  // ----- admin queries -----
  async listAllUsers() {
    const userStore = await this._tx(STORE_USERS);
    const users = await this._await(userStore.getAll());
    return users
      .filter((u) => u.role !== 'admin')
      .map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getUserById(id) {
    const userStore = await this._tx(STORE_USERS);
    const u = await this._await(userStore.get(id));
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
  }

  async getUserProgress(userId) {
    if (!userId) return new Set();
    return this.getCompletedSet(userId);
  }

  async deleteUser(id) {
    // Delete user record
    const userStore = await this._tx(STORE_USERS, 'readwrite');
    await this._await(userStore.delete(id));
    // Delete all progress entries
    const progressStore = await this._tx(STORE_PROGRESS, 'readwrite');
    const idx = progressStore.index('userId');
    const matches = await this._await(idx.getAll(id));
    for (const r of matches) {
      await this._await(progressStore.delete(r.key));
    }
  }

  async getStats() {
    const userStore = await this._tx(STORE_USERS);
    const users = await this._await(userStore.getAll());
    const students = users.filter((u) => u.role !== 'admin');
    const progressStore = await this._tx(STORE_PROGRESS);
    const allProgress = await this._await(progressStore.getAll());
    const assessments = allProgress.filter((p) => p.lessonId === 'assessment');
    // Per-lesson completion count
    const lessonCounts = {};
    for (const p of allProgress) {
      if (p.lessonId === 'assessment') continue;
      lessonCounts[p.lessonId] = (lessonCounts[p.lessonId] || 0) + 1;
    }
    const popular = Object.entries(lessonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));
    return {
      totalStudents: students.length,
      totalCompletions: allProgress.length - assessments.length,
      totalAssessments: assessments.length,
      popular,
    };
  }
}

// Singleton
if (typeof window !== 'undefined') {
  const store = new UserStore();
  // Sanity check — if a stale service worker served an old auth.js, the class
  // would parse but methods would be missing. Detect and self-heal.
  if (typeof store.register !== 'function' || typeof store.login !== 'function') {
    console.error('[UserStore] register/login missing — auth.js is stale. Clearing caches and reloading.');
    if ('caches' in self) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    }
  }
  window.UserStore = store;
  // Seed the demo admin on first load
  window.UserStore.seedDefaultAdmin().catch((e) => console.warn('Admin seed failed', e));
}
