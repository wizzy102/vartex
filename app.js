// Hash router + Home screen. Routes: #/  #/shop  #/p/:id  #/checkout  #/order/:id  #/custom
const BAG_KEY = "vt_bag_v1";
const $ = (sel, root = document) => root.querySelector(sel);
const byId = (id) => PRODUCTS.find((p) => p.id === id);

// ---------- Bag (full drawer comes in step 4) ----------
function readBag() {
  try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch { return []; }
}
function updateBagCount() {
  const n = readBag().reduce((sum, l) => sum + l.qty, 0);
  const el = $("#bag-count");
  el.textContent = n;
  el.hidden = n === 0;
}

// ---------- Shared pieces ----------
const icon = {
  cod: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  swap: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  truck: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/></svg>',
};

function productCard(p) {
  const low = p.stock <= 8;
  return `
    <a class="card" href="#/p/${p.id}">
      <div class="ph">
        <img src="${productImage(p)}" alt="${p.name}" loading="lazy">
        <div class="badges">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          ${low ? `<span class="badge low">Low stock</span>` : ""}
        </div>
      </div>
      <h3>${p.name}</h3>
      <div class="meta">${p.fit}</div>
      <div class="price">${fmtEGP(p.price)}</div>
      ${p.colors.length > 1 ? `<div class="dots">${p.colors.map((c) => `<i style="background:${c.hex}" title="${c.name}"></i>`).join("")}</div>` : ""}
    </a>`;
}

// ---------- Views ----------
function homeView() {
  const hero = "assets/img/watani-roof.jpg";
  const newIn = PRODUCTS.filter((p) => p.badge === "New").concat(PRODUCTS.filter((p) => !p.badge)).slice(0, 6);
  return `
    <section class="hero">
      <img src="${hero}" alt="">
      <div class="hero-copy">
        <div class="eyebrow">New drop</div>
        <h1 class="display">Wear<br>Your Story</h1>
        <p>Modern streetwear, made in Egypt. Oversize tees, sets and wide-leg pants.</p>
        <a class="btn" href="#/shop">Shop now</a>
      </div>
    </section>

    <div class="chips">
      ${CATEGORIES.map((c) => `<a class="chip" href="#/shop?cat=${c.id}">${c.label}<b>${PRODUCTS.filter((p) => p.category === c.id).length}</b></a>`).join("")}
      <a class="chip" href="#/custom">Custom print</a>
    </div>

    <section class="section">
      <div class="section-head"><h2 class="display">New in</h2><a class="link-more" href="#/shop">View all</a></div>
      <div class="grid">${newIn.map(productCard).join("")}</div>
    </section>

    <section class="section">
      <a class="promo" href="#/custom">
        <div class="eyebrow">For brands and teams</div>
        <h2 class="display">Custom &amp;<br>Wholesale</h2>
        <p>Your design on our blanks. DTF printing, bulk orders and flags.</p>
        <div class="tags"><span>DTF printing</span><span>Wholesale</span><span>Flags</span><span>Custom</span></div>
        <span class="btn ghost">Request a quote</span>
      </a>
    </section>

    <section class="section">
      <div class="trust">
        <div>${icon.cod}<b>Cash on delivery</b>All over Egypt</div>
        <div>${icon.swap}<b>14-day exchange</b>Wrong size? Swap it</div>
        <div>${icon.truck}<b>1-5 day delivery</b>By governorate</div>
      </div>
    </section>

    <footer class="foot">VARTEX &middot; Modern streetwear from Egypt<br><a href="https://www.instagram.com/vartex.eg/" target="_blank" rel="noopener">@vartex.eg</a></footer>`;
}

// ---------- Shop ----------
// Filters live in the URL: #/shop?cat=tees&size=M&fit=Oversize&sort=low
const SORTS = { new: "Newest", low: "Price: low to high", high: "Price: high to low" };

function shopParams() {
  const q = new URLSearchParams(location.hash.split("?")[1] || "");
  return { cat: q.get("cat") || "", size: q.get("size") || "", fit: q.get("fit") || "", sort: q.get("sort") || "new" };
}
function shopHref(next) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v && !(k === "sort" && v === "new")) q.set(k, v);
  const s = q.toString();
  return "#/shop" + (s ? "?" + s : "");
}

function shopView() {
  const f = shopParams();
  let list = PRODUCTS.filter((p) =>
    (!f.cat || p.category === f.cat) && (!f.fit || p.fitTag === f.fit) && (!f.size || p.sizes.includes(f.size)));
  if (f.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (f.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (f.sort === "new") list = [...list].sort((a, b) => (b.badge === "New") - (a.badge === "New"));

  const tab = (id, label) => `<a class="tab ${f.cat === id ? "on" : ""}" href="${shopHref({ ...f, cat: id })}">${label}</a>`;
  const pill = (key, val) => `<a class="pill ${f[key] === val ? "on" : ""}" href="${shopHref({ ...f, [key]: f[key] === val ? "" : val })}">${val}</a>`;
  const active = f.cat || f.size || f.fit;

  return `
    <section class="shop-head">
      <h1 class="display">Shop</h1>
      <div class="tabs">${tab("", "All")}${CATEGORIES.map((c) => tab(c.id, c.label)).join("")}</div>
    </section>

    <section class="filters">
      <div class="filter-row"><span class="flabel">Size</span><div class="pills">${SIZES.map((s) => pill("size", s)).join("")}</div></div>
      <div class="filter-row"><span class="flabel">Fit</span><div class="pills">${FITS.map((s) => pill("fit", s)).join("")}</div></div>
      <div class="filter-row">
        <span class="flabel">Sort</span>
        <select class="sort" data-sort aria-label="Sort products">
          ${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${f.sort === k ? "selected" : ""}>${v}</option>`).join("")}
        </select>
      </div>
    </section>

    <section class="section results">
      <div class="result-bar">
        <span>${list.length} ${list.length === 1 ? "item" : "items"}</span>
        ${active ? `<a class="link-more" href="#/shop">Clear filters</a>` : ""}
      </div>
      ${list.length
        ? `<div class="grid">${list.map(productCard).join("")}</div>`
        : `<div class="empty">
             <div class="display">Nothing here</div>
             <p>No pieces match those filters yet.</p>
             <a class="btn ghost" href="#/shop">Clear filters</a>
           </div>`}
    </section>`;
}

const stub = (title, step) => () =>
  `<div class="stub"><h2 class="display">${title}</h2><p>Coming in step ${step}.</p><p><a class="link-more" href="#/">Back home</a></p></div>`;

const routes = {
  "": homeView,
  shop: shopView,
  p: stub("Product", 4),
  checkout: stub("Checkout", 5),
  order: stub("Order confirmed", 5),
  custom: stub("Custom & wholesale", 6),
};

let lastKey = null;
function render() {
  const [path] = location.hash.replace(/^#\/?/, "").split("?");
  const key = path.split("/")[0];
  $("#app").innerHTML = (routes[key] || stub("Not found", 0))();
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.nav === key));
  if (key !== lastKey) scrollTo(0, 0);   // keep scroll position while filtering inside Shop
  lastKey = key;
  updateBagCount();
}

// Sort dropdown writes to the URL like the other filters
document.addEventListener("change", (e) => {
  if (e.target.matches("[data-sort]")) location.hash = shopHref({ ...shopParams(), sort: e.target.value });
});

addEventListener("hashchange", render);
render();
