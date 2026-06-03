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
  const DB_VERSION = 3; // bumped — adds earnings store; v1/v2 users get auto-migration
  const STORE_USERS = 'users';
  const STORE_PROGRESS = 'progress';
  const STORE_ADMIN = 'admin';
  const STORE_EARNINGS = 'earnings';
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
        if (!db.objectStoreNames.contains(STORE_EARNINGS)) {
          db.createObjectStore(STORE_EARNINGS, { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  function tx(storeName, mode) {
    // Open a FRESH transaction for every operation. Returning a long-lived
    // object store reference causes "TransactionInactiveError" because the
    // browser auto-commits the transaction as soon as the microtask queue
    // drains after the first request fires.
    return openDB().then((db) => db.transaction(storeName, mode || 'readonly').objectStore(storeName));
  }

  function awaitReq(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Convenience: do a single read on a fresh transaction
  function read(storeName, method, ...args) {
    return tx(storeName, 'readonly').then((store) => awaitReq(store[method](...args)));
  }
  // Convenience: do a single write on a fresh transaction
  function write(storeName, method, ...args) {
    return tx(storeName, 'readwrite').then((store) => awaitReq(store[method](...args)));
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
    // Each admin lives in STORE_ADMIN keyed by its email-derived id, so multiple
    // admins can co-exist. STORE_USERS gets a parallel record so the user list
    // shows them as people, not just keys.
    //
    // Note: STORE_ADMIN is *not* the single source of truth anymore — it's now
    // an index of admin credentials keyed by their email-derived id. The login
    // function looks up by email across the index.

    // Default demo admin — kept for board review
    const demoEmail = 'admin@apertura.photo';
    const demoId = 'admin';
    const existingDemo = await read(STORE_ADMIN, 'get', demoId);
    if (!existingDemo) {
      const { salt, hash } = await hashPassword('admin123');
      await write(STORE_ADMIN, 'put', {
        id: demoId, email: demoEmail, name: 'Demo Admin',
        role: 'admin', salt, hash, createdAt: Date.now(),
      });
      const existingDemoUser = await read(STORE_USERS, 'get', 'u_' + demoId);
      if (!existingDemoUser) {
        await write(STORE_USERS, 'put', {
          id: 'u_' + demoId, email: demoEmail, name: 'Demo Admin',
          role: 'admin', createdAt: Date.now(),
        });
      }
    }

    // Site owner / real admin — jwf8666@gmail.com
    const ownerEmail = 'jwf8666@gmail.com';
    const ownerId = 'admin_jwf8666';
    const existingOwner = await read(STORE_ADMIN, 'get', ownerId);
    if (!existingOwner) {
      const { salt, hash } = await hashPassword('bonjour66');
      await write(STORE_ADMIN, 'put', {
        id: ownerId, email: ownerEmail, name: 'Site Owner',
        role: 'admin', salt, hash, createdAt: Date.now(),
      });
      const existingOwnerUser = await read(STORE_USERS, 'get', 'u_' + ownerId);
      if (!existingOwnerUser) {
        await write(STORE_USERS, 'put', {
          id: 'u_' + ownerId, email: ownerEmail, name: 'Site Owner',
          role: 'admin', createdAt: Date.now(),
        });
      }
    }
  }

  async function register({ email, name, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return { ok: false, error: 'Email and password are required.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    const allUsers = await read(STORE_USERS, 'getAll');
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
    await write(STORE_USERS, 'put', user);
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    _currentUser.value = sessionUser;
    localStorage.setItem(SESSION_KEY, id);
    return { ok: true, user: sessionUser };
  }

  async function login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return { ok: false, error: 'Email and password are required.' };
    // Scan all admin records to find a match — supports multiple admins
    const allAdmins = await read(STORE_ADMIN, 'getAll');
    const admin = allAdmins.find((a) => a.email === cleanEmail);
    if (admin) {
      const match = await verifyPassword(password, admin.salt, admin.hash);
      if (!match) return { ok: false, error: 'Incorrect password.' };
      const sessionUser = { id: 'u_' + admin.id, email: admin.email, name: admin.name, role: 'admin', createdAt: admin.createdAt };
      _currentUser.value = sessionUser;
      localStorage.setItem(SESSION_KEY, sessionUser.id);
      return { ok: true, user: sessionUser };
    }
    const allUsers = await read(STORE_USERS, 'getAll');
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
    const user = await read(STORE_USERS, 'get', id);
    if (user) {
      _currentUser.value = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
      return _currentUser.value;
    }
    return null;
  }

  async function getCompletedSet(userId) {
    if (!userId) return new Set();
    const progressStore = await tx(STORE_PROGRESS, 'readonly');
    const idx = progressStore.index('userId');
    const matches = await awaitReq(idx.getAll(userId));
    return new Set(matches.map((r) => r.lessonId));
  }

  async function setLessonComplete(userId, lessonId, complete) {
    if (!userId) return;
    const key = userId + '::' + lessonId;
    if (complete) {
      await write(STORE_PROGRESS, 'put', { key, userId, lessonId, completedAt: Date.now() });
    } else {
      await write(STORE_PROGRESS, 'delete', key);
    }
  }

  async function toggleLessonComplete(userId, lessonId) {
    if (!userId) return false;
    const key = userId + '::' + lessonId;
    const existing = await read(STORE_PROGRESS, 'get', key);
    if (existing) {
      await write(STORE_PROGRESS, 'delete', key);
      return false;
    }
    await write(STORE_PROGRESS, 'put', { key, userId, lessonId, completedAt: Date.now() });
    return true;
  }

  async function setAssessmentResult(userId, result) {
    if (!userId) return;
    await write(STORE_PROGRESS, 'put', {
      key: userId + '::assessment',
      userId, lessonId: 'assessment', result, completedAt: Date.now(),
    });
  }

  async function getAssessmentResult(userId) {
    if (!userId) return null;
    const r = await read(STORE_PROGRESS, 'get', userId + '::assessment');
    return r ? r.result : null;
  }

  async function listAllUsers() {
    const users = await read(STORE_USERS, 'getAll');
    return users
      .filter((u) => u.role !== 'admin')
      .map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async function getUserById(id) {
    const u = await read(STORE_USERS, 'get', id);
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
  }

  async function getUserProgress(userId) {
    if (!userId) return new Set();
    return getCompletedSet(userId);
  }

  async function deleteUser(id) {
    await write(STORE_USERS, 'delete', id);
    const progressStore = await tx(STORE_PROGRESS, 'readonly');
    const idx = progressStore.index('userId');
    const matches = await awaitReq(idx.getAll(id));
    for (const r of matches) {
      await write(STORE_PROGRESS, 'delete', r.key);
    }
  }

  // -------- Admin management --------
  // Multiple admins can co-exist. The first admin is the demo admin seeded on
  // first load; site owners can add additional admins via /admin.html.
  async function createAdmin({ email, name, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password || !name) return { ok: false, error: 'Name, email, and password are all required.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { ok: false, error: 'Please enter a valid email address.' };
    // Check for collision with existing admin or user
    const allAdmins = await read(STORE_ADMIN, 'getAll');
    if (allAdmins.find((a) => a.email === cleanEmail)) return { ok: false, error: 'An admin with that email already exists.' };
    const allUsers = await read(STORE_USERS, 'getAll');
    if (allUsers.find((u) => u.email === cleanEmail)) return { ok: false, error: 'A user with that email already exists.' };
    // Derive a stable id from the email local part
    const local = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '_');
    const id = 'admin_' + local;
    const { salt, hash } = await hashPassword(password);
    const now = Date.now();
    await write(STORE_ADMIN, 'put', { id, email: cleanEmail, name, role: 'admin', salt, hash, createdAt: now });
    await write(STORE_USERS, 'put', { id: 'u_' + id, email: cleanEmail, name, role: 'admin', createdAt: now });
    return { ok: true, id, email: cleanEmail };
  }
  async function listAdmins() {
    const all = await read(STORE_ADMIN, 'getAll');
    return all.map((a) => ({ id: a.id, email: a.email, name: a.name, createdAt: a.createdAt }));
  }
  async function deleteAdmin(id) {
    // Don't allow deleting the last admin
    const all = await read(STORE_ADMIN, 'getAll');
    if (all.length <= 1) return { ok: false, error: 'Cannot delete the only remaining admin.' };
    const target = all.find((a) => a.id === id);
    if (!target) return { ok: false, error: 'Admin not found.' };
    await write(STORE_ADMIN, 'delete', id);
    await write(STORE_USERS, 'delete', 'u_' + id);
    return { ok: true };
  }

  async function getStats() {
    const users = await read(STORE_USERS, 'getAll');
    const students = users.filter((u) => u.role !== 'admin');
    const allProgress = await read(STORE_PROGRESS, 'getAll');
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

  // -------- Earnings / Amazon Associates tracking --------
  // Amazon does not offer a public API for commission totals, so this is a
  // manually-maintained store. The site admin updates the figure weekly from
  // the Amazon Associates dashboard; the public widget on the gear page reads
  // the current month value and displays it.
  //
  // Storage shape (key/value):
  //   key: "current"      → { month: "2026-06", amount: 247, updatedAt: 1717... }
  //   key: "history-YYYY" → { year: 2026, months: { "01": 50, "02": 80, ... } }
  async function getEarnings() {
    const cur = await read(STORE_EARNINGS, 'get', 'current');
    if (cur) return cur;
    return { month: new Date().toISOString().slice(0, 7), amount: 0, updatedAt: null };
  }
  async function setEarnings({ month, amount }) {
    const record = { key: 'current', month, amount, updatedAt: Date.now() };
    await write(STORE_EARNINGS, 'put', record);
    // Also append to yearly history
    const year = month.slice(0, 4);
    const monthKey = month.slice(5, 7);
    const histKey = 'history-' + year;
    const hist = (await read(STORE_EARNINGS, 'get', histKey)) || { key: histKey, year: parseInt(year, 10), months: {} };
    hist.months[monthKey] = amount;
    hist.updatedAt = Date.now();
    await write(STORE_EARNINGS, 'put', hist);
    return record;
  }
  async function getEarningsHistory() {
    const all = await read(STORE_EARNINGS, 'getAll');
    return all.filter((e) => e.key && e.key.startsWith('history-')).sort((a, b) => b.year - a.year);
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
    createAdmin,
    listAdmins,
    deleteAdmin,
    getEarnings,
    setEarnings,
    getEarningsHistory,
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

  // Seed initial earnings (no month set yet — admin fills it via /admin.html)
  UserStore.getEarnings().then((rec) => {
    if (!rec.updatedAt) {
      // Don't auto-seed an amount — the admin enters the first real figure
      // from the Amazon Associates dashboard. This avoids showing fake numbers.
    }
  }).catch(() => {});
})();
