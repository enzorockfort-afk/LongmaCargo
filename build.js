/* Сборка SEO для Longma. Запуск: node build.js
   1) В каждой русской странице обновляет <title>, описание и блок SEO между <!-- seo --> и <!-- /seo -->:
      canonical, hreflang, превью для соцсетей (Open Graph) и разметку Schema.
   2) Из русских страниц делает румынские в папке ro/ — с румынским текстом прямо в HTML,
      чтобы их видел Google. Тексты берутся из i18n.js.
   3) Пересобирает sitemap.xml с обеими языковыми версиями.
   Русские страницы — исходник. После правок в них просто запустите node build.js ещё раз. */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const DIR = __dirname;
const SITE = "https://longmacargo.web.app/";
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "config.js"), "utf8") + fs.readFileSync(path.join(DIR, "i18n.js"), "utf8"), ctx);
const C = ctx.window.LONGMA;
const RO = ctx.window.LONGMA_RO;

/* заголовки и описания страниц: [русский, румынский] */
const PAGES = {
  "index.html": {
    title: ["Карго из Китая в Молдову — доставка от 1 кг | Longma", "Cargo din China în Moldova — livrare de la 1 kg | Longma"],
    desc: [
      "Выкупаем товары с Poizon, Taobao, 1688 и привозим в Молдову: самолётом 14–20 дней, морем 45–60 дней, от 1 кг. Передаём лично. Заявка за минуту.",
      "Cumpărăm produse de pe Poizon, Taobao, 1688 și le aducem în Moldova: cu avionul 14–20 de zile, pe mare 45–60, de la 1 kg. Predare personală.",
    ],
    crumb: null,
  },
  "rates.html": {
    title: ["Тарифы на доставку из Китая в Молдову | Longma", "Tarife livrare din China în Moldova | Longma"],
    desc: [
      "Доставка из Китая в Молдову: самолётом 120 ¥ за кг (14–20 дней), морем 50 ¥ за кг (45–60 дней), от 1 кг. Калькулятор стоимости посылки.",
      "Livrare din China în Moldova: cu avionul 120 ¥ pe kg (14–20 zile), pe mare 50 ¥ pe kg (45–60 zile), de la 1 kg. Calculator de cost.",
    ],
    crumb: ["Тарифы", "Tarife"],
  },
  "guide.html": {
    title: ["Как заказать с Poizon, Taobao и 1688 в Молдову | Longma", "Cum comanzi de pe Poizon, Taobao și 1688 în Moldova | Longma"],
    desc: [
      "Пошаговая инструкция: как найти вещь на Poizon, Taobao, 1688 или Pinduoduo, скопировать ссылку и заказать доставку в Молдову без китайского аккаунта.",
      "Instrucțiune pas cu pas: cum găsești produsul pe Poizon, Taobao, 1688 sau Pinduoduo, copiezi linkul și comanzi livrarea în Moldova fără cont chinezesc.",
    ],
    crumb: ["Как заказать", "Cum comanzi"],
  },
  "order.html": {
    title: ["Заявка на выкуп и доставку из Китая | Longma", "Cerere de cumpărare și livrare din China | Longma"],
    desc: [
      "Пришлите ссылки на товары из Китая — выкупим сами и привезём в Молдову. Размер, цвет и количество для каждого товара.",
      "Trimite linkurile produselor din China — le cumpărăm noi și le aducem în Moldova. Mărime, culoare și cantitate pentru fiecare produs.",
    ],
    crumb: ["Заявка", "Cerere"],
  },
  "faq.html": {
    title: ["Вопросы о доставке из Китая в Молдову | Longma", "Întrebări despre livrarea din China în Moldova | Longma"],
    desc: [
      "Ответы о доставке из Китая в Молдову: как считается вес, минимум 1 кг, как получить посылку, брак, что нельзя отправить.",
      "Răspunsuri despre livrarea din China în Moldova: cum se calculează greutatea, minim 1 kg, cum primești coletul, defecte, ce nu se trimite.",
    ],
    crumb: ["Вопросы", "Întrebări"],
  },
  "track.html": {
    title: ["Отследить посылку из Китая | Longma", "Urmărește coletul din China | Longma"],
    desc: [
      "Введите номер заказа Longma и узнайте, где посылка из Китая: выкуп, склад, дорога, прибытие в Молдову.",
      "Introdu numărul comenzii Longma și află unde e coletul din China: cumpărare, depozit, drum, sosire în Moldova.",
    ],
    crumb: ["Отследить", "Urmărire"],
  },
  "account.html": {
    title: ["Личный кабинет | Longma", "Contul personal | Longma"],
    desc: ["Заказы, статусы и оплата в личном кабинете Longma.", "Comenzi, statusuri și plată în contul personal Longma."],
    crumb: ["Личный кабинет", "Contul personal"],
    noindex: true,
  },
  "privacy.html": {
    title: ["Политика обработки персональных данных | Longma", "Politica de prelucrare a datelor | Longma"],
    desc: [
      "Какие данные собирает Longma, зачем, кому передаёт и как их удалить. По Закону Республики Молдова № 195/2024.",
      "Ce date colectează Longma, de ce, cui le transmite și cum le ștergi. Conform Legii Republicii Moldova nr. 195/2024.",
    ],
    crumb: ["Персональные данные", "Date personale"],
  },
  "terms.html": {
    title: ["Условия сервиса | Longma", "Condițiile serviciului | Longma"],
    desc: [
      "Условия выкупа и доставки товаров из Китая в Молдову: заказ, цена, сроки, ответственность, споры.",
      "Condițiile de cumpărare și livrare a produselor din China în Moldova: comandă, preț, termene, răspundere, litigii.",
    ],
    crumb: ["Условия", "Condiții"],
  },
  "returns.html": {
    title: ["Отмена, возврат и претензии | Longma", "Anulare, retur și reclamații | Longma"],
    desc: [
      "Как отменить заказ, вернуть деньги или подать претензию, если товар из Китая пришёл с браком.",
      "Cum anulezi comanda, primești banii înapoi sau depui o reclamație dacă produsul din China are defect.",
    ],
    crumb: ["Возврат и претензии", "Retur și reclamații"],
  },
  "cookies.html": {
    title: ["Политика куки | Longma", "Politica cookie | Longma"],
    desc: ["Какие куки использует сайт Longma и зачем. Только необходимые, без рекламы.", "Ce cookie-uri folosește site-ul Longma și de ce. Doar necesare, fără publicitate."],
    crumb: ["Куки", "Cookie"],
  },
};

const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const json = (o) => JSON.stringify(o, null, 0).replace(/</g, "\\u003c");
const urlOf = (file, ro) => SITE + (ro ? "ro/" : "") + (file === "index.html" ? "" : file);

/* разметка Schema для страницы */
function schema(file, ro, html) {
  const L = ro ? 1 : 0;
  const org = {
    "@type": "Organization",
    "@id": SITE + "#org",
    name: "Longma Cargo",
    url: SITE,
    logo: SITE + "assets/app-icon.webp",
    sameAs: [`https://t.me/${C.telegram}`],
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", url: `https://t.me/${C.telegram}`, availableLanguage: ["ru", "ro"] },
  };
  const offer = (m, name) => ({
    "@type": "Offer",
    name,
    priceSpecification: { "@type": "UnitPriceSpecification", price: C.methods[m].perKg, priceCurrency: "CNY", unitCode: "KGM", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "KGM" } },
  });
  const service = {
    "@type": "Service",
    name: ro ? "Livrare de produse din China în Moldova" : "Доставка товаров из Китая в Молдову",
    serviceType: ro ? "Cargo din China" : "Карго из Китая",
    provider: { "@id": SITE + "#org" },
    areaServed: { "@type": "Country", name: ro ? "Moldova" : "Молдова" },
    offers: [
      offer("air", ro ? `Avion, ${C.methods.air.days} zile` : `Самолёт, ${C.methods.air.days} дней`),
      offer("sea", ro ? `Maritim, ${C.methods.sea.days} zile` : `Море, ${C.methods.sea.days} дней`),
    ],
  };
  const graph = [];
  if (file === "index.html") graph.push(org, { "@type": "WebSite", name: "Longma Cargo", url: SITE, inLanguage: ro ? "ro" : "ru", publisher: { "@id": SITE + "#org" } }, service);
  if (file === "rates.html") graph.push(service);
  if (file === "faq.html") {
    const qa = [...html.matchAll(/<summary data-i="(q\.\d+)">([^<]+)<\/summary><p data-i="(a\.\d+)">([^<]+)<\/p>/g)];
    graph.push({
      "@type": "FAQPage",
      mainEntity: qa.map(([, qk, q, ak, a]) => ({
        "@type": "Question",
        name: ro ? RO[qk] || q : q,
        acceptedAnswer: { "@type": "Answer", text: ro ? RO[ak] || a : a },
      })),
    });
  }
  const crumb = PAGES[file].crumb;
  if (crumb)
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: ro ? "Acasă" : "Главная", item: urlOf("index.html", ro) },
        { "@type": "ListItem", position: 2, name: crumb[L], item: urlOf(file, ro) },
      ],
    });
  return graph.length ? `\n  <script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": graph })}</script>` : "";
}

/* блок SEO в <head> */
function seoBlock(file, ro, html) {
  const p = PAGES[file], L = ro ? 1 : 0;
  const img = SITE + "assets/logo-wide.webp";
  return `<!-- seo: собирается командой node build.js, вручную не править -->
  <link rel="canonical" href="${urlOf(file, ro)}">
  <link rel="alternate" hreflang="ru" href="${urlOf(file, false)}">
  <link rel="alternate" hreflang="ro" href="${urlOf(file, true)}">
  <link rel="alternate" hreflang="x-default" href="${urlOf(file, false)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Longma Cargo">
  <meta property="og:locale" content="${ro ? "ro_MD" : "ru_MD"}">
  <meta property="og:locale:alternate" content="${ro ? "ru_MD" : "ro_MD"}">
  <meta property="og:title" content="${escAttr(p.title[L])}">
  <meta property="og:description" content="${escAttr(p.desc[L])}">
  <meta property="og:url" content="${urlOf(file, ro)}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:type" content="image/webp">
  <meta property="og:image:width" content="1774">
  <meta property="og:image:height" content="887">
  <meta property="og:image:alt" content="Longma Cargo">
  <meta name="twitter:card" content="summary_large_image">${schema(file, ro, html)}
  <!-- /seo -->`;
}

/* общая часть: заголовок, описание, robots и блок SEO */
function withHead(html, file, ro) {
  const p = PAGES[file], L = ro ? 1 : 0;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escText(p.title[L])}</title>`);
  html = html.replace(/\s*<meta name="description"[^>]*>/, "");
  html = html.replace(/(<\/title>)/, `$1\n  <meta name="description" content="${escAttr(p.desc[L])}">`);
  html = html.replace(/\s*<!-- seo[\s\S]*?<!-- \/seo -->/, "");
  html = html.replace(/(\s*<\/head>)/, `\n  ${seoBlock(file, ro, html)}$1`);
  return html;
}

/* румынская копия страницы */
function toRo(html, file) {
  let s = html.replace('<html lang="ru">', '<html lang="ro">');
  s = s.replace(/<body([^>]*)>/, (m, a) => `<body${a.replace(/\s*data-(lang|root)="[^"]*"/g, "")} data-lang="ro" data-root="../">`);
  // пути к общим файлам — на уровень выше
  s = s.replace(/(href|src)="(?!https?:|#|\.\.\/|mailto:|tel:)((?:assets\/|[\w-]+\.(?:css|js))[^"]*)"/g, '$1="../$2"');
  s = s.replace(/href="admin\.html"/g, 'href="../admin.html"');
  // текст элементов с data-i (без вложенных тегов) — по-румынски
  s = s.replace(/(<([a-z0-9]+)\b[^>]*\bdata-i="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, text, close) => (RO[key] ? open + escText(RO[key]) + close : m));
  s = s.replace(/<[a-z]+\b[^>]*\bdata-ph="([^"]+)"[^>]*>/g, (tag, key) => (RO[key] ? tag.replace(/placeholder="[^"]*"/, `placeholder="${escAttr(RO[key])}"`) : tag));
  return withHead(s, file, true);
}

fs.mkdirSync(path.join(DIR, "ro"), { recursive: true });
for (const file of Object.keys(PAGES)) {
  const src = path.join(DIR, file);
  let html = withHead(fs.readFileSync(src, "utf8"), file, false);
  if (PAGES[file].noindex && !/name="robots"/.test(html)) html = html.replace(/(<\/title>)/, '$1\n  <meta name="robots" content="noindex">');
  fs.writeFileSync(src, html);
  fs.writeFileSync(path.join(DIR, "ro", file), toRo(html, file));
}

/* sitemap с обеими языковыми версиями */
const today = new Date().toISOString().slice(0, 10);
const prio = { "index.html": "1.0", "rates.html": "0.9", "guide.html": "0.8", "order.html": "0.8", "faq.html": "0.7", "track.html": "0.5" };
const urls = Object.keys(PAGES)
  .filter((f) => !PAGES[f].noindex)
  .flatMap((f) =>
    [false, true].map(
      (ro) => `  <url>
    <loc>${urlOf(f, ro)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${prio[f] || "0.3"}</priority>
    <xhtml:link rel="alternate" hreflang="ru" href="${urlOf(f, false)}"/>
    <xhtml:link rel="alternate" hreflang="ro" href="${urlOf(f, true)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf(f, false)}"/>
  </url>`
    )
  );
fs.writeFileSync(
  path.join(DIR, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`
);
console.log(`Готово: ${Object.keys(PAGES).length} русских страниц обновлено, столько же румынских в ro/, sitemap: ${urls.length} адресов`);
