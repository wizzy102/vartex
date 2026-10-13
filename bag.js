// Bag: storage, drawer and bottom sheet. Loaded before app.js.
const BAG_KEY = "vt_bag_v1";
const $ = (sel, root = document) => root.querySelector(sel);
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const MAX_QTY = 10;

const Bag = {
  read() {
    try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch { return []; }
  },
  write(lines) {
    try { localStorage.setItem(BAG_KEY, JSON.stringify(lines)); } catch {}
    updateBagCount();
    renderDrawer();
  },
  lines() {
    return this.read().map((l) => ({ ...l, p: byId(l.id) })).filter((l) => l.p);
  },
  add({ id, color, size, qty }) {
    const p = byId(id);
    const lines = this.read();
    const hit = lines.find((l) => l.id === id && l.color === color && l.size === size);
    if (hit) hit.qty = Math.min(hit.qty + qty, MAX_QTY, p.stock);
    else lines.push({ id, color, size, qty: Math.min(qty, MAX_QTY, p.stock) });
    this.write(lines);
  },
  setQty(i, qty) {
    const lines = this.read();
    if (!lines[i]) return;
    const p = byId(lines[i].id);
    if (qty < 1) lines.splice(i, 1);
    else lines[i].qty = Math.min(qty, MAX_QTY, p.stock);
    this.write(lines);
  },
  count() { return this.lines().reduce((n, l) => n + l.qty, 0); },
  subtotal() { return this.lines().reduce((s, l) => s + l.p.price * l.qty, 0); },
};

function updateBagCount() {
  const n = Bag.count();
  const el = $("#bag-count");
  el.textContent = n;
  el.hidden = n === 0;
}

// Photo for a bag line: the picked colour's own photo when it has one
function lineImage(l) {
  const c = l.p.colors.find((c) => c.name === l.color);
  return (c && c.img) || l.p.gallery[0];
}

// ---------- Drawer ----------
function renderDrawer() {
  const lines = Bag.lines();
  const sub = Bag.subtotal();
  const left = Math.max(0, FREE_SHIP_MIN - sub);
  const pct = Math.min(100, (sub / FREE_SHIP_MIN) * 100);
  const n = Bag.count();

  $("#drawer").innerHTML = `
    <div class="drawer-head">
      <h2 class="display">Your bag${n ? ` (${n})` : ""}</h2>
      <button class="icon-btn" data-close aria-label="Close bag">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    ${lines.length ? `
      <div class="ship-meter">
        <p>${left ? `Add <b>${fmtEGP(left)}</b> more for free delivery` : `<b>You get free delivery</b>`}</p>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </div>
      <ul class="lines">
        ${lines.map((l, i) => `
          <li class="line">
            <img src="${lineImage(l)}" alt="" width="72" height="90">
            <div class="line-info">
              <a href="#/p/${l.id}" data-close class="line-name">${l.p.name}</a>
              <div class="line-meta">${l.color} · ${l.size}</div>
              <div class="stepper small">
                <button data-act="dec" data-i="${i}" aria-label="Fewer">−</button>
                <span>${l.qty}</span>
                <button data-act="inc" data-i="${i}" aria-label="More" ${l.qty >= Math.min(MAX_QTY, l.p.stock) ? "disabled" : ""}>+</button>
              </div>
            </div>
            <div class="line-end">
              <div class="line-price">${fmtEGP(l.p.price * l.qty)}</div>
              <button class="remove" data-act="rm" data-i="${i}">Remove</button>
            </div>
          </li>`).join("")}
      </ul>
      <div class="drawer-foot">
        <div class="subtotal"><span>Subtotal</span><b>${fmtEGP(sub)}</b></div>
        <p class="note">Delivery is worked out at checkout. Pay cash on delivery.</p>
        <a class="btn block" href="#/checkout" data-close>Checkout</a>
      </div>` : `
      <div class="drawer-empty">
        <div class="display">Bag is empty</div>
        <p>Pick something you like and it will show up here.</p>
        <a class="btn" href="#/shop" data-close>Shop now</a>
      </div>`}`;
}

function setOverlay(on) {
  $("#overlay").classList.toggle("open", on);
  document.body.classList.toggle("locked", on);
}
function openBag() { renderDrawer(); closeSheet(); $("#drawer").classList.add("open"); setOverlay(true); }
function closeBag() { $("#drawer").classList.remove("open"); setOverlay(false); }

// ---------- Bottom sheet ----------
function openSheet(html) {
  $("#sheet").innerHTML = html;
  $("#sheet").classList.add("open");
  setOverlay(true);
}
function closeSheet() { $("#sheet").classList.remove("open"); }
function closeAll() { closeBag(); closeSheet(); setOverlay(false); }

document.addEventListener("click", (e) => {
  if (e.target.closest("#bag-btn")) return openBag();
  if (e.target.closest("[data-close]") || e.target.id === "overlay") return closeAll();
  const act = e.target.closest("[data-act]");
  if (!act) return;
  const i = Number(act.dataset.i);
  const line = Bag.read()[i];
  if (act.dataset.act === "inc" && line) Bag.setQty(i, line.qty + 1);
  if (act.dataset.act === "dec" && line) Bag.setQty(i, line.qty - 1);
  if (act.dataset.act === "rm") Bag.setQty(i, 0);
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
addEventListener("hashchange", closeAll);
