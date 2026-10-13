// Checkout and order-confirmed screens. Loaded after bag.js, before app.js.
// There is no backend yet: orders are saved in localStorage and the store confirms by phone.
const ORDERS_KEY = "vt_orders_v1";
const PROMOS = { VARTEX10: { pct: 10, label: "10% off" } };
const PAYMENTS = {
  cod: { label: "Cash on delivery", note: "Pay the courier in cash when your order arrives." },
  instapay: { label: "InstaPay", note: "We will send you the InstaPay details when we call to confirm." },
  vcash: { label: "Vodafone Cash", note: "We will send you the wallet number when we call to confirm." },
};

const Orders = {
  all() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; } },
  get(id) { return this.all().find((o) => o.id === id); },
  save(order) {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...this.all()])); } catch {}
  },
};

// Accepts 010 1234 5678, +20 10 1234 5678 or 0020 10 1234 5678. Returns "+20 101 234 5678" or null.
function normalizePhone(value) {
  let s = value.replace(/[\s\-()]/g, "");
  if (s.startsWith("+20")) s = "0" + s.slice(3);
  else if (s.startsWith("0020")) s = "0" + s.slice(4);
  if (!/^01[0125]\d{8}$/.test(s)) return null;
  return `+20 ${s.slice(1, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
}

function breakdown(govName, code) {
  const sub = Bag.subtotal();
  const promo = PROMOS[code];
  const discount = promo ? Math.round((sub * promo.pct) / 100) : 0;
  const gov = govByName(govName);
  const delivery = sub >= FREE_SHIP_MIN ? 0 : gov.fee;   // free-delivery threshold uses the subtotal before the promo
  return { sub, discount, delivery, total: sub - discount + delivery, gov };
}

const orderNumber = () => "VT-" + String(Math.floor(1000 + Math.random() * 9000));
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function summaryHtml(b, code) {
  const lines = Bag.lines();
  return `
    <ul class="mini-lines">
      ${lines.map((l) => `
        <li><div class="mini-img"><img src="${lineImage(l)}" alt=""><i>${l.qty}</i></div>
          <div class="mini-info"><b>${l.p.name}</b><span>${l.color} · ${l.size}</span></div>
          <div class="mini-price">${fmtEGP(l.p.price * l.qty)}</div></li>`).join("")}
    </ul>
    <dl class="totals">
      <div><dt>Subtotal</dt><dd>${fmtEGP(b.sub)}</dd></div>
      ${b.discount ? `<div class="disc"><dt>${code} (${PROMOS[code].label})</dt><dd>− ${fmtEGP(b.discount)}</dd></div>` : ""}
      <div><dt>Delivery to ${b.gov.name}</dt><dd>${b.delivery ? fmtEGP(b.delivery) : "Free"}</dd></div>
      <div class="grand"><dt>Total</dt><dd>${fmtEGP(b.total)}</dd></div>
    </dl>`;
}

function checkoutView() {
  if (!Bag.count()) {
    return `<div class="stub"><h2 class="display">Your bag is empty</h2><p>Add something first, then come back to check out.</p>
      <p><a class="btn" href="#/shop">Shop now</a></p></div>`;
  }
  const gov = savedGov();
  const b = breakdown(gov, "");
  const field = (name, label, extra = "") => `
    <label class="field"><span>${label}</span>${extra}<p class="ferr" data-for="${name}" hidden></p></label>`;

  return `
    <section class="co-head"><a class="back-link" href="#/shop">‹ Keep shopping</a><h1 class="display">Checkout</h1></section>

    <form id="co-form" novalidate autocomplete="on">
      <fieldset class="co-block">
        <legend>Contact</legend>
        ${field("name", "Full name", `<input name="name" autocomplete="name" placeholder="Youssef Adel">`)}
        ${field("phone", "Mobile number", `<div class="phone"><b>+20</b><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010 1234 5678"></div>`)}
      </fieldset>

      <fieldset class="co-block">
        <legend>Delivery</legend>
        ${field("gov", "Governorate", `<select name="gov" class="sort full">${GOVERNORATES.map((g) => `<option ${g.name === gov ? "selected" : ""}>${g.name}</option>`).join("")}</select>`)}
        ${field("area", "Area / city", `<input name="area" autocomplete="address-level2" placeholder="Nasr City">`)}
        ${field("address", "Street, building, apartment", `<textarea name="address" rows="2" autocomplete="street-address" placeholder="12 Abbas El Akkad St, Bldg 5, Apt 8"></textarea>`)}
        ${field("notes", "Notes for the courier (optional)", `<input name="notes" placeholder="Landmark, floor, best time to call">`)}
        <p class="eta-note" id="co-eta">Arrives ${estimateWindow(b.gov)}</p>
      </fieldset>

      <fieldset class="co-block">
        <legend>Payment</legend>
        <div class="pay-list">
          ${Object.entries(PAYMENTS).map(([k, v], i) => `
            <label class="pay"><input type="radio" name="pay" value="${k}" ${i ? "" : "checked"}>
              <span class="pay-dot"></span><span class="pay-text"><b>${v.label}</b><small>${v.note}</small></span></label>`).join("")}
        </div>
      </fieldset>

      <fieldset class="co-block" id="co-summary">
        <legend>Order summary</legend>
        <div id="co-sum">${summaryHtml(b, "")}</div>
        <div class="promo-row">
          <input name="promo" placeholder="Promo code" autocapitalize="characters" aria-label="Promo code">
          <button type="button" class="btn ghost small" data-promo>Apply</button>
        </div>
        <p class="promo-msg" id="promo-msg" hidden></p>
      </fieldset>
    </form>

    <div class="buybar">
      <div class="buy-total"><span>Total</span><b id="co-total">${fmtEGP(b.total)}</b></div>
      <button class="btn" type="submit" form="co-form" id="place-btn">Place order</button>
    </div>`;
}

function initCheckout() {
  const form = $("#co-form");
  if (!form) return;
  let code = "";
  let placing = false;
  const val = (n) => form.elements[n].value.trim();

  const refresh = () => {
    const b = breakdown(val("gov"), code);
    $("#co-sum").innerHTML = summaryHtml(b, code);
    $("#co-total").textContent = fmtEGP(b.total);
    $("#co-eta").textContent = `Arrives ${estimateWindow(b.gov)}`;
  };
  const setErr = (name, msg) => {
    const el = form.querySelector(`[data-for="${name}"]`);
    el.textContent = msg || "";
    el.hidden = !msg;
    form.elements[name].closest(".field").classList.toggle("bad", !!msg);
  };
  const rules = {
    name: () => (/\p{L}{2,}/u.test(val("name")) ? "" : "Enter your full name."),
    phone: () => (normalizePhone(val("phone")) ? "" : "Enter an Egyptian mobile number, like 010 1234 5678."),
    area: () => (val("area").length >= 2 ? "" : "Enter your area or city."),
    address: () => (val("address").length >= 8 ? "" : "Enter your street, building and apartment."),
  };

  form.addEventListener("input", (e) => { if (rules[e.target.name] && e.target.closest(".field.bad")) setErr(e.target.name, rules[e.target.name]()); });
  form.addEventListener("focusout", (e) => { if (rules[e.target.name] && e.target.value) setErr(e.target.name, rules[e.target.name]()); });
  form.elements.gov.addEventListener("change", () => {
    try { localStorage.setItem("vt_gov", val("gov")); } catch {}
    refresh();
  });

  const msg = $("#promo-msg");
  const applyPromo = () => {
    const entered = val("promo").toUpperCase();
    msg.hidden = false;
    if (!entered) { code = ""; msg.hidden = true; }
    else if (PROMOS[entered]) { code = entered; msg.textContent = `${entered} applied: ${PROMOS[entered].label}.`; msg.className = "promo-msg ok"; }
    else { code = ""; msg.textContent = "That code isn't valid."; msg.className = "promo-msg no"; }
    refresh();
  };
  form.querySelector("[data-promo]").addEventListener("click", applyPromo);
  form.elements.promo.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (placing) return;
    let first = null;
    for (const name of Object.keys(rules)) {
      const err = rules[name]();
      setErr(name, err);
      if (err && !first) first = form.elements[name];
    }
    if (first) { first.scrollIntoView({ behavior: "smooth", block: "center" }); first.focus({ preventScroll: true }); return; }

    placing = true;
    const b = breakdown(val("gov"), code);
    const order = {
      id: orderNumber(),
      createdAt: new Date().toISOString(),
      customer: { name: val("name"), phone: normalizePhone(val("phone")), gov: b.gov.name, area: val("area"), address: val("address"), notes: val("notes") },
      payment: form.elements.pay.value,
      promo: code,
      lines: Bag.lines().map((l) => ({ name: l.p.name, color: l.color, size: l.size, qty: l.qty, price: l.p.price, img: lineImage(l) })),
      subtotal: b.sub, discount: b.discount, delivery: b.delivery, total: b.total,
    };
    Orders.save(order);
    Bag.write([]);
    location.hash = `#/order/${order.id}`;
  });
}

function orderView(id) {
  const o = Orders.get(id);
  if (!o) return `<div class="stub"><h2 class="display">Order not found</h2><p>We couldn't find that order on this device.</p><p><a class="btn" href="#/shop">Shop now</a></p></div>`;
  const c = o.customer;
  const gov = govByName(c.gov);
  const pay = PAYMENTS[o.payment];
  const steps = [
    ["Order received", `Placed ${fmtDate(o.createdAt)}`, "done"],
    ["We call to confirm", `On ${c.phone}, usually within a few hours`, "now"],
    ["Packed and handed to the courier", "", ""],
    ["Out for delivery", "", ""],
    ["Delivered", `Expected ${estimateWindow(gov, new Date(o.createdAt))}`, ""],
  ];
  return `
    <section class="done-head">
      <div class="check"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <div class="eyebrow">Order received</div>
      <h1 class="display">${o.id}</h1>
      <p>Thanks, ${c.name.split(" ")[0]}. We will call you to confirm your order.</p>
    </section>

    <section class="section">
      <ol class="timeline">
        ${steps.map(([t, s, st]) => `<li class="${st}"><i></i><div><b>${t}</b>${s ? `<span>${s}</span>` : ""}</div></li>`).join("")}
      </ol>
    </section>

    <section class="section">
      <div class="card-box">
        <h2 class="box-title">Items</h2>
        <ul class="mini-lines">
          ${o.lines.map((l) => `<li><div class="mini-img"><img src="${l.img}" alt=""><i>${l.qty}</i></div>
            <div class="mini-info"><b>${l.name}</b><span>${l.color} · ${l.size}</span></div><div class="mini-price">${fmtEGP(l.price * l.qty)}</div></li>`).join("")}
        </ul>
        <dl class="totals">
          <div><dt>Subtotal</dt><dd>${fmtEGP(o.subtotal)}</dd></div>
          ${o.discount ? `<div class="disc"><dt>${o.promo}</dt><dd>− ${fmtEGP(o.discount)}</dd></div>` : ""}
          <div><dt>Delivery</dt><dd>${o.delivery ? fmtEGP(o.delivery) : "Free"}</dd></div>
          <div class="grand"><dt>Total</dt><dd>${fmtEGP(o.total)}</dd></div>
        </dl>
      </div>
    </section>

    <section class="section">
      <div class="card-box">
        <h2 class="box-title">Delivery and payment</h2>
        <p class="addr"><b>${c.name}</b><br>${c.address}<br>${c.area}, ${c.gov}<br>${c.phone}${c.notes ? `<br><em>${c.notes}</em>` : ""}</p>
        <p class="pay-line"><b>${pay.label}</b>${o.payment === "cod" ? `. Have ${fmtEGP(o.total)} ready.` : `. ${pay.note}`}</p>
      </div>
    </section>

    <section class="section"><a class="btn block ghost" href="#/shop">Continue shopping</a></section>
    <footer class="foot"></footer>`;
}
