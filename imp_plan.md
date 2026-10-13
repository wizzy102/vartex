# VARTEX (@vartex.eg) — Online Ordering Prototype

## Context
VARTEX is a small Egyptian modern-streetwear brand on Instagram (~657 followers). Bio: retail, wholesale, custom, DTF printing, flags; "DM to order". Products seen: tees, hoodies, pants, caps, sweatsuits/sleepwear, flags; regular and oversize fits, fabrics interlock and bolivar. No prices, no site. They run mall pop-ups in Sheikh Zayed. Logo, colours and photos could not be read (Instagram blocks fetch), so the user drops them in `assets/`.

Goal, same as the OUTFIT MOOD project: clickable prototype, 4 mobile screenshots of the customer journey, framed showcase images, and an offer message (English + Egyptian Arabic) for the owner.

Decisions: build from scratch in `c:\Users\MSI\OneDrive\Desktop\vartex\` (empty today), not a copy of omclothes. Egypt market (EGP, +20, governorate delivery, COD first). English UI. Screenshots show Home, Shop, Product, Checkout. Add a 5th functional screen, Custom/Wholesale request, not screenshotted. Build step by step, pausing for review after each step.

## Reference only (omclothes, do not copy wholesale)
`omclothes/tools/shoot.mjs` is a working zero-dependency CDP screenshot script (static server, headless Chrome, 1170×2532 phone shots, framed 1080×1350 posts, 1920×1080 overview). Reuse its approach for `tools/shoot.mjs` and `tools/showcase.html`, rewritten for VARTEX scenes. Also reuse its UX ideas: URL-kept filters, delivery estimate that skips Fridays, free-delivery meter, order timeline.

## Files
- `index.html` shell: header, bottom nav, cart drawer, size-guide sheet.
- `styles.css` mobile-first modern streetwear look. Temporary palette: off-white/bone, near-black, one accent; condensed bold display font + Inter. Re-tuned to the real logo and photos once assets arrive.
- `products.js` catalog of 8 products: tees (regular and oversize), hoodies, sweatpants/pants, sweatsuit set, cap, flag. Fields: id, name, category, EGP price, fit (Regular/Oversize), fabric (Interlock/Bolivar), sizes, colours, stock, images. Placeholder prices realistic for Egypt (tees 350-600, hoodies 750-1,100, pants 600-900, sets 1,300-1,800, caps 250-400); owner confirms later.
- `app.js` hash router, rendering, cart (localStorage), checkout validation, order creation, quote form.
- `assets/README.md`, `assets/logo/`, `assets/products/`, `assets/img/` (cleaned crops).
- `tools/shoot.mjs`, `tools/showcase.html`, `screenshots/`, `offer.md`.

## Screens
1. Home `#/`: logo bar, hero "New Drop" (placeholder until photo), category chips, New In grid, trust strip (COD across Egypt, exchange window, 1-5 day delivery), "Custom & wholesale" banner.
2. Shop `#/shop`: category tabs, fit and size filters, sort, Low stock/New badges, empty state.
3. Product `#/p/:id`: gallery, price, colour and size pickers, fit and fabric info, size guide, quantity, delivery estimate by governorate, sticky Add to Bag.
4. Checkout `#/checkout`: name, +20 phone validation, governorate sets fee (Cairo/Giza 60, others 80-100), address, COD / InstaPay / Vodafone Cash, promo code, live summary.
5. Order confirmed `#/order/:id`: order number, timeline (not screenshotted).
6. Custom/Wholesale `#/custom`: request form (type: custom print / DTF / wholesale / flags, quantity, design upload note, contact), confirmation state (not screenshotted).
Cart drawer on every page, persisted in localStorage.

## Steps (pause after each for review)
1. Scaffold: folders, `assets/README.md` instructions, shell, router stub.
2. Design system + Home.
3. Shop.
4. Product page + cart drawer.
5. Checkout + order confirmed.
6. Custom/Wholesale screen.
7. Polish with real assets: crops, accent colour, product names/prices.
8. Screenshot script: 4 phone PNGs, 4 framed posts, overview.
9. `offer.md`: DM pitch in English and Egyptian Arabic. Problem (orders lost in DMs, repeated price questions, no order record), what they get (store link for bio, order flow, COD/InstaPay, custom/wholesale lead form), offer with setup fee + optional monthly fee as placeholders (suggested Egyptian range noted, user decides), next step "reply and I'll send a live demo link".

## Verification
- Serve the folder (`node tools/shoot.mjs` has its own server; for manual use `python -m http.server`) and click the full journey: Home, Shop, Product, add to bag, Checkout, Order confirmed, Custom form.
- Check: cart survives refresh, invalid phone is blocked, governorate changes the total, promo applies, filters persist in URL.
- Run `node tools/shoot.mjs`; open all PNGs and check for clipped text, broken images, and overflow at 390px.
- Check once with placeholders and once after the user's assets are added, then re-tune accent colour and re-shoot.
