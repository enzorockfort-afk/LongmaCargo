/* Юридические документы Longma: политика данных, условия, куки, возврат и претензии.
   Тексты на русском и румынском; реквизиты берутся из config.js → operator. */
(function () {
  const C = window.LONGMA, U = window.LM_UI;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const op = C.operator || {};
  const upd = () => new Date(C.legalUpdated).toLocaleDateString(U.lang() === "ro" ? "ro-RO" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const tg = `<a href="https://t.me/${C.telegram}" target="_blank" rel="noopener">@${C.telegram}</a>`;
  const mail = op.email ? `<a href="mailto:${esc(op.email)}">${esc(op.email)}</a>` : "";
  const contact = (ro) => [mail, `Telegram ${tg}`].filter(Boolean).join(ro ? " sau " : " или ");
  const who = (ro) =>
    [op.name ? esc(op.name) : ro ? "operatorul serviciului Longma" : "оператор сервиса Longma", op.idno && `IDNO ${esc(op.idno)}`, op.address && esc(op.address)].filter(Boolean).join(", ");

  const DOCS = {
    /* ===================== ПОЛИТИКА ДАННЫХ ===================== */
    privacy: {
      ru: () => `
<h1>Политика обработки персональных данных</h1>
<p class="upd">Редакция от ${upd()}</p>
<p>Здесь описано, какие данные собирает сайт Longma, зачем и как вы можете ими управлять. Мы следуем Закону Республики Молдова № 195/2024 о защите персональных данных.</p>
<h2>1. Кто отвечает за ваши данные</h2>
<p>Оператор данных — ${who(false)}. Связь по любым вопросам о данных: ${contact(false)}.</p>
<h2>2. Какие данные мы получаем</h2>
<ul>
<li><b>При регистрации:</b> имя, email, пароль (хранится только в зашифрованном виде у Google Firebase, мы его не видим), телефон и Telegram — если вы их указали.</li>
<li><b>При заказе:</b> ссылки на товары, размеры, цвета, количество, способ доставки, комментарий, имя и Telegram.</li>
<li><b>По ходу заказа:</b> статусы, стоимость, вес, фото товара, отметка об оплате.</li>
<li><b>Технические:</b> язык сайта и служебные данные входа в браузере (см. <a href="cookies.html">политику куки</a>).</li>
</ul>
<p>Мы не собираем данные банковских карт: оплата проходит на странице платёжного сервиса или банка.</p>
<h2>3. Зачем и на каком основании</h2>
<ul>
<li>Оформить, выкупить и доставить ваш заказ, связаться с вами по нему — <b>исполнение договора</b>.</li>
<li>Вести личный кабинет и историю заказов — <b>ваше согласие</b> при регистрации.</li>
<li>Хранить записи о заказах и оплатах — <b>требования законодательства</b> и защита от споров.</li>
</ul>
<p>Мы не продаём ваши данные и не используем их для рекламы.</p>
<h2>4. Кому передаются данные</h2>
<ul>
<li><b>Google (Firebase)</b> — хранение аккаунтов и заказов. Серверы могут находиться за пределами Молдовы, в том числе в ЕС и США; Google защищает данные по своим стандартам безопасности.</li>
<li><b>Логистический партнёр</b> в Китае — только то, что нужно для выкупа и отправки (например, описание товара).</li>
<li><b>Telegram</b> — если вы пишете менеджеру или отправляете заявку через Telegram.</li>
<li><b>Платёжный сервис или банк</b> — если вы платите по ссылке на оплату.</li>
<li>Государственные органы — только если этого требует закон.</li>
</ul>
<h2>5. Сколько храним</h2>
<p>Данные аккаунта — пока аккаунт существует. Заказы и записи об оплатах — до 3 лет после завершения заказа для учёта и разрешения споров, если закон не требует дольше. Затем данные удаляются или обезличиваются.</p>
<h2>6. Ваши права</h2>
<p>Вы можете: узнать, какие данные мы храним; исправить их; удалить аккаунт; ограничить обработку или возразить против неё; получить свои данные в удобном формате; отозвать согласие.</p>
<p>Изменить имя, телефон и Telegram можно в кабинете → «Мои данные». Удалить аккаунт — там же, кнопкой «Удалить аккаунт». По остальным вопросам напишите: ${contact(false)}. Ответим в течение 30 дней.</p>
<p>Если считаете, что ваши права нарушены, вы можете обратиться в Национальный центр по защите персональных данных (<a href="https://datepersonale.md" target="_blank" rel="noopener">datepersonale.md</a>).</p>
<h2>7. Возраст</h2>
<p>Оформлять заказы могут лица от 18 лет. Мы сознательно не собираем данные детей.</p>
<h2>8. Безопасность</h2>
<p>Доступ к данным заказов есть только у вас и у администраторов Longma. Сайт работает по защищённому соединению (https).</p>
<h2>9. Изменения</h2>
<p>Если политика изменится, новая редакция появится на этой странице с новой датой.</p>`,
      ro: () => `
<h1>Politica de prelucrare a datelor cu caracter personal</h1>
<p class="upd">Redacția din ${upd()}</p>
<p>Aici descriem ce date colectează site-ul Longma, de ce și cum le poți gestiona. Respectăm Legea Republicii Moldova nr. 195/2024 privind protecția datelor cu caracter personal.</p>
<h2>1. Cine răspunde de datele tale</h2>
<p>Operatorul de date este ${who(true)}. Contact pentru orice întrebare despre date: ${contact(true)}.</p>
<h2>2. Ce date primim</h2>
<ul>
<li><b>La înregistrare:</b> nume, email, parolă (păstrată doar criptat la Google Firebase, noi nu o vedem), telefon și Telegram — dacă le-ai indicat.</li>
<li><b>La comandă:</b> linkuri către produse, mărimi, culori, cantitate, modul de livrare, comentariu, nume și Telegram.</li>
<li><b>Pe parcursul comenzii:</b> statusuri, cost, greutate, poze ale produsului, mențiunea despre plată.</li>
<li><b>Tehnice:</b> limba site-ului și datele de conectare din browser (vezi <a href="cookies.html">politica cookie</a>).</li>
</ul>
<p>Nu colectăm datele cardurilor bancare: plata are loc pe pagina serviciului de plată sau a băncii.</p>
<h2>3. De ce și în ce temei</h2>
<ul>
<li>Pentru a plasa, cumpăra și livra comanda și a te contacta despre ea — <b>executarea contractului</b>.</li>
<li>Pentru contul personal și istoricul comenzilor — <b>acordul tău</b> la înregistrare.</li>
<li>Pentru păstrarea evidenței comenzilor și plăților — <b>cerințele legislației</b> și protecția în caz de litigii.</li>
</ul>
<p>Nu vindem datele tale și nu le folosim pentru publicitate.</p>
<h2>4. Cui se transmit datele</h2>
<ul>
<li><b>Google (Firebase)</b> — păstrarea conturilor și comenzilor. Serverele pot fi în afara Moldovei, inclusiv în UE și SUA; Google protejează datele conform standardelor sale de securitate.</li>
<li><b>Partenerul logistic</b> din China — doar ce e necesar pentru cumpărare și expediere (de exemplu, descrierea produsului).</li>
<li><b>Telegram</b> — dacă scrii managerului sau trimiți cererea prin Telegram.</li>
<li><b>Serviciul de plată sau banca</b> — dacă plătești prin linkul de plată.</li>
<li>Autoritățile statului — doar dacă legea o cere.</li>
</ul>
<h2>5. Cât timp păstrăm</h2>
<p>Datele contului — cât timp există contul. Comenzile și evidența plăților — până la 3 ani după finalizarea comenzii, pentru evidență și soluționarea litigiilor, dacă legea nu cere mai mult. Apoi datele se șterg sau se anonimizează.</p>
<h2>6. Drepturile tale</h2>
<p>Poți: afla ce date păstrăm; le corecta; șterge contul; restricționa prelucrarea sau te opune ei; primi datele într-un format convenabil; retrage acordul.</p>
<p>Numele, telefonul și Telegram le poți schimba în cont → «Datele mele». Ștergerea contului — tot acolo, cu butonul «Șterge contul». Pentru restul, scrie: ${contact(true)}. Răspundem în 30 de zile.</p>
<p>Dacă consideri că drepturile tale au fost încălcate, te poți adresa Centrului Național pentru Protecția Datelor cu Caracter Personal (<a href="https://datepersonale.md" target="_blank" rel="noopener">datepersonale.md</a>).</p>
<h2>7. Vârsta</h2>
<p>Comenzile pot fi plasate de persoane de la 18 ani. Nu colectăm intenționat date ale copiilor.</p>
<h2>8. Securitate</h2>
<p>Acces la datele comenzilor ai doar tu și administratorii Longma. Site-ul funcționează prin conexiune securizată (https).</p>
<h2>9. Modificări</h2>
<p>Dacă politica se schimbă, noua redacție apare pe această pagină cu o dată nouă.</p>`,
    },

    /* ===================== УСЛОВИЯ ===================== */
    terms: {
      ru: () => `
<h1>Условия сервиса</h1>
<p class="upd">Редакция от ${upd()}</p>
<p>Эти условия — договор между вами и ${who(false)} («Longma», «мы»). Оформляя заказ, вы их принимаете. Условия не ограничивают ваши права потребителя по законодательству Республики Молдова.</p>
<h2>1. Что мы делаем</h2>
<p>Longma — посредник. По вашей ссылке мы выкупаем товар у стороннего продавца на китайских площадках (Poizon, Taobao, 1688, Pinduoduo и других) и организуем его доставку в Молдову через логистического партнёра. Мы не производим и не продаём товары от своего имени.</p>
<h2>2. Как оформляется заказ</h2>
<ol>
<li>Вы присылаете заявку: ссылки, размер, цвет, количество, способ доставки.</li>
<li>Мы называем итоговую цену. Договор считается заключённым, когда вы подтверждаете цену.</li>
<li>После оплаты мы выкупаем товар и сообщаем о ходе доставки в личном кабинете и в Telegram.</li>
</ol>
<h2>3. Цена и оплата</h2>
<ul>
<li>Цена состоит из стоимости товара и доставки. Доставка считается по весу посылки на складе в Китае, минимум 1 кг: самолётом — ${C.methods.air.perKg} ¥ за кг, морем — ${C.methods.sea.perKg} ¥ за кг. Суммы в леях на сайте — примерные, по курсу ${String(C.rate).replace(".", ",")} лея за юань.</li>
<li>Итоговую сумму к оплате мы называем до выкупа. Если после взвешивания доставка окажется дороже примерной, мы сообщим разницу до отправки.</li>
<li>Таможенные платежи, если по закону они применяются к посылке, в цену доставки не входят. Мы предупредим, если ожидаем их.</li>
</ul>
<h2>4. Сроки</h2>
<p>Ориентировочно: самолётом ${C.methods.air.days} дней, морем ${C.methods.sea.days} дней с момента отправки со склада. Сроки зависят от продавца, перевозчика и таможни, поэтому не являются гарантированными. О задержках мы сообщаем.</p>
<h2>5. Получение</h2>
<p>Посылку мы передаём лично при встрече в Молдове, место и время согласуем. Проверьте товар при получении.</p>
<h2>6. Что мы не выкупаем</h2>
<p>Запрещённые к ввозу и пересылке товары: оружие и его части, наркотические и психотропные вещества, лекарства без разрешения, взрывчатые и легковоспламеняющиеся вещества. Для аккумуляторов, жидкостей и порошков действуют ограничения перевозчика. Мы вправе отказать в заказе без объяснения причин и вернуть полученные деньги.</p>
<h2>7. Оригинальность и качество</h2>
<p>Мы не проверяем подлинность брендовых товаров и не даём гарантию оригинальности: за товар отвечает продавец на площадке. Заказывая товар известного бренда, проверяйте отзывы и продавца. Ввоз поддельных товаров может нарушать закон — такие заказы мы вправе не принимать.</p>
<h2>8. Ответственность</h2>
<p>Мы отвечаем за то, чтобы выкупить именно заказанный товар и организовать его доставку. Если посылка утеряна или повреждена по вине перевозчика, мы помогаем получить компенсацию и возвращаем то, что удалось получить. Мы не отвечаем за задержки и решения таможни и перевозчиков, на которые не можем повлиять, — в пределах, разрешённых законом.</p>
<h2>9. Отмена, возврат и претензии</h2>
<p>Порядок описан на странице <a href="returns.html">«Возврат и претензии»</a>.</p>
<h2>10. Споры</h2>
<p>Сначала напишите нам: ${contact(false)} — постараемся решить вопрос за 14 дней. Если не получилось, спор решается по законодательству Республики Молдова; вы также вправе обратиться в Агентство по защите прав потребителей и надзору за рынком.</p>
<h2>11. Изменения условий</h2>
<p>Новые условия действуют для заказов, оформленных после их публикации на этой странице.</p>`,
      ro: () => `
<h1>Condițiile serviciului</h1>
<p class="upd">Redacția din ${upd()}</p>
<p>Aceste condiții sunt un contract între tine și ${who(true)} («Longma», «noi»). Plasând o comandă, le accepți. Condițiile nu limitează drepturile tale de consumator conform legislației Republicii Moldova.</p>
<h2>1. Ce facem</h2>
<p>Longma este un intermediar. După linkul tău cumpărăm produsul de la un vânzător terț de pe platformele chinezești (Poizon, Taobao, 1688, Pinduoduo și altele) și organizăm livrarea lui în Moldova prin partenerul logistic. Nu producem și nu vindem produse în nume propriu.</p>
<h2>2. Cum se plasează comanda</h2>
<ol>
<li>Trimiți cererea: linkuri, mărime, culoare, cantitate, mod de livrare.</li>
<li>Îți spunem prețul final. Contractul se consideră încheiat când confirmi prețul.</li>
<li>După plată cumpărăm produsul și te informăm despre livrare în contul personal și pe Telegram.</li>
</ol>
<h2>3. Prețul și plata</h2>
<ul>
<li>Prețul include costul produsului și livrarea. Livrarea se calculează după greutatea coletului în depozitul din China, minim 1 kg: cu avionul — ${C.methods.air.perKg} ¥ pe kg, pe mare — ${C.methods.sea.perKg} ¥ pe kg. Sumele în lei de pe site sunt aproximative, la cursul de ${String(C.rate).replace(".", ",")} lei pentru un yuan.</li>
<li>Suma finală de plată o comunicăm înainte de cumpărare. Dacă după cântărire livrarea costă mai mult decât estimarea, îți spunem diferența înainte de expediere.</li>
<li>Taxele vamale, dacă legea le aplică coletului, nu sunt incluse în prețul livrării. Te anunțăm dacă le prevedem.</li>
</ul>
<h2>4. Termene</h2>
<p>Orientativ: cu avionul ${C.methods.air.days} zile, pe mare ${C.methods.sea.days} zile de la expedierea din depozit. Termenele depind de vânzător, transportator și vamă, de aceea nu sunt garantate. Te anunțăm despre întârzieri.</p>
<h2>5. Primirea</h2>
<p>Coletul îl predăm personal la o întâlnire în Moldova, locul și ora le stabilim. Verifică produsul la primire.</p>
<h2>6. Ce nu cumpărăm</h2>
<p>Produse interzise la import și expediere: arme și părți ale lor, substanțe narcotice și psihotrope, medicamente fără autorizație, substanțe explozive și inflamabile. Pentru baterii, lichide și pulberi se aplică restricțiile transportatorului. Putem refuza o comandă fără a explica motivele și returnăm banii primiți.</p>
<h2>7. Originalitate și calitate</h2>
<p>Nu verificăm autenticitatea produselor de brand și nu garantăm originalitatea: de produs răspunde vânzătorul de pe platformă. Când comanzi un produs de brand cunoscut, verifică recenziile și vânzătorul. Importul produselor contrafăcute poate încălca legea — astfel de comenzi putem să nu le acceptăm.</p>
<h2>8. Răspundere</h2>
<p>Răspundem să cumpărăm exact produsul comandat și să organizăm livrarea lui. Dacă coletul e pierdut sau deteriorat din vina transportatorului, te ajutăm să obții despăgubire și îți returnăm ce am reușit să obținem. Nu răspundem pentru întârzierile și deciziile vămii și ale transportatorilor pe care nu le putem influența — în limitele permise de lege.</p>
<h2>9. Anulare, retur și reclamații</h2>
<p>Procedura este descrisă pe pagina <a href="returns.html">«Retur și reclamații»</a>.</p>
<h2>10. Litigii</h2>
<p>Mai întâi scrie-ne: ${contact(true)} — vom încerca să rezolvăm în 14 zile. Dacă nu reușim, litigiul se soluționează conform legislației Republicii Moldova; ai și dreptul să te adresezi Agenției pentru Protecția Consumatorilor și Supravegherea Pieței.</p>
<h2>11. Modificarea condițiilor</h2>
<p>Noile condiții se aplică comenzilor plasate după publicarea lor pe această pagină.</p>`,
    },

    /* ===================== ВОЗВРАТ ===================== */
    returns: {
      ru: () => `
<h1>Отмена, возврат и претензии</h1>
<p class="upd">Редакция от ${upd()}</p>
<p>Этот порядок не ограничивает ваши права по Закону № 105/2003 о защите прав потребителей.</p>
<h2>1. Отмена до выкупа</h2>
<p>Пока товар не выкуплен, заказ можно отменить в кабинете (кнопка «Отменить заказ») или написав нам. Если вы уже заплатили, вернём всю сумму в течение 14 дней тем же способом, каким вы платили.</p>
<h2>2. После выкупа</h2>
<p>Товар уже куплен у продавца в Китае по вашему запросу. Если вы передумали, мы попробуем вернуть товар продавцу. Если продавец принимает возврат, вернём деньги за вычетом того, что не удалось вернуть (например, доставки внутри Китая). Если не принимает — заказ продолжается.</p>
<h2>3. Брак, не тот товар, повреждение</h2>
<ul>
<li>Проверьте посылку при получении и сразу сообщите о проблеме — желательно с фото.</li>
<li>Если мы выкупили не тот товар, что был в заявке, — это наша ошибка: заменим за наш счёт или вернём деньги.</li>
<li>Если товар с браком от продавца или повреждён в пути — подадим претензию продавцу или перевозчику и вернём всё, что удастся получить. О результате сообщим в течение 30 дней.</li>
</ul>
<h2>4. Размер не подошёл</h2>
<p>Товар заказывается по вашим параметрам, поэтому размер, выбранный вами, не считается браком. Сверяйте размеры с таблицей продавца. Можем помочь продать или обменять вещь, но не обязаны принимать её обратно.</p>
<h2>5. Как подать претензию</h2>
<p>Напишите: ${contact(false)}. Укажите номер заказа (начинается с LM), что случилось и приложите фото. Ответим в течение 14 дней.</p>`,
      ro: () => `
<h1>Anulare, retur și reclamații</h1>
<p class="upd">Redacția din ${upd()}</p>
<p>Această procedură nu limitează drepturile tale conform Legii nr. 105/2003 privind protecția consumatorilor.</p>
<h2>1. Anularea înainte de cumpărare</h2>
<p>Cât timp produsul nu e cumpărat, comanda poate fi anulată în cont (butonul «Anulează comanda») sau scriindu-ne. Dacă ai plătit deja, returnăm toată suma în 14 zile prin aceeași metodă prin care ai plătit.</p>
<h2>2. După cumpărare</h2>
<p>Produsul a fost deja cumpărat de la vânzătorul din China la cererea ta. Dacă te-ai răzgândit, încercăm să returnăm produsul vânzătorului. Dacă vânzătorul acceptă returul, îți dăm banii minus ce nu am putut recupera (de exemplu, livrarea în interiorul Chinei). Dacă nu acceptă — comanda continuă.</p>
<h2>3. Defect, alt produs, deteriorare</h2>
<ul>
<li>Verifică coletul la primire și anunță imediat problema — de preferință cu poze.</li>
<li>Dacă am cumpărat alt produs decât cel din cerere — e greșeala noastră: îl înlocuim pe cheltuiala noastră sau returnăm banii.</li>
<li>Dacă produsul are defect de la vânzător sau a fost deteriorat pe drum — depunem reclamație la vânzător sau transportator și îți returnăm tot ce reușim să obținem. Te anunțăm despre rezultat în 30 de zile.</li>
</ul>
<h2>4. Mărimea nu s-a potrivit</h2>
<p>Produsul se comandă după parametrii tăi, de aceea mărimea aleasă de tine nu se consideră defect. Verifică mărimile în tabelul vânzătorului. Te putem ajuta să vinzi sau să schimbi lucrul, dar nu suntem obligați să-l primim înapoi.</p>
<h2>5. Cum depui o reclamație</h2>
<p>Scrie: ${contact(true)}. Indică numărul comenzii (începe cu LM), ce s-a întâmplat și atașează poze. Răspundem în 14 zile.</p>`,
    },

    /* ===================== КУКИ ===================== */
    cookies: {
      ru: () => `
<h1>Политика куки</h1>
<p class="upd">Редакция от ${upd()}</p>
<p>Куки и похожие технологии — это небольшие данные, которые сайт сохраняет в вашем браузере.</p>
<h2>Что использует Longma</h2>
<p>Только то, без чего сайт не работает. Рекламы, аналитики и отслеживания нет.</p>
<table class="ltable">
<thead><tr><th>Что</th><th>Зачем</th><th>Сколько хранится</th></tr></thead>
<tbody>
<tr><td>Данные входа Firebase</td><td>чтобы вы оставались в личном кабинете</td><td>до выхода из аккаунта</td></tr>
<tr><td>lm-lang</td><td>помнить выбранный язык</td><td>пока не очистите браузер</td></tr>
<tr><td>lm-seen-…</td><td>подсвечивать заказы, у которых сменился статус</td><td>пока не очистите браузер</td></tr>
<tr><td>lm-cookies</td><td>помнить, что вы закрыли уведомление о куки</td><td>пока не очистите браузер</td></tr>
</tbody></table>
<h2>Сторонние сервисы</h2>
<p>Шрифты загружаются с Google Fonts, база и вход работают через Google Firebase — при этом Google получает ваш IP-адрес. Ссылки на Telegram и платёжные сервисы открывают их сайты, у которых свои правила.</p>
<h2>Как отключить</h2>
<p>Удалить или запретить куки можно в настройках браузера. Без них не будет работать вход в личный кабинет.</p>
<p>Подробнее о данных — в <a href="privacy.html">политике обработки персональных данных</a>.</p>`,
      ro: () => `
<h1>Politica cookie</h1>
<p class="upd">Redacția din ${upd()}</p>
<p>Cookie-urile și tehnologiile similare sunt date mici pe care site-ul le salvează în browserul tău.</p>
<h2>Ce folosește Longma</h2>
<p>Doar ce este necesar pentru funcționarea site-ului. Fără publicitate, analiză sau urmărire.</p>
<table class="ltable">
<thead><tr><th>Ce</th><th>De ce</th><th>Cât se păstrează</th></tr></thead>
<tbody>
<tr><td>Datele de conectare Firebase</td><td>ca să rămâi în contul personal</td><td>până ieși din cont</td></tr>
<tr><td>lm-lang</td><td>să țină minte limba aleasă</td><td>până cureți browserul</td></tr>
<tr><td>lm-seen-…</td><td>să evidențieze comenzile cu status schimbat</td><td>până cureți browserul</td></tr>
<tr><td>lm-cookies</td><td>să țină minte că ai închis notificarea despre cookie</td><td>până cureți browserul</td></tr>
</tbody></table>
<h2>Servicii terțe</h2>
<p>Fonturile se încarcă de la Google Fonts, baza de date și conectarea funcționează prin Google Firebase — astfel Google primește adresa ta IP. Linkurile către Telegram și serviciile de plată deschid site-urile lor, care au propriile reguli.</p>
<h2>Cum le dezactivezi</h2>
<p>Poți șterge sau bloca cookie-urile în setările browserului. Fără ele nu va funcționa conectarea în contul personal.</p>
<p>Mai multe despre date — în <a href="privacy.html">politica de prelucrare a datelor</a>.</p>`,
    },
  };

  const doc = document.body.dataset.doc;
  const box = document.getElementById("doc");
  const render = () => (box.innerHTML = DOCS[doc][U.lang() === "ro" ? "ro" : "ru"]());
  render();
  U.onLang(render);
})();
