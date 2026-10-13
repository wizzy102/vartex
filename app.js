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

const stub = (title, step) => () =>
  `<div class="stub"><h2 class="display">${title}</h2><p>Coming in step ${step}.</p><p><a class="link-more" href="#/">Back home</a></p></div>`;

const routes = {
  "": homeView,
  shop: stub("Shop", 3),
  p: stub("Product", 4),
  checkout: stub("Checkout", 5),
  order: stub("Order confirmed", 5),
  custom: stub("Custom & wholesale", 6),
};

function render() {
  const [path] = location.hash.replace(/^#\/?/, "").split("?");
  const key = path.split("/")[0];
  $("#app").innerHTML = (routes[key] || stub("Not found", 0))();
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.nav === key));
  scrollTo(0, 0);
  updateBagCount();
}

addEventListener("hashchange", render);
render();
