/* Longma — данные: аккаунты, заказы, трекер.
   Два режима с одинаковым API:
   • демо — всё в localStorage этого браузера (пока в config.js нет ключа Firebase);
   • Firebase — общие данные для всех клиентов (Auth + Firestore, без платных функций).
   Обычный скрипт, чтобы сайт открывался и с диска. */
(function () {
  const C = window.LONGMA;
  const now = () => Date.now();
  const rnd = (n, abc = "0123456789") => Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
  const newTrack = () => "LM" + rnd(8);
  const newCode = () => "LM-" + rnd(5, "23456789ABCDEFGHJKLMNPQRSTUVWXYZ");
  // в публичный трекер попадает только это — без имени, телефона и ссылок
  const publicPart = (o) => ({ track: o.track, uid: o.uid, status: o.status, history: o.history || [], method: o.method, createdAt: o.createdAt });

  let current = null;
  const subs = new Set();
  const emit = () => subs.forEach((f) => f(current));

  /* ================= ДЕМО ================= */
  function demo() {
    const K = { users: "lm-users", orders: "lm-orders", priv: "lm-private", session: "lm-session" };
    const read = (k, d) => {
      try {
        return JSON.parse(localStorage.getItem(k)) ?? d;
      } catch (e) {
        return d;
      }
    };
    const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    async function hash(s) {
      try {
        const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("lm:" + s));
        return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
      } catch (e) {
        let h = 0;
        for (const ch of "lm:" + s) h = (h * 31 + ch.charCodeAt(0)) | 0;
        return "h" + h;
      }
    }
    const strip = (u) => u && (({ pass, ...r }) => r)(u);
    const err = (code) => Object.assign(new Error(code), { code });

    return (async () => {
      const users = read(K.users, []);
      if (!users.some((u) => u.isAdmin)) {
        users.push({ uid: "admin", email: C.demoAdmin.email, pass: await hash(C.demoAdmin.password), name: "Администратор", code: "LM-ADMIN", isAdmin: true, createdAt: now() });
        write(K.users, users);
      }
      const sid = read(K.session, null);
      current = strip(read(K.users, []).find((u) => u.uid === sid)) || null;

      const orders = () => read(K.orders, []);
      const saveOrders = (l) => write(K.orders, l);
      return {
        mode: "demo",
        auth: {
          current: () => current,
          onChange(f) {
            subs.add(f);
            f(current);
            return () => subs.delete(f);
          },
          async signUp({ email, password, name, phone, telegram }) {
            const l = read(K.users, []);
            email = email.trim().toLowerCase();
            if (l.some((u) => u.email === email)) throw err("auth/email-already-in-use");
            const u = { uid: "u" + rnd(10), email, pass: await hash(password), name, phone, telegram, code: newCode(), isAdmin: false, createdAt: now() };
            l.push(u);
            write(K.users, l);
            write(K.session, u.uid);
            current = strip(u);
            emit();
            return current;
          },
          async signIn(email, password) {
            const u = read(K.users, []).find((x) => x.email === email.trim().toLowerCase());
            if (!u || u.pass !== (await hash(password))) throw err("auth/invalid-credential");
            write(K.session, u.uid);
            current = strip(u);
            emit();
            return current;
          },
          async signOut() {
            localStorage.removeItem(K.session);
            current = null;
            emit();
          },
          async updateProfile(patch) {
            const l = read(K.users, []);
            const u = l.find((x) => x.uid === current.uid);
            Object.assign(u, patch);
            write(K.users, l);
            current = strip(u);
            emit();
          },
        },
        orders: {
          async create(o) {
            const d = { ...o, id: "o" + rnd(10), uid: current.uid, code: current.code, track: newTrack(), status: "new", history: [{ s: "new", at: now() }], createdAt: now() };
            saveOrders([d, ...orders()]);
            return d;
          },
          mine: async () => orders().filter((o) => o.uid === current?.uid).sort((a, b) => b.createdAt - a.createdAt),
          all: async () => orders().sort((a, b) => b.createdAt - a.createdAt),
          async update(id, patch) {
            const l = orders();
            const o = l.find((x) => x.id === id);
            if (!o) throw err("not-found");
            if (patch.status && patch.status !== o.status) o.history = [...(o.history || []), { s: patch.status, at: now() }];
            Object.assign(o, patch, { updatedAt: now() });
            saveOrders(l);
            return o;
          },
          async remove(id) {
            saveOrders(orders().filter((o) => o.id !== id));
          },
          async byTrack(t) {
            const o = orders().find((x) => x.track === t.trim().toUpperCase());
            return o ? publicPart(o) : null;
          },
          getPrivate: async (id) => read(K.priv, {})[id] || {},
          async setPrivate(id, data) {
            const p = read(K.priv, {});
            p[id] = { ...p[id], ...data };
            write(K.priv, p);
          },
        },
        users: { all: async () => read(K.users, []).map(strip) },
      };
    })();
  }

  /* ================= FIREBASE ================= */
  function firebase() {
    const V = "10.12.2";
    const load = (f) =>
      new Promise((ok, bad) => {
        const s = document.createElement("script");
        s.src = `https://www.gstatic.com/firebasejs/${V}/${f}`;
        s.onload = ok;
        s.onerror = bad;
        document.head.appendChild(s);
      });
    return load("firebase-app-compat.js")
      .then(() => Promise.all([load("firebase-auth-compat.js"), load("firebase-firestore-compat.js")]))
      .then(async () => {
        const fb = window.firebase;
        fb.initializeApp(C.firebase);
        const auth = fb.auth();
        const db = fb.firestore();
        const withId = (s) => ({ ...s.data(), id: s.id });
        async function toUser(fu) {
          if (!fu) return null;
          const [p, a] = await Promise.all([db.doc(`users/${fu.uid}`).get(), db.doc(`admins/${fu.uid}`).get().catch(() => null)]);
          return { uid: fu.uid, email: fu.email, ...(p.exists ? p.data() : {}), isAdmin: !!(a && a.exists) };
        }
        await new Promise((ok) => {
          let first = true;
          auth.onAuthStateChanged(async (fu) => {
            current = await toUser(fu);
            emit();
            if (first) (first = false), ok();
          });
        });
        return {
          mode: "firebase",
          auth: {
            current: () => current,
            onChange(f) {
              subs.add(f);
              f(current);
              return () => subs.delete(f);
            },
            async signUp({ email, password, name, phone, telegram }) {
              const c = await auth.createUserWithEmailAndPassword(email.trim(), password);
              await db.doc(`users/${c.user.uid}`).set({ email: c.user.email, name, phone, telegram, code: newCode(), createdAt: now() });
              current = await toUser(c.user);
              emit();
              return current;
            },
            async signIn(email, password) {
              const c = await auth.signInWithEmailAndPassword(email.trim(), password);
              current = await toUser(c.user);
              emit();
              return current;
            },
            signOut: () => auth.signOut(),
            async updateProfile(patch) {
              await db.doc(`users/${current.uid}`).set(patch, { merge: true });
              current = { ...current, ...patch };
              emit();
            },
          },
          orders: {
            async create(o) {
              const d = { ...o, uid: current.uid, code: current.code || "", track: newTrack(), status: "new", history: [{ s: "new", at: now() }], createdAt: now() };
              const ref = await db.collection("orders").add(d);
              await db.doc(`tracks/${d.track}`).set(publicPart(d));
              return { ...d, id: ref.id };
            },
            async mine() {
              const s = await db.collection("orders").where("uid", "==", current.uid).get();
              return s.docs.map(withId).sort((a, b) => b.createdAt - a.createdAt);
            },
            async all() {
              const s = await db.collection("orders").get();
              return s.docs.map(withId).sort((a, b) => b.createdAt - a.createdAt);
            },
            async update(id, patch) {
              const ref = db.doc(`orders/${id}`);
              const o = withId(await ref.get());
              if (patch.status && patch.status !== o.status) patch = { ...patch, history: [...(o.history || []), { s: patch.status, at: now() }] };
              const next = { ...o, ...patch, updatedAt: now() };
              const { id: _, ...data } = next;
              await ref.set(data);
              await db.doc(`tracks/${next.track}`).set(publicPart(next));
              return next;
            },
            async remove(id) {
              const o = withId(await db.doc(`orders/${id}`).get());
              await db.doc(`orders/${id}`).delete();
              if (o.track) await db.doc(`tracks/${o.track}`).delete();
            },
            async byTrack(t) {
              const s = await db.doc(`tracks/${t.trim().toUpperCase()}`).get();
              return s.exists ? s.data() : null;
            },
            getPrivate: async (id) => {
              const s = await db.doc(`private/${id}`).get();
              return s.exists ? s.data() : {};
            },
            setPrivate: (id, data) => db.doc(`private/${id}`).set(data, { merge: true }),
          },
          users: {
            async all() {
              const s = await db.collection("users").get();
              return s.docs.map((d) => ({ ...d.data(), uid: d.id }));
            },
          },
        };
      });
  }

  const ERR = {
    "auth/email-already-in-use": ["Этот email уже зарегистрирован", "Acest email este deja înregistrat"],
    "auth/invalid-credential": ["Неверный email или пароль", "Email sau parolă greșită"],
    "auth/wrong-password": ["Неверный email или пароль", "Email sau parolă greșită"],
    "auth/user-not-found": ["Неверный email или пароль", "Email sau parolă greșită"],
    "auth/weak-password": ["Пароль слишком короткий — минимум 6 символов", "Parola e prea scurtă — minim 6 caractere"],
    "auth/invalid-email": ["Проверьте email", "Verifică emailul"],
    "auth/network-request-failed": ["Нет интернета — попробуйте ещё раз", "Fără internet — încearcă din nou"],
    "permission-denied": ["Нет доступа", "Fără acces"],
  };
  window.LM_DB = {
    ready: (C.firebase && C.firebase.apiKey ? firebase() : demo()).then((api) => (window.LM_DB.api = api)),
    errorText: (e, lang = "ru") => (ERR[e && e.code] || [e && e.message ? e.message : "Что-то пошло не так", "Ceva n-a mers"])[lang === "ro" ? 1 : 0],
  };
})();
