// Custom & wholesale request screen. Loaded after checkout.js (reuses normalizePhone).
// There is no backend yet: requests are saved in localStorage and the store replies by phone.
const QUOTES_KEY = "vt_quotes_v1";
// Minimum quantities are placeholders until the owner confirms them.
const REQUEST_TYPES = {
  custom: { label: "Custom print", note: "Your design on our tees, hoodies and sets.", min: 1 },
  dtf: { label: "DTF printing", note: "Print on your own garments or fabric.", min: 1 },
  wholesale: { label: "Wholesale", note: "Bulk orders of our own pieces.", min: 12 },
  flags: { label: "Flags", note: "Custom flags and banners.", min: 10 },
};

const Quotes = {
  all() { try { return JSON.parse(localStorage.getItem(QUOTES_KEY)) || []; } catch { return []; } },
  get(id) { return this.all().find((q) => q.id === id); },
  save(q) { try { localStorage.setItem(QUOTES_KEY, JSON.stringify([q, ...this.all()])); } catch {} },
};

function customView(id) {
  if (id) return quoteDoneView(id);
  const q = new URLSearchParams(location.hash.split("?")[1] || "");
  const type = REQUEST_TYPES[q.get("type")] ? q.get("type") : "custom";
  const field = (name, label, extra) => `<label class="field"><span>${label}</span>${extra}<p class="ferr" data-for="${name}" hidden></p></label>`;

  return `
    <section class="co-head">
      <div class="eyebrow">For brands and teams</div>
      <h1 class="display">Custom &amp;<br>Wholesale</h1>
      <p class="lead">Tell us what you need and we will call you with a quote. It is free and there is nothing to pay now.</p>
    </section>

    <form id="qt-form" novalidate>
      <fieldset class="co-block">
        <legend>What do you need</legend>
        <div class="types">
          ${Object.entries(REQUEST_TYPES).map(([k, v]) => `
            <label class="pay"><input type="radio" name="type" value="${k}" ${k === type ? "checked" : ""}>
              <span class="pay-dot"></span><span class="pay-text"><b>${v.label}</b><small>${v.note}</small></span></label>`).join("")}
        </div>
      </fieldset>

      <fieldset class="co-block">
        <legend>Details</legend>
        ${field("qty", "How many pieces", `<input name="qty" type="number" inputmode="numeric" min="1" placeholder="12">`)}
        <p class="eta-note" id="qt-min"></p>
        ${field("brief", "Describe your order", `<textarea name="brief" rows="3" placeholder="Colours, sizes, print positions, deadline"></textarea>`)}
        <div class="field">
          <span>Design file (optional)</span>
          <label class="upload" id="upload-box">
            <input name="design" type="file" accept="image/*,.pdf">
            <span id="upload-text">Tap to add a logo or artwork</span>
          </label>
          <p class="hint">Prototype only: the file is not uploaded. In the live store it would be sent with the request.</p>
        </div>
      </fieldset>

      <fieldset class="co-block">
        <legend>Contact</legend>
        ${field("name", "Your name", `<input name="name" autocomplete="name" placeholder="Youssef Adel">`)}
        ${field("org", "Brand or team (optional)", `<input name="org" autocomplete="organization" placeholder="Your brand name">`)}
        ${field("phone", "Mobile number", `<div class="phone"><b>+20</b><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010 1234 5678"></div>`)}
      </fieldset>
    </form>

    <div class="buybar">
      <div class="buy-total"><span>Quote</span><b>Free</b></div>
      <button class="btn" type="submit" form="qt-form">Send request</button>
    </div>`;
}

function initCustom() {
  const form = $("#qt-form");
  if (!form) return;
  const val = (n) => form.elements[n].value.trim();
  const type = () => form.elements.type.value;

  const setErr = (name, msg) => {
    const el = form.querySelector(`[data-for="${name}"]`);
    el.textContent = msg || "";
    el.hidden = !msg;
    form.elements[name].closest(".field").classList.toggle("bad", !!msg);
  };
  const rules = {
    qty: () => {
      const n = Number(val("qty")), t = REQUEST_TYPES[type()];
      if (!Number.isInteger(n) || n < 1) return "Enter how many pieces.";
      return n >= t.min ? "" : `${t.label} starts at ${t.min} pieces.`;
    },
    brief: () => (val("brief").length >= 8 ? "" : "Tell us a little about what you need."),
    name: () => (/\p{L}{2,}/u.test(val("name")) ? "" : "Enter your name."),
    phone: () => (normalizePhone(val("phone")) ? "" : "Enter an Egyptian mobile number, like 010 1234 5678."),
  };

  const minNote = () => {
    const t = REQUEST_TYPES[type()];
    const el = $("#qt-min");
    el.hidden = t.min <= 1;
    el.textContent = `${t.label} starts at ${t.min} pieces.`;
    form.elements.qty.placeholder = String(Math.max(t.min, 1));
    if (val("qty")) setErr("qty", rules.qty());   // re-check a filled quantity against the new type's minimum
  };
  minNote();
  form.elements.type.forEach((r) => r.addEventListener("change", minNote));

  form.addEventListener("input", (e) => { if (rules[e.target.name] && e.target.closest(".field.bad")) setErr(e.target.name, rules[e.target.name]()); });
  form.addEventListener("focusout", (e) => { if (rules[e.target.name] && e.target.value) setErr(e.target.name, rules[e.target.name]()); });

  form.elements.design.addEventListener("change", (e) => {
    const f = e.target.files[0];
    $("#upload-text").textContent = f ? f.name : "Tap to add a logo or artwork";
    $("#upload-box").classList.toggle("has", !!f);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    for (const name of Object.keys(rules)) {
      const err = rules[name]();
      setErr(name, err);
      if (err && !first) first = form.elements[name];
    }
    if (first) { first.scrollIntoView({ behavior: "smooth", block: "center" }); first.focus({ preventScroll: true }); return; }

    const quote = {
      id: "QT-" + String(Math.floor(1000 + Math.random() * 9000)),
      createdAt: new Date().toISOString(),
      type: type(), qty: Number(val("qty")), brief: val("brief"),
      file: form.elements.design.files[0]?.name || "",
      name: val("name"), org: val("org"), phone: normalizePhone(val("phone")),
    };
    Quotes.save(quote);
    location.hash = `#/custom/${quote.id}`;
  });
}

function quoteDoneView(id) {
  const q = Quotes.get(id);
  if (!q) return `<div class="stub"><h2 class="display">Request not found</h2><p>We couldn't find that request on this device.</p><p><a class="btn" href="#/custom">New request</a></p></div>`;
  const t = REQUEST_TYPES[q.type];
  const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "");
  return `
    <section class="done-head">
      <div class="check"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <div class="eyebrow">Request received</div>
      <h1 class="display">${q.id}</h1>
      <p>Thanks, ${q.name.split(" ")[0]}. We will call you on ${q.phone} with a quote, usually within 24 hours.</p>
    </section>
    <section class="section">
      <div class="card-box">
        <h2 class="box-title">Your request</h2>
        <dl class="totals plain">
          ${row("Type", t.label)}
          ${row("Pieces", q.qty)}
          ${row("Brand or team", q.org)}
          ${row("Design file", q.file)}
        </dl>
        <p class="pay-line">${q.brief}</p>
      </div>
    </section>
    <section class="section"><a class="btn block ghost" href="#/">Back to home</a></section>
    <footer class="foot"></footer>`;
}
