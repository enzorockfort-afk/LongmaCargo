/* Общий вид заказа: статусы, прогресс, история, стоимость. Нужен кабинету, трекеру и админке. */
(function () {
  const C = window.LONGMA;
  const ST = window.LONGMA_STATUS;
  const U = () => window.LM_UI;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const PATH = ST.map(([k]) => k).filter((k) => k !== "cancelled");
  const name = (s) => {
    const r = ST.find(([k]) => k === s);
    return U().t("st." + s, r ? r[1] : s);
  };
  const date = (t) =>
    new Date(t).toLocaleString(U().lang() === "ro" ? "ro-RO" : "ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const method = (m) => (m === "sea" ? U().t("rates.sea", "Море") : U().t("rates.air", "Самолёт"));

  /* стоимость: товар в юанях от менеджера + доставка по весу (минимум 1 кг) */
  function cost(o) {
    const per = (C.methods[o.method] || C.methods.air).perKg;
    const goods = +o.goodsCny || 0;
    const w = +o.weight || 0;
    const ship = w ? Math.max(1, w) * per : 0;
    const totalLei = o.finalLei ? +o.finalLei : (goods + ship) * C.rate;
    return { goods, w, ship, per, totalLei, hasPrice: !!(goods || o.finalLei) };
  }

  /* полоса этапов: пройденные, текущий, будущие */
  function progress(o) {
    if (o.status === "cancelled") return `<div class="prog prog-x"><span>${esc(name("cancelled"))}</span></div>`;
    const at = PATH.indexOf(o.status);
    const pct = Math.round((Math.max(0, at) / (PATH.length - 1)) * 100);
    return `<div class="prog" style="--p:${pct}%"><i></i></div>`;
  }

  /* история: что уже было (с датами) и что ещё впереди */
  function timeline(o) {
    const done = new Map((o.history || []).map((h) => [h.s, h.at]));
    if (o.status === "cancelled")
      return `<ol class="tl">${(o.history || []).map((h) => `<li class="pass"><b>${esc(name(h.s))}</b><small>${date(h.at)}</small></li>`).join("")}</ol>`;
    const at = PATH.indexOf(o.status);
    return `<ol class="tl">${PATH.map((s, i) => {
      const cls = i < at ? "pass" : i === at ? "now" : "";
      return `<li class="${cls}"><b>${esc(name(s))}</b>${done.has(s) ? `<small>${date(done.get(s))}</small>` : ""}</li>`;
    }).join("")}</ol>`;
  }

  /* товары заказа; у старых заказов вместо товаров был список ссылок и общий размер */
  const itemsOf = (o) =>
    o.items && o.items.length ? o.items : (o.links || []).map((link, i) => ({ link, size: i === 0 ? o.size || "" : "", color: "", qty: i === 0 ? +o.qty || 1 : 1 }));
  const host = (u) => {
    try {
      return new URL(u).hostname.replace(/^(www|m)\./, "");
    } catch (e) {
      return u.length > 40 ? u.slice(0, 40) + "…" : u;
    }
  };
  function itemsList(o) {
    return `<ol class="ilist">${itemsOf(o)
      .map((it) => {
        const isUrl = /^https?:\/\//i.test(it.link);
        const name = isUrl ? `<a href="${esc(it.link)}" target="_blank" rel="noopener noreferrer"><svg class="ic"><use href="#i-link"/></svg>${esc(host(it.link))}</a>` : `<b>${esc(it.link)}</b>`;
        const meta = [it.size && `${esc(U().t("f.size1", "Размер"))}: ${esc(it.size)}`, it.color && `${esc(U().t("f.color", "Цвет"))}: ${esc(it.color)}`, `× ${+it.qty || 1}`].filter(Boolean).join(" · ");
        return `<li>${name}<small>${meta}</small></li>`;
      })
      .join("")}</ol>`;
  }

  /* фото показываем только если это настоящая картинка (сжатая в браузере), любой другой текст отбрасываем */
  const safeImg = (p) => (typeof p === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) ? p : "");
  const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u) ? u : "");

  window.LM_VIEW = { esc, name, date, method, cost, progress, timeline, itemsOf, itemsList, safeImg, safeUrl, PATH };
})();
