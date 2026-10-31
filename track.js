/* Трекер: статус заказа по номеру LM… — без личных данных */
(function () {
  const V = window.LM_VIEW, U = window.LM_UI;
  const out = document.getElementById("trkOut");
  const input = document.getElementById("trkIn");
  let last = null;

  function show(r) {
    if (!r) {
      out.innerHTML = `<div class="trk-empty"><span class="crop crop-panda"><img src="${window.LM_ROOT || ""}assets/panda.webp" alt=""></span>
        <div><b>${V.esc(U.t("trk.none", "Заказ не найден"))}</b><p>${V.esc(U.t("trk.noneT", "Проверьте номер. Если заказ только оформлен, номер есть в личном кабинете."))}</p></div></div>`;
      return;
    }
    out.innerHTML = `<article class="trk-card">
      <header><div><small>${V.esc(U.t("trk.num", "Заказ"))}</small><b class="mono-num">${V.esc(r.track)}</b></div>
        <span class="pill pill-${V.esc(r.status)}">${V.esc(V.name(r.status))}</span></header>
      ${V.progress(r)}
      <div class="trk-meta">
        <span><svg class="ic"><use href="#i-${r.method === "sea" ? "ship" : "plane"}"/></svg>${V.esc(V.method(r.method))}</span>
        <span>${V.esc(U.t("trk.from", "Оформлен"))} ${V.date(r.createdAt)}</span>
      </div>
      ${V.timeline(r)}
    </article>`;
  }

  async function find(t) {
    t = String(t || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!t) return input.focus();
    last = t;
    // номер всегда вида LM и 8 цифр — остальное даже не отправляем в базу
    if (!/^LM\d{8}$/.test(t)) return show(null);
    out.innerHTML = `<div class="trk-card sk"></div>`;
    try {
      const api = await window.LM_DB.ready;
      show(await api.orders.byTrack(t));
      history.replaceState(null, "", "?t=" + encodeURIComponent(t));
    } catch (e) {
      out.innerHTML = `<p class="err">${V.esc(window.LM_DB.errorText(e, U.lang()))}</p>`;
    }
  }
  document.getElementById("trkForm").addEventListener("submit", (e) => (e.preventDefault(), find(input.value)));
  U.onLang(() => last && find(last));
  const q = new URLSearchParams(location.search).get("t");
  if (q) (input.value = q), find(q);
})();
