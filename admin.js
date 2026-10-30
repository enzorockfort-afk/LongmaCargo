/* Админка: заказы клиентов, цены, вес, статусы, фото, клиенты */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const V = window.LM_VIEW, U = window.LM_UI, C = window.LONGMA;
  const esc = V.esc;
  let api, orders = [], users = [], filter = "active", query = "", editing = null, photos = [];

  // фильтры собраны по тому, что нужно сделать
  const GROUPS = [
    ["active", "В работе", (o) => !["done", "cancelled"].includes(o.status)],
    ["new", "Новые — назначить цену", (o) => o.status === "new"],
    ["check", "Проверить оплату", (o) => !!o.paidClaimAt && ["priced", "confirmed"].includes(o.status)],
    ["priced", "В обработке", (o) => o.status === "priced"],
    ["buy", "Оплата и выкуп", (o) => ["confirmed", "paid", "bought"].includes(o.status)],
    ["move", "Склад и дорога", (o) => ["warehouse", "packing", "left", "shipped"].includes(o.status)],
    ["arrived", "Передать клиенту", (o) => o.status === "arrived"],
    ["done", "Получены", (o) => o.status === "done"],
    ["cancelled", "Отменены", (o) => o.status === "cancelled"],
    ["all", "Все", () => true],
  ];

  function toast(t) {
    const el = $("#toast");
    el.textContent = t;
    el.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (el.hidden = true), 2800);
  }
  const tgLink = (t) => {
    const u = String(t || "").trim().replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");
    return /^[A-Za-z0-9_]{4,32}$/.test(u) ? `https://t.me/${u}` : "";
  };
  const host = (u) => {
    try {
      return new URL(u).hostname.replace(/^(www|m)\./, "");
    } catch (e) {
      return u.slice(0, 40);
    }
  };

  /* ---------------- вход ---------------- */
  $("#admIn").addEventListener("submit", async (e) => {
    e.preventDefault();
    const F = e.target.elements;
    const err = e.target.querySelector(".err");
    err.textContent = "";
    try {
      const u = await api.auth.signIn(F.email.value, F.password.value);
      if (!u.isAdmin) err.textContent = "У этого аккаунта нет прав администратора";
    } catch (x) {
      err.textContent = window.LM_DB.errorText(x);
    }
  });

  /* ---------------- списки ---------------- */
  function kpis() {
    const cnt = (f) => orders.filter(f).length;
    const g = (k) => GROUPS.find((x) => x[0] === k)[2];
    const revenue = orders.filter((o) => o.status === "done").reduce((s, o) => s + V.cost(o).totalLei, 0);
    $("#admKpis").innerHTML = `
      <div class="kpi${cnt(g("new")) ? " kpi-red" : ""}"><small>Назначить цену</small><b>${cnt(g("new"))}</b></div>
      <div class="kpi${cnt(g("check")) ? " kpi-red" : ""}"><small>Проверить оплату</small><b>${cnt(g("check"))}</b></div>
      <div class="kpi"><small>В обработке</small><b>${cnt(g("priced"))}</b></div>
      <div class="kpi"><small>В дороге</small><b>${cnt((o) => ["left", "shipped"].includes(o.status))}</b></div>
      <div class="kpi"><small>Получено на сумму</small><b>${U.lei(revenue)}</b></div>`;
  }
  function renderOrders() {
    $("#chips").innerHTML = GROUPS.map(([k, t, f]) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${filter === k}">${t} <b>${orders.filter(f).length}</b></button>`).join("");
    const f = GROUPS.find((x) => x[0] === filter)[2];
    const ql = query.toLowerCase();
    const list = orders.filter(f).filter((o) => !ql || `${o.track} ${o.name} ${o.telegram} ${o.code}`.toLowerCase().includes(ql));
    $("#admList").innerHTML = list.length
      ? list
          .map((o) => {
            const c = V.cost(o);
            return `<button type="button" class="arow" data-open="${esc(o.id)}">
              <span class="ar-main"><b class="mono-num">${esc(o.track)}</b><small>${V.date(o.createdAt)}</small></span>
              <span class="ar-client"><b>${esc(o.name || "—")}</b><small>${esc(o.telegram || "")}${o.code ? ` · ${esc(o.code)}` : ""}</small></span>
              <span class="ar-what"><svg class="ic"><use href="#i-${o.method === "sea" ? "ship" : "plane"}"/></svg>${(o.links || []).length} ссыл. · ${+o.qty || 1} шт.</span>
              <span class="ar-sum">${c.hasPrice ? U.lei(c.totalLei) : "—"}</span>
              <span class="pill pill-${o.status}">${esc(o.paidClaimAt && o.status !== "paid" && GROUPS[2][2](o) ? "Проверить оплату" : V.name(o.status))}</span>
            </button>`;
          })
          .join("")
      : `<p class="muted adm-empty">Здесь пусто</p>`;
  }
  function renderClients() {
    $("#clientList").innerHTML = users
      .filter((u) => !u.isAdmin)
      .map((u) => {
        const mine = orders.filter((o) => o.uid === u.uid);
        const tg = tgLink(u.telegram);
        return `<div class="arow arow-static">
          <span class="ar-main"><b>${esc(u.name || "—")}</b><small>${esc(u.code || "")}</small></span>
          <span class="ar-client"><b>${tg ? `<a href="${tg}" target="_blank" rel="noopener">${esc(u.telegram)}</a>` : esc(u.telegram || "—")}</b><small>${esc(u.phone || "")} ${esc(u.email || "")}</small></span>
          <span class="ar-what">${mine.length} заказ(ов)</span>
          <span class="ar-sum">${U.lei(mine.filter((o) => o.status === "done").reduce((s, o) => s + V.cost(o).totalLei, 0))}</span>
        </div>`;
      })
      .join("") || `<p class="muted adm-empty">Клиентов пока нет</p>`;
  }
  async function load() {
    [orders, users] = await Promise.all([api.orders.all(), api.users.all().catch(() => [])]);
    kpis();
    renderOrders();
    renderClients();
  }

  /* ---------------- карточка заказа ---------------- */
  const om = $("#om"), F = $("#omForm").elements;
  $("#omStatus").innerHTML = window.LONGMA_STATUS.map(([k, t]) => `<option value="${k}">${t}</option>`).join("");
  function calc() {
    const c = V.cost({ goodsCny: F.goodsCny.value, weight: F.weight.value, method: F.method.value, finalLei: F.finalLei.value });
    $("#omCalc").innerHTML = `Товар ${U.fmt(c.goods)} ¥ + доставка ${c.w ? `${U.fmt(Math.max(1, c.w), 2)} кг × ${c.per} ¥ = ${U.fmt(c.ship)} ¥` : "— (нет веса)"} → <b>${U.lei(c.totalLei)}</b> по курсу ${U.fmt(C.rate, 2)}`;
  }
  function drawPhotos() {
    $("#omPhotos").innerHTML = photos.map((p, i) => `<span class="om-ph"><img src="${p}" alt="Фото ${i + 1}"><button type="button" data-rmph="${i}" aria-label="Удалить фото ${i + 1}"><svg class="ic"><use href="#i-close"/></svg></button></span>`).join("");
    $(".om-add").hidden = photos.length >= 4;
  }
  async function open(o) {
    editing = o;
    photos = [...(o.photos || [])];
    $("#omTitle").textContent = o.track;
    const tg = tgLink(o.telegram);
    $("#omClient").innerHTML = `<b>${esc(o.name || "—")}</b> <span>${esc(o.code || "")}</span><br><span>Telegram: ${tg ? `<a href="${tg}" target="_blank" rel="noopener">${esc(o.telegram)}</a>` : esc(o.telegram || "—")}</span>`;
    $("#omItems").innerHTML = `${(o.links || []).map((l) => `<a href="${esc(l)}" target="_blank" rel="noopener noreferrer"><svg class="ic"><use href="#i-link"/></svg>${esc(host(l))}</a>`).join("")}
      <p>${[o.size && `Размер/цвет: ${esc(o.size)}`, `Кол-во: ${+o.qty || 1}`, o.note && `Комментарий: ${esc(o.note)}`].filter(Boolean).join("<br>")}</p>`;
    F.status.value = o.status;
    F.method.value = o.method || "air";
    F.goodsCny.value = o.goodsCny ?? "";
    F.weight.value = o.weight ?? "";
    F.finalLei.value = o.finalLei ?? "";
    F.managerNote.value = o.managerNote || "";
    F.payUrl.value = o.payUrl || "";
    $("#omPaid").hidden = !o.paidClaimAt;
    $("#omPaid").innerHTML = o.paidClaimAt ? `Клиент нажал «Я оплатил» ${V.date(o.paidClaimAt)}. Проверьте поступление и поставьте статус «Оплачено».` : "";
    const p = await api.orders.getPrivate(o.id).catch(() => ({}));
    F.partnerTrack.value = p.partnerTrack || "";
    F.partnerLink.value = p.partnerLink || "";
    F.privateNote.value = p.privateNote || "";
    $("#omTg").hidden = !tg;
    $("#omTg").href = tg || "#";
    $("#omErr").textContent = "";
    drawPhotos();
    calc();
    om.showModal();
  }
  $("#omForm").addEventListener("input", calc);
  $("#omForm").addEventListener("change", calc);
  om.addEventListener("click", (e) => {
    if (e.target === om || e.target.closest("[data-close]")) om.close();
    const rm = e.target.closest("[data-rmph]");
    if (rm) photos.splice(+rm.dataset.rmph, 1), drawPhotos();
  });

  /* фото сжимаются в браузере, чтобы влезать в базу */
  function shrink(file) {
    return new Promise((ok, bad) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 900 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        ok(c.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = bad;
      img.src = URL.createObjectURL(file);
    });
  }
  $("#omFiles").addEventListener("change", async (e) => {
    for (const f of [...e.target.files].slice(0, 4 - photos.length)) {
      try {
        photos.push(await shrink(f));
      } catch (x) {
        toast(`Не удалось открыть ${f.name}`);
      }
    }
    e.target.value = "";
    drawPhotos();
  });

  const num = (v) => (v === "" || v == null ? null : +v);
  $("#omForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    if (btn) btn.disabled = true;
    try {
      await api.orders.update(editing.id, {
        status: F.status.value,
        method: F.method.value,
        goodsCny: num(F.goodsCny.value),
        weight: num(F.weight.value),
        finalLei: num(F.finalLei.value),
        managerNote: F.managerNote.value.trim(),
        payUrl: /^https:\/\//i.test(F.payUrl.value.trim()) ? F.payUrl.value.trim() : "",
        photos,
      });
      await api.orders.setPrivate(editing.id, { partnerTrack: F.partnerTrack.value.trim(), partnerLink: F.partnerLink.value.trim(), privateNote: F.privateNote.value.trim() });
      om.close();
      toast("Сохранено");
      await load();
    } catch (x) {
      $("#omErr").textContent = window.LM_DB.errorText(x);
    }
    if (btn) btn.disabled = false;
  });
  $("#omDel").addEventListener("click", async () => {
    if (!confirm(`Удалить заказ ${editing.track}? Это нельзя отменить.`)) return;
    await api.orders.remove(editing.id);
    om.close();
    toast("Заказ удалён");
    load();
  });

  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]");
    if (f) (filter = f.dataset.f), renderOrders();
    const o = e.target.closest("[data-open]");
    if (o) open(orders.find((x) => x.id === o.dataset.open));
  });
  $("#admQ").addEventListener("input", (e) => ((query = e.target.value.trim()), renderOrders()));
  $("#admRefresh").addEventListener("click", () => load().then(() => toast("Обновлено")));
  $$("[name=admTab]").forEach((r) =>
    r.addEventListener("change", () => {
      $("#ordersTab").hidden = r.value !== "orders";
      $("#clientsTab").hidden = r.value !== "clients";
    })
  );

  window.LM_DB.ready.then((a) => {
    api = a;
    if (api.mode === "demo") {
      $("#admDemo").hidden = false;
      $("#admDemo").textContent = `Демо-режим. Вход: ${C.demoAdmin.email} / ${C.demoAdmin.password}`;
    }
    api.auth.onChange((u) => {
      $("#loading").hidden = true;
      const ok = !!(u && u.isAdmin);
      $("#guard").hidden = ok;
      $("#adm").hidden = !ok;
      $("#guardMsg").textContent = u && !u.isAdmin ? "У этого аккаунта нет прав администратора. Войдите другим." : "Войдите аккаунтом администратора.";
      if (ok) load().catch((x) => toast(window.LM_DB.errorText(x)));
    });
  });
})();
