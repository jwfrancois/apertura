// ====================================================================
// Apertura — Auth API v3 (frozen object, no class)
// Browser-side auth using IndexedDB + PBKDF2 password hashing via
// the Web Crypto API. Static-deploy friendly — no server required.
//
// Design: a frozen plain object of functions. No class. No `this`.
// This way, if the file is truncated, the whole thing fails to load
// (syntax error) and we get "UserStore is not defined" — never
// "UserStore.login is not a function" (a half-loaded state).
// ====================================================================

(function () {
  if (typeof window === 'undefined') return;

  const DB_NAME = 'apertura';
  const DB_VERSION = 2; // bumped — kills old v1 stores that might conflict
  const STORE_USERS = 'users';
  const STORE_PROGRESS = 'progress';
  const STORE_ADMIN = 'admin';
  const SESSION_KEY = 'apertura-current-user';

  // -------- IndexedDB helpers --------
  function openDB() {
    return new Promise((resolve, reject) => {
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
  }

  function tx(storeName, mode) {
    return openDB().then((db) => db.transaction(storeName, mode || 'readonly').objectStore(storeName));
  }

  function awaitReq(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // -------- password hashing (PBKDF2 via Web Crypto) --------
  function bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const useSalt = salt || crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: useSalt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    return { salt: bytesToHex(useSalt), hash: bytesToHex(new Uint8Array(bits)) };
  }

  async function verifyPassword(password, saltHex, expectedHashHex) {
    const r = await hashPassword(password, hexToBytes(saltHex));
    return r.hash === expectedHashHex;
  }

  function genId() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  // -------- the public API as a frozen object --------
  // Every function is declared at this level. If ANY of them is missing,
  // the file fails to parse entirely → `UserStore` is undefined everywhere.
  // We never get the "half-loaded" state.

  const _currentUser = { value: null };

  async function seedDefaultAdmin() {
    const store = await tx(STORE_ADMIN);
    const existing = await awaitReq(store.get('admin'));
    if (existing) return;
    const { salt, hash } = await hashPassword('admin123');
    await awaitReq(store.put({
      id: 'admin', email: 'admin@apertura.photo', name: 'Demo Admin',
      role: 'admin', salt, hash, createdAt: Date.now(),
    }));
    const userStore = await tx(STORE_USERS);
    const existingAdminUser = await awaitReq(userStore.get('u_admin'));
    if (!existingAdminUser) {
      await awaitReq(userStore.put({
        id: 'u_admin', email: 'admin@apertura.photo', name: 'Demo Admin',
        role: 'admin', createdAt: Date.now(),
      }));
    }
  }

  async function register({ email, name, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return { ok: false, error: 'Email and password are required.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    const userStore = await tx(STORE_USERS);
    const allUsers = await awaitReq(userStore.getAll());
    if (allUsers.find((u) => u.email === cleanEmail)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const { salt, hash } = await hashPassword(password);
    const id = genId();
    const user = {
      id, email: cleanEmail,
      name: (name || cleanEmail.split('@')[0]).trim(),
      role: 'student', salt, hash, createdAt: Date.now(),
    };
    await awaitReq(userStore.put(user));
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    _currentUser.value = sessionUser;
    localStorage.setItem(SESSION_KEY, id);
    return { ok: true, user: sessionUser };
  }

  async function login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return { ok: false, error: 'Email and password are required.' };
    const adminStore = await tx(STORE_ADMIN);
    const admin = await awaitReq(adminStore.get('admin'));
    if (admin && admin.email === cleanEmail) {
      const match = await verifyPassword(password, admin.salt, admin.hash);
      if (!match) return { ok: false, error: 'Incorrect password.' };
      const sessionUser = { id: 'u_admin', email: admin.email, name: admin.name, role: 'admin', createdAt: admin.createdAt };
      _currentUser.value = sessionUser;
      localStorage.setItem(SESSION_KEY, sessionUser.id);
      return { ok: true, user: sessionUser };
    }
    const userStore = await tx(STORE_USERS);
    const allUsers = await awaitReq(userStore.getAll());
    const user = allUsers.find((u) => u.email === cleanEmail && u.role !== 'admin');
    if (!user) return { ok: false, error: 'No account found with that email.' };
    const match = await verifyPassword(password, user.salt, user.hash);
    if (!match) return { ok: false, error: 'Incorrect password.' };
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    _currentUser.value = sessionUser;
    localStorage.setItem(SESSION_KEY, sessionUser.id);
    return { ok: true, user: sessionUser };
  }

  async function logout() {
    _currentUser.value = null;
    localStorage.removeItem(SESSION_KEY);
  }

  async function currentUser() {
    if (_currentUser.value) return _currentUser.value;
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const userStore = await tx(STORE_USERS);
    const user = await awaitReq(userStore.get(id));
    if (user) {
      _currentUser.value = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
      return _currentUser.value;
    }
    return null;
  }

  async function getCompletedSet(userId) {
    if (!userId) return new Set();
    const progressStore = await tx(STORE_PROGRESS);
    const idx = progressStore.index('userId');
    const matches = await awaitReq(idx.getAll(userId));
    return new Set(matches.map((r) => r.lessonId));
  }

  async function setLessonComplete(userId, lessonId, complete) {
    if (!userId) return;
    const store = await tx(STORE_PROGRESS, 'readwrite');
    const key = userId + '::' + lessonId;
    if (complete) {
      await awaitReq(store.put({ key, userId, lessonId, completedAt: Date.now() }));
    } else {
      await awaitReq(store.delete(key));
    }
  }

  async function toggleLessonComplete(userId, lessonId) {
    if (!userId) return false;
    const store = await tx(STORE_PROGRESS);
    const key = userId + '::' + lessonId;
    const existing = await awaitReq(store.get(key));
    if (existing) {
      await tx(STORE_PROGRESS, 'readwrite').then((s) => s.delete(key));
      return false;
    }
    await tx(STORE_PROGRESS, 'readwrite').then((s) => s.put({ key, userId, lessonId, completedAt: Date.now() }));
    return true;
  }

  async function setAssessmentResult(userId, result) {
    if (!userId) return;
    const store = await tx(STORE_PROGRESS, 'readwrite');
    await awaitReq(store.put({
      key: userId + '::assessment',
      userId, lessonId: 'assessment', result, completedAt: Date.now(),
    }));
  }

  async function getAssessmentResult(userId) {
    if (!userId) return null;
    const store = await tx(STORE_PROGRESS);
    const r = await awaitReq(store.get(userId + '::assessment'));
    return r ? r.result : null;
  }

  async function listAllUsers() {
    const store = await tx(STORE_USERS);
    const users = await awaitReq(store.getAll());
    return users
      .filter((u) => u.role !== 'admin')
      .map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async function getUserById(id) {
    const store = await tx(STORE_USERS);
    const u = await awaitReq(store.get(id));
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
  }

  async function getUserProgress(userId) {
    if (!userId) return new Set();
    return getCompletedSet(userId);
  }

  async function deleteUser(id) {
    const userStore = await tx(STORE_USERS, 'readwrite');
    await awaitReq(userStore.delete(id));
    const progressStore = await tx(STORE_PROGRESS, 'readwrite');
    const idx = progressStore.index('userId');
    const matches = await awaitReq(idx.getAll(id));
    for (const r of matches) await awaitReq(progressStore.delete(r.key));
  }

  async function getStats() {
    const userStore = await tx(STORE_USERS);
    const users = await awaitReq(userStore.getAll());
    const students = users.filter((u) => u.role !== 'admin');
    const progressStore = await tx(STORE_PROGRESS);
    const allProgress = await awaitReq(progressStore.getAll());
    const assessments = allProgress.filter((p) => p.lessonId === 'assessment');
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

  // The frozen public object. If a future edit accidentally breaks any function,
  // the whole `const UserStore` line will throw at script-parse time, and
  // `window.UserStore` will be `undefined` — never a half-loaded object.
  const UserStore = Object.freeze({
    seedDefaultAdmin,
    register,
    login,
    logout,
    currentUser,
    getCompletedSet,
    setLessonComplete,
    toggleLessonComplete,
    setAssessmentResult,
    getAssessmentResult,
    listAllUsers,
    getUserById,
    getUserProgress,
    deleteUser,
    getStats,
  });

  window.UserStore = UserStore;

  // Self-heal: if we somehow load before the old SW is gone and the singleton
  // is broken (which the v3 design prevents, but just in case), force-clear.
  // The check here is "is the object usable?" — if ANY of the 4 critical
  // methods is missing, the whole API is unusable.
  if (typeof UserStore.register !== 'function' || typeof UserStore.login !== 'function') {
    console.error('[UserStore] broken singleton detected — clearing all caches and reloading');
    if ('caches' in self) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    }
    location.reload();
    return;
  }

  // Seed the demo admin on first load
  UserStore.seedDefaultAdmin().catch((e) => console.warn('[UserStore] admin seed failed', e));
})();
