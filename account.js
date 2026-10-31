/* Личный кабинет клиента */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const V = window.LM_VIEW, U = window.LM_UI, C = window.LONGMA;
  const esc = V.esc;
  const q = new URLSearchParams(location.search);
  let api, user, orders = [];

  function toast(text) {
    const t = $("#toast");
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (t.hidden = true), 3200);
  }

  /* ---------------- вход и регистрация ---------------- */
  document.querySelectorAll("[name=authTab]").forEach((r) =>
    r.addEventListener("change", () => {
      $("#inForm").hidden = r.value !== "in";
      $("#upForm").hidden = r.value !== "up";
    })
  );
  async function submitAuth(form, run) {
    const err = form.querySelector(".err");
    const btn = form.querySelector("button");
    err.textContent = "";
    btn.disabled = true;
    try {
      await run(form.elements);
      if (q.get("next")) location.href = q.get("next");
    } catch (e) {
      err.textContent = window.LM_DB.errorText(e, U.lang());
    }
    btn.disabled = false;
  }
  $("#inForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitAuth(e.target, (F) => api.auth.signIn(F.email.value, F.password.value));
  });
  $("#upForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const F = e.target.elements;
    const err = e.target.querySelector(".err");
    if (F.name.value.trim().length < 2) return (err.textContent = U.t("acc.eName", "Введите имя")), F.name.focus();
    if (F.telegram.value.trim().length < 2) return (err.textContent = U.t("acc.eTg", "Укажите Telegram — так менеджер свяжется с вами")), F.telegram.focus();
    if (F.password.value.length < 6) return (err.textContent = U.t("acc.ePass", "Пароль — минимум 6 символов")), F.password.focus();
    if (!F.agree.checked) return (err.textContent = U.t("acc.eAgree", "Отметьте согласие на обработку данных")), F.agree.focus();
    submitAuth(e.target, (F) =>
      api.auth.signUp({ email: F.email.value, password: F.password.value, name: F.name.value.trim(), phone: F.phone.value.trim(), telegram: F.telegram.value.trim() })
    );
  });

  /* ---------------- кабинет ---------------- */
  const seenKey = () => `lm-seen-${user.uid}`;
  function seen() {
    try {
      return JSON.parse(localStorage.getItem(seenKey()));
    } catch (e) {
      return null;
    }
  }

  /* оплата: ссылка от менеджера (RollyPay, maib, Paynet — любая) или перевод по реквизитам */
  function payBlock(o, c) {
    if (!["priced", "confirmed"].includes(o.status) || !c.hasPrice || (!o.payUrl && !C.payInfo)) return "";
    return `<div class="oc-pay">
      <div class="oc-pay-sum"><small>${esc(U.t("pay.due", "К оплате"))}</small><b>${U.lei(c.totalLei)}</b></div>
      <div class="oc-pay-acts">
        ${V.safeUrl(o.payUrl) ? `<a class="btn btn-red btn-sm" href="${esc(V.safeUrl(o.payUrl))}" target="_blank" rel="noopener noreferrer"><svg class="ic"><use href="#i-card"/></svg><span>${esc(U.t("pay.card", "Оплатить картой"))}</span></a>` : ""}
        ${o.paidClaimAt
          ? `<span class="pill pill-confirmed">${esc(U.t("pay.checking", "Оплата на проверке"))}</span>`
          : `<button class="btn btn-line btn-sm" data-paid="${esc(o.id)}">${esc(U.t("pay.done", "Я оплатил"))}</button>`}
      </div>
      ${C.payInfo ? `<p class="oc-pay-info">${esc(U.t("pay.or", "Или переводом"))}: ${esc(C.payInfo)}. ${esc(U.t("pay.ref", "В комментарии укажите номер заказа"))} <b>${esc(o.track)}</b>.</p>` : ""}
    </div>`;
  }

  function card(o, fresh) {
    const c = V.cost(o);
    // подтвердить можно, когда менеджер уже поставил цену
    const canConfirm = o.status === "priced" && c.hasPrice;
    const canCancel = o.status === "new" || o.status === "priced";
    return `<article class="ocard${fresh ? " fresh" : ""}" data-id="${esc(o.id)}">
      <header class="oc-head">
        <a class="oc-track" href="track.html?t=${encodeURIComponent(o.track)}">${esc(o.track)}</a>
        ${fresh ? `<span class="pill pill-fresh">${esc(U.t("acc.updated", "Обновлено"))}</span>` : ""}
        <span class="pill pill-${o.status}">${esc(V.name(o.status))}</span>
        <span class="oc-date">${V.date(o.createdAt)}</span>
      </header>
      ${V.progress(o)}
      <div class="oc-body">
        <div class="oc-items">
          ${V.itemsList(o)}
          <p><svg class="ic"><use href="#i-${o.method === "sea" ? "ship" : "plane"}"/></svg>${esc(V.method(o.method))}</p>
          ${o.note ? `<p class="oc-note">${esc(o.note)}</p>` : ""}
        </div>
        <dl class="oc-cost">
          <div><dt>${esc(U.t("acc.goods", "Товар"))}</dt><dd>${c.goods ? `${U.fmt(c.goods)} ¥` : "—"}</dd></div>
          <div><dt>${esc(U.t("acc.weight", "Вес"))}</dt><dd>${c.w ? `${U.fmt(c.w, 2)} ${esc(U.t("kg", "кг"))}` : "—"}</dd></div>
          <div><dt>${esc(U.t("acc.ship", "Доставка"))}</dt><dd>${c.ship ? `${U.fmt(c.ship)} ¥` : "—"}</dd></div>
          <div class="tot"><dt>${esc(U.t("acc.total", "Итого"))}</dt><dd>${c.hasPrice ? U.lei(c.totalLei) : `<span class="muted">${esc(U.t("acc.waitPrice", "менеджер считает"))}</span>`}</dd></div>
        </dl>
      </div>
      ${o.managerNote ? `<p class="oc-mgr"><svg class="ic"><use href="#i-tg"/></svg><span><b>${esc(U.t("acc.mgr", "Менеджер"))}:</b> ${esc(o.managerNote)}</span></p>` : ""}
      ${payBlock(o, c)}
      ${(o.photos || []).filter(V.safeImg).length ? `<div class="oc-photos">${o.photos.filter(V.safeImg).map((p, i) => `<button type="button" data-zoom="${i}"><img src="${esc(p)}" alt="${esc(U.t("acc.photo", "Фото товара"))} ${i + 1}"></button>`).join("")}</div>` : ""}
      ${canConfirm || canCancel ? `<div class="oc-acts">
        ${canConfirm ? `<button class="btn btn-red btn-sm" data-confirm="${esc(o.id)}"><svg class="ic"><use href="#i-check"/></svg><span>${esc(U.t("acc.confirm", "Подтвердить цену"))}</span></button>` : ""}
        ${canCancel ? `<button class="btn btn-line btn-sm" data-cancel="${esc(o.id)}">${esc(U.t("acc.cancel", "Отменить заказ"))}</button>` : ""}
      </div>` : ""}
      <details class="oc-hist"><summary>${esc(U.t("acc.history", "История заказа"))}</summary>${V.timeline(o)}</details>
    </article>`;
  }

  function render() {
    const name = (user.name || "").trim().split(" ")[0];
    $("#cabName").textContent = name || U.t("acc.h", "Личный кабинет");
    $("#cabCode").textContent = user.code || "—";
    $("#adminLink").hidden = !user.isAdmin;
    const pf = $("#profForm").elements;
    pf.name.value = user.name || "";
    pf.phone.value = user.phone || "";
    pf.telegram.value = user.telegram || "";

    const old = seen();
    const fresh = (o) => old && old[o.id] !== undefined && old[o.id] !== o.status;
    const active = orders.filter((o) => !["done", "cancelled"].includes(o.status));
    const waiting = orders.filter((o) => o.status === "priced");
    const nFresh = orders.filter(fresh).length;
    $("#kpis").innerHTML = `
      <div class="kpi"><small>${esc(U.t("acc.kActive", "В работе"))}</small><b>${active.length}</b></div>
      <div class="kpi${waiting.length ? " kpi-red" : ""}"><small>${esc(U.t("acc.kWait", "Ждут вашего ответа"))}</small><b>${waiting.length}</b></div>
      <div class="kpi"><small>${esc(U.t("acc.kDone", "Получено"))}</small><b>${orders.filter((o) => o.status === "done").length}</b></div>`;

    const banner = $("#banner");
    const newTrack = q.get("new");
    if (newTrack) {
      banner.hidden = false;
      banner.innerHTML = `<svg class="ic"><use href="#i-check"/></svg><span>${esc(U.t("acc.created", "Заказ оформлен. Номер для отслеживания"))}: <b>${esc(newTrack)}</b>. ${esc(U.t("acc.createdT", "Менеджер пришлёт цену — подтвердите её здесь."))}</span>`;
    } else if (nFresh) {
      banner.hidden = false;
      banner.innerHTML = `<svg class="ic"><use href="#i-bell"/></svg><span>${esc(U.t("acc.changed", "Статус изменился у заказов"))}: <b>${nFresh}</b></span>`;
    } else banner.hidden = true;

    $("#olist").innerHTML = orders.length
      ? orders.map((o) => card(o, fresh(o))).join("")
      : `<div class="empty"><span class="crop crop-panda"><img src="${window.LM_ROOT || ""}assets/panda.webp" alt=""></span><div><b>${esc(U.t("acc.empty", "Заказов пока нет"))}</b><p>${esc(U.t("acc.emptyT", "Пришлите ссылку на вещь — мы выкупим её и привезём."))}</p><a class="btn btn-red btn-sm" href="order.html">${esc(U.t("acc.new", "Новый заказ"))}</a></div></div>`;

    // текущие статусы считаем просмотренными — в следующий раз подсветятся только новые изменения
    try {
      localStorage.setItem(seenKey(), JSON.stringify(Object.fromEntries(orders.map((o) => [o.id, o.status]))));
    } catch (e) {}
  }

  async function load() {
    orders = await api.orders.mine();
    render();
  }

  document.addEventListener("click", async (e) => {
    const cf = e.target.closest("[data-confirm]");
    const cn = e.target.closest("[data-cancel]");
    const pd = e.target.closest("[data-paid]");
    if (pd) {
      pd.disabled = true;
      const o = orders.find((x) => x.id === pd.dataset.paid);
      try {
        // «Я оплатил» заодно подтверждает цену, если клиент сразу перешёл к оплате
        await api.orders.update(o.id, o.status === "priced" ? { status: "confirmed", paidClaimAt: Date.now() } : { paidClaimAt: Date.now() });
        toast(U.t("pay.thanks", "Спасибо! Менеджер проверит оплату и выкупит заказ"));
        await load();
      } catch (err) {
        pd.disabled = false;
        toast(window.LM_DB.errorText(err, U.lang()));
      }
    }
    const zb = e.target.closest("[data-zoom]");
    if (cf || cn) {
      if (cn && !confirm(U.t("acc.cancelQ", "Отменить этот заказ?"))) return;
      const b = cf || cn;
      b.disabled = true;
      try {
        await api.orders.update(b.dataset.confirm || b.dataset.cancel, { status: cf ? "confirmed" : "cancelled" });
        toast(cf ? U.t("acc.confirmed", "Цена подтверждена — менеджер напишет, как оплатить") : U.t("acc.cancelled", "Заказ отменён"));
        await load();
      } catch (err) {
        b.disabled = false;
        toast(window.LM_DB.errorText(err, U.lang()));
      }
    }
    if (zb) {
      const d = document.createElement("dialog");
      d.className = "lightbox";
      d.innerHTML = `<img src="${zb.querySelector("img").src}" alt=""><button class="lb-x" aria-label="Закрыть"><svg class="ic"><use href="#i-close"/></svg></button>`;
      document.body.appendChild(d);
      d.addEventListener("click", () => d.close());
      d.addEventListener("close", () => d.remove());
      d.showModal();
    }
    if (e.target.closest("#codeChip")) {
      try {
        await navigator.clipboard.writeText(user.code);
        toast(U.t("acc.copied", "Код клиента скопирован"));
      } catch (err) {}
    }
  });
  $("#outBtn").addEventListener("click", () => api.auth.signOut());
  $("#delBtn").addEventListener("click", async () => {
    if (!confirm(U.t("acc.delQ", "Удалить аккаунт? Войти в него больше не получится."))) return;
    try {
      await api.auth.deleteAccount();
      toast(U.t("acc.deleted", "Аккаунт удалён"));
    } catch (err) {
      toast(window.LM_DB.errorText(err, U.lang()));
    }
  });
  $("#profForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const F = e.target.elements;
    await api.auth.updateProfile({ name: F.name.value.trim(), phone: F.phone.value.trim(), telegram: F.telegram.value.trim() });
    toast(U.t("acc.saved", "Сохранено"));
  });
  U.onLang(() => user && render());

  window.LM_DB.ready.then((a) => {
    api = a;
    if (api.mode === "demo") {
      const h = $("#demoHint");
      h.hidden = false;
      h.textContent = U.t("acc.demo", "Демо-режим: аккаунты хранятся только в этом браузере.");
    }
    api.auth.onChange((u) => {
      user = u;
      $("#loading").hidden = true;
      $("#authView").hidden = !!u;
      $("#cabView").hidden = !u;
      U.apply();
      if (u) load().catch((e) => toast(window.LM_DB.errorText(e, U.lang())));
    });
  });
})();
