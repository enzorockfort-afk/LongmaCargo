/* Longma — общий скрипт всех страниц.
   Обычный скрипт (не модуль), чтобы сайт работал и при открытии файла с диска. */
(function () {
  const C = window.LONGMA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const tgUrl = (text) => `https://t.me/${C.telegram}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  /* ---------------- значки: один набор на все страницы ---------------- */
  const ICONS = {
    plane: '<path d="M10.2 13.8 3.5 11.5l1.3-1.3 7.3.9 4.8-4.8a1.9 1.9 0 0 1 2.7 2.7l-4.8 4.8.9 7.3-1.3 1.3-2.3-6.7-3.4 3.4.3 2.4-1 1-1.6-3.2-3.2-1.6 1-1 2.4.3z"/>',
    ship: '<path d="M4 15.5 3 11h18l-1 4.5"/><path d="M6 11V7h8l3 4M9 7V4.5h3V7"/><path d="M2.5 19.5c1.5 0 1.9-1 3.2-1s1.7 1 3.2 1 1.9-1 3.1-1 1.7 1 3.2 1 1.9-1 3.2-1 1.6 1 3.1 1"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
    bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    box: '<path d="M12 3 20.5 7.5v9L12 21l-8.5-4.5v-9z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.5 4.6"/>',
    hand: '<path d="M3 13.5 7 10l3.5 1.5h3a1.5 1.5 0 0 1 0 3H10"/><path d="M13.5 14.5 18 12a1.6 1.6 0 0 1 2 2.4L14.5 19H7.5L3 17.5"/><path d="M14 3.5 17.5 6 14 8.5"/><path d="M17.5 6H10"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.7 2.7L16.2 9.4"/>',
    scale: '<path d="M5 20h14l-1.5-11h-11z"/><circle cx="12" cy="5.5" r="2.5"/><path d="M10 14.5h4"/>',
    camera: '<path d="M3.5 8.5A2 2 0 0 1 5.5 6.5H8l1.5-2h5L16 6.5h2.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
    tg: '<path d="M21 4.5 3 11.6l6.2 2.1 2.3 6.6 3.4-4.4 4.7 3.6z"/><path d="m9.2 13.7 9.3-6.7"/>',
    arrow: '<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>',
    user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M14 4.5h4.5v15H14M10 8l-4 4 4 4M6 12h10"/>',
    photo: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 17 5-4.5 4 3.5 2.5-2 4.5 3.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.8" r=".6"/>',
  };
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.entries(ICONS)
      .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`)
      .join("")}</defs></svg>`
  );

  /* ---------------- шапка, подвал, кнопка Telegram ---------------- */
  const NAV = [
    ["index.html", "home", "nav.home", "Главная"],
    ["rates.html", "rates", "nav.rates", "Тарифы"],
    ["guide.html", "guide", "nav.guide", "Как заказать"],
    ["faq.html", "faq", "nav.faq", "Вопросы"],
    ["track.html", "track", "nav.track", "Отследить"],
  ];
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<a class="skip" href="#main" data-i="skip">Перейти к содержимому</a>
  <header class="hdr" id="hdr">
    <a class="brand" href="index.html" aria-label="Longma Cargo — главная"><span class="crop crop-wide"><img src="assets/logo-wide.webp" alt="Longma Cargo" width="1774" height="887"></span></a>
    <nav class="nav" id="nav" aria-label="Разделы сайта">
      ${NAV.map(([h, k, i, t]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ""} data-i="${i}">${t}</a>`).join("")}
      <a class="nav-tg" href="${tgUrl()}" target="_blank" rel="noopener"><svg class="ic"><use href="#i-tg"/></svg>@${C.telegram}</a>
    </nav>
    <div class="hdr-r">
      <button class="lang" id="lang" type="button" aria-label="Limba română">RO</button>
      <a class="acc-btn${page === "account" ? " on" : ""}" id="accBtn" href="account.html" aria-label="Личный кабинет"><svg class="ic"><use href="#i-user"/></svg></a>
      <a class="btn btn-red btn-sm hide-s" href="order.html" data-i="cta">Оставить заявку</a>
      <button class="burger" id="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
    </div>
  </header>`
  );
  document.body.insertAdjacentHTML(
    "beforeend",
    `<footer class="ftr">
    <div class="ftr-in">
      <div class="ftr-brand"><span class="crop crop-app ftr-logo"><img src="assets/app-icon.webp" alt="" width="1254" height="1254"></span>
        <div><b>Longma Cargo</b><p data-i="ftr.t">Доставка из Китая в Молдову</p></div></div>
      <nav class="ftr-nav" aria-label="Разделы">${NAV.map(([h, , i, t]) => `<a href="${h}" data-i="${i}">${t}</a>`).join("")}<a href="order.html" data-i="nav.order">Заявка</a></nav>
      <a class="ftr-tg" href="${tgUrl()}" target="_blank" rel="noopener"><svg class="ic"><use href="#i-tg"/></svg><span><small data-i="ftr.mgr">Менеджер в Telegram</small>@${C.telegram}</span></a>
      <p class="ftr-c">© ${new Date().getFullYear()} Longma</p>
    </div>
  </footer>
  <a class="tg-fab" href="${tgUrl()}" target="_blank" rel="noopener" aria-label="Написать менеджеру в Telegram"><svg class="ic"><use href="#i-tg"/></svg><span data-i="fab">Написать менеджеру</span></a>`
  );

  const hdr = $("#hdr");
  addEventListener("scroll", () => hdr.classList.toggle("scrolled", scrollY > 8), { passive: true });
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });
  addEventListener("keydown", (e) => e.key === "Escape" && nav.classList.contains("open") && burger.click());

  /* ---------------- язык: русский текст берётся из страницы, румынский — из словаря ---------------- */
  const RO = window.LONGMA_RO || {};
  const MSG = {
    ru: { lei: "≈ {n} лей", rate: "≈ {n} лей за кг по курсу {r}", err: "Заполните ссылки, имя и Telegram", sent: "Заявка скопирована и открыта в Telegram — нажмите «Отправить»",
          air: "Самолёт", sea: "Море", order: "Заявка Longma", links: "Ссылки", size: "Размер/цвет", qty: "Кол-во", method: "Доставка", name: "Имя", note: "Комментарий",
          days: "дней", forW: "за {w} кг", day: "день {d} в пути", km: "{n} км", hello: "Здравствуйте! Вопрос по доставке из Китая" },
    ro: { lei: "≈ {n} lei", rate: "≈ {n} lei pe kg la cursul {r}", err: "Completează linkurile, numele și Telegram", sent: "Cererea a fost copiată și deschisă în Telegram — apasă «Trimite»",
          air: "Avion", sea: "Maritim", order: "Cerere Longma", links: "Linkuri", size: "Mărime/culoare", qty: "Cantitate", method: "Livrare", name: "Nume", note: "Comentariu",
          days: "zile", forW: "pentru {w} kg", day: "ziua {d} pe drum", km: "{n} km", hello: "Bună ziua! O întrebare despre livrarea din China" },
  };
  let lang = "ru";
  try {
    lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("lm-lang") || ((navigator.language || "").startsWith("ro") ? "ro" : "ru");
  } catch (e) {}
  if (lang !== "ro") lang = "ru";
  const m = (k, v = {}) => MSG[lang][k].replace(/\{(\w+)\}/g, (_, x) => v[x]);
  const fmt = (n, d = 0) => new Intl.NumberFormat(lang === "ro" ? "ro-RO" : "ru-RU", { maximumFractionDigits: d }).format(n);
  const titleRu = document.title;

  $$("[data-i]").forEach((el) => (el.dataset.ru = el.textContent));
  $$("[data-ph]").forEach((el) => (el.dataset.ruPh = el.placeholder));
  const listeners = [];
  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i]").forEach((el) => (el.textContent = lang === "ro" ? RO[el.dataset.i] ?? el.dataset.ru : el.dataset.ru));
    $$("[data-ph]").forEach((el) => (el.placeholder = lang === "ro" ? RO[el.dataset.ph] ?? el.dataset.ruPh : el.dataset.ruPh));
    $("#lang").textContent = lang === "ro" ? "RU" : "RO";
    $("#lang").setAttribute("aria-label", lang === "ro" ? "Русский язык" : "Limba română");
    document.title = lang === "ro" && RO["title." + page] ? RO["title." + page] : titleRu;
    $$("[data-lei]").forEach((el) => (el.textContent = m("rate", { n: fmt(+el.dataset.lei * C.rate), r: fmt(C.rate, 2) })));
    $$(".tg-fab, .ftr-tg, .nav-tg").forEach((a) => (a.href = tgUrl(m("hello"))));
    listeners.forEach((f) => f());
  }
  /* для страниц кабинета, трекера и админки: перевод текста, который они рисуют сами */
  window.LM_UI = {
    lang: () => lang,
    t: (key, ru) => (lang === "ro" && RO[key] ? RO[key] : ru),
    fmt,
    lei: (n) => m("lei", { n: fmt(n) }),
    tgUrl,
    onLang: (f) => listeners.push(f),
    apply(root = document) {
      $$("[data-i]", root).forEach((el) => {
        if (el.dataset.ru === undefined) el.dataset.ru = el.textContent;
        el.textContent = lang === "ro" ? RO[el.dataset.i] ?? el.dataset.ru : el.dataset.ru;
      });
      $$("[data-ph]", root).forEach((el) => {
        if (el.dataset.ruPh === undefined) el.dataset.ruPh = el.placeholder;
        el.placeholder = lang === "ro" ? RO[el.dataset.ph] ?? el.dataset.ruPh : el.dataset.ruPh;
      });
    },
  };
  $("#lang").addEventListener("click", () => {
    lang = lang === "ro" ? "ru" : "ro";
    try {
      localStorage.setItem("lm-lang", lang);
    } catch (e) {}
    applyLang();
  });

  /* ---------------- накладная: посылка едет по маршруту ---------------- */
  const bill = $("#bill");
  if (bill) {
    const scene = $("#scene");
    const run = $("#run"), glow = $("#runGlow"), veh = $("#veh"), vehIc = $("#vehIc");
    const trail = $$(".trail circle");
    const steps = $$("#track li");
    const PATHS = { air: $("#pAir"), sea: $("#pSea") };
    let mode = "air";
    let t0 = performance.now();
    let k = 0;

    function setMode(next) {
      mode = next;
      const d = PATHS[mode].getAttribute("d");
      run.setAttribute("d", d);
      glow.setAttribute("d", d);
      scene.classList.toggle("is-sea", mode === "sea");
      vehIc.setAttribute("href", mode === "air" ? "#i-plane" : "#i-ship");
      const c = C.methods[mode];
      [["bDays", c.days], ["bRate", `${c.perKg} ¥`]].forEach(([id, v]) => {
        const el = $("#" + id);
        el.textContent = v;
        el.classList.remove("flip");
        void el.offsetWidth;
        el.classList.add("flip");
      });
      t0 = performance.now();
      draw(performance.now());
    }
    $$("[name=mode]").forEach((r) => r.addEventListener("change", () => setMode(r.value)));

    const CYCLE = 8000;
    function draw(now) {
      const p = PATHS[mode];
      const len = p.getTotalLength();
      k = ((now - t0) % CYCLE) / CYCLE;
      // 0–20%: выкуп и склад, 20–85%: в пути, 85–100%: встреча
      const mv = Math.min(1, Math.max(0, (k - 0.2) / 0.65));
      const e = mv < 0.5 ? 4 * mv ** 3 : 1 - (-2 * mv + 2) ** 3 / 2;
      const at = len * e;
      const pt = p.getPointAtLength(at);
      const a = p.getPointAtLength(Math.min(len, at + 2)), b = p.getPointAtLength(Math.max(0, at - 2));
      const deg = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI;
      veh.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      // значок самолёта нарисован носом вправо-вверх (−45°); корабль только разворачиваем по ходу
      vehIc.setAttribute("transform", mode === "air" ? `rotate(${(deg + 45).toFixed(1)})` : a.x < b.x ? "scale(-1 1)" : "");
      [run, glow].forEach((r) => {
        r.style.strokeDasharray = `${len} ${len}`;
        r.style.strokeDashoffset = `${len - at}`;
      });
      trail.forEach((c, i) => {
        const q = p.getPointAtLength(Math.max(0, at - (i + 1) * 9));
        c.setAttribute("cx", q.x.toFixed(1));
        c.setAttribute("cy", q.y.toFixed(1));
        c.style.opacity = mv > 0 && mv < 1 ? 0.55 - i * 0.1 : 0;
      });
      const stage = k < 0.1 ? 0 : k < 0.2 ? 1 : k < 0.85 ? 2 : 3;
      steps.forEach((li, i) => {
        li.classList.toggle("done", i < stage);
        li.classList.toggle("now", i === stage);
      });
      const c = C.methods[mode];
      $("#hudKm").textContent = m("km", { n: fmt(Math.round(C.distance * e)) });
      $("#hudDay").textContent = m("day", { d: Math.max(1, Math.round(c.maxDays * e)), m: c.days });
      scene.classList.toggle("arrived", k >= 0.85);
    }
    function loop(now) {
      draw(now);
      requestAnimationFrame(loop);
    }
    if (reduced) {
      t0 = performance.now() - CYCLE * 0.55;
      draw(performance.now());
    } else requestAnimationFrame(loop);
    listeners.push(() => draw(performance.now()));
  }

  /* ---------------- калькулятор: минимум 1 кг ---------------- */
  const calcForm = $("#calc");
  if (calcForm) {
    const kg = $("#kg");
    const calc = () => {
      const method = $("[name=m]:checked", calcForm).value;
      const raw = Math.max(0, +String(kg.value).replace(",", ".") || 0);
      const w = Math.max(1, raw);
      const c = C.methods[method];
      const cny = w * c.perKg;
      $("#outCny").textContent = `${fmt(cny)} ¥`;
      $("#outLei").textContent = m("lei", { n: fmt(cny * C.rate) });
      $("#outDays").textContent = `${c.days} ${m("days")}`;
      $("#outW").textContent = m("forW", { w: fmt(w, 1) });
      $$(".presets button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.w === raw)));
    };
    calcForm.addEventListener("input", calc);
    calcForm.addEventListener("change", calc);
    $$("[data-kg]").forEach((b) =>
      b.addEventListener("click", () => {
        kg.value = Math.max(1, Math.round(((+String(kg.value).replace(",", ".") || 1) + +b.dataset.kg) * 10) / 10);
        calc();
      })
    );
    $$(".presets button").forEach((b) => b.addEventListener("click", () => ((kg.value = b.dataset.w), calc())));
    kg.addEventListener("blur", () => +kg.value < 1 && ((kg.value = 1), calc()));
    listeners.push(calc);
  }

  /* ---------------- заявка: текст уходит в чат менеджера ---------------- */
  const form = $("#orderForm");
  if (form) {
    const F = form.elements;
    const q = new URLSearchParams(location.search);
    if (q.get("m") === "sea") F.method.value = "sea";
    form.addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"));

    /* товары: у каждого своя ссылка, размер, цвет и количество; «+» добавляет ещё */
    const list = $("#items");
    const itemRow = () =>
      `<li class="item">
        <span class="item-n"></span>
        <label class="field item-link"><span data-i="f.link">Ссылка на товар</span><input name="iLink" inputmode="url" autocomplete="off" data-ph="f.linkPh" placeholder="https://… или название"></label>
        <label class="field"><span data-i="f.size1">Размер</span><input name="iSize" data-ph="f.size1Ph" placeholder="42, M"></label>
        <label class="field"><span data-i="f.color">Цвет</span><input name="iColor" data-ph="f.colorPh" placeholder="чёрный"></label>
        <label class="field item-qty"><span data-i="f.qty">Количество</span>
          <span class="qty"><button type="button" data-step="-1" aria-label="Меньше">−</button><input name="iQty" type="number" inputmode="numeric" min="1" value="1"><button type="button" data-step="1" aria-label="Больше">+</button></span></label>
        <button type="button" class="item-x" data-rm aria-label="Убрать товар"><svg class="ic"><use href="#i-close"/></svg></button>
      </li>`;
    const renumber = () =>
      $$(".item", list).forEach((li, i, all) => {
        $(".item-n", li).textContent = i + 1;
        $(".item-x", li).hidden = all.length < 2;
      });
    function addItem(focus) {
      list.insertAdjacentHTML("beforeend", itemRow());
      window.LM_UI.apply(list.lastElementChild);
      renumber();
      if (focus) $("[name=iLink]", list.lastElementChild).focus();
    }
    addItem(false);
    $("#addItem").addEventListener("click", () => addItem(true));
    list.addEventListener("click", (e) => {
      const st = e.target.closest("[data-step]");
      if (st) {
        const inp = $("[name=iQty]", st.closest(".qty"));
        inp.value = Math.max(1, (+inp.value || 1) + +st.dataset.step);
      }
      if (e.target.closest("[data-rm]")) e.target.closest(".item").remove(), renumber();
    });
    const readItems = () =>
      $$(".item", list).map((li) => ({
        link: $("[name=iLink]", li).value.trim(),
        size: $("[name=iSize]", li).value.trim(),
        color: $("[name=iColor]", li).value.trim(),
        qty: Math.max(1, Math.round(+$("[name=iQty]", li).value || 1)),
      }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (n) => String(F[n].value || "").trim();
      // пустые строки товаров не считаются; хотя бы один товар обязателен
      const items = readItems().filter((it) => it.link);
      const bad = ["name", "tg"].filter((n) => v(n).length < 2);
      if (!items.length) $("[name=iLink]", list).setAttribute("aria-invalid", "true");
      if (bad.length || !items.length) {
        bad.forEach((n) => F[n].setAttribute("aria-invalid", "true"));
        (items.length ? F[bad[0]] : $("[name=iLink]", list)).focus();
        $("#err").textContent = m("err");
        return;
      }
      const method = F.method.value;
      const text = [
        m("order"),
        "",
        ...items.map((it, i) => `${i + 1}. ${it.link}${[it.size, it.color].filter(Boolean).length ? ` — ${[it.size, it.color].filter(Boolean).join(", ")}` : ""} × ${it.qty}`),
        "",
        `${m("method")}: ${m(method)} (${C.methods[method].days} ${m("days")})`,
        `${m("name")}: ${v("name")}`,
        `Telegram: ${v("tg")}`,
        v("note") ? `${m("note")}: ${v("note")}` : null,
      ]
        .filter((x) => x !== null)
        .join("\n");
      $("#err").textContent = "";
      const api = window.LM_DB && window.LM_DB.api;
      const user = api && api.auth.current();
      // клиент вошёл в кабинет — заказ сохраняется на сайте и получает трек-номер
      if (user) {
        const btn = form.querySelector("button:not([type=button])");
        btn.disabled = true;
        api.orders
          .create({
            items,
            // для совместимости со старыми заказами
            links: items.map((it) => it.link),
            qty: items.reduce((s, it) => s + it.qty, 0),
            method,
            note: v("note"),
            name: v("name"),
            telegram: v("tg"),
          })
          .then((o) => {
            if (!user.telegram || !user.name) api.auth.updateProfile({ name: user.name || v("name"), telegram: user.telegram || v("tg") }).catch(() => {});
            location.href = `account.html?new=${o.track}`;
          })
          .catch((err) => {
            btn.disabled = false;
            $("#err").textContent = window.LM_DB.errorText(err, lang);
          });
        return;
      }
      try {
        navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
      } catch (err) {}
      $("#ok").textContent = m("sent");
      window.open(tgUrl(text), "_blank", "noopener");
    });
  }

  /* ---------------- аккаунт: кнопка кабинета и заполнение заявки ---------------- */
  if (window.LM_DB) {
    window.LM_DB.ready.then((api) =>
      api.auth.onChange((u) => {
        const b = $("#accBtn");
        b.classList.toggle("in", !!u);
        b.innerHTML = u ? `<span>${(u.name || u.email || "?").trim()[0].toUpperCase()}</span>` : '<svg class="ic"><use href="#i-user"/></svg>';
        $$(".when-out").forEach((el) => (el.hidden = !!u));
        $$(".when-in").forEach((el) => (el.hidden = !u));
        if (u && form) {
          if (!form.elements.name.value) form.elements.name.value = u.name || "";
          if (!form.elements.tg.value) form.elements.tg.value = u.telegram || "";
        }
      })
    );
  }

  applyLang();
})();
