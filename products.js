// Catalog. Prices are placeholders (EGP) until the owner confirms them.
// `img` on a colour swaps the main photo when that colour is picked; `gallery` is the default photo list.
const IMG = "assets/img/";

window.CATEGORIES = [
  { id: "tees", label: "Tees" },
  { id: "sets", label: "Sets" },
  { id: "pants", label: "Pants" },
];

window.PRODUCTS = [
  {
    id: "palestine-tee", name: "Palestine Tee", category: "tees", price: 450,
    fit: "Oversize", fabric: "Heavy cotton", badge: "New", stock: 24,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#111111" }],
    gallery: [IMG + "palestine-front.jpg", IMG + "palestine-sit.jpg"],
  },
  {
    id: "watani-tee", name: "Watani Tee", category: "tees", price: 450,
    fit: "Oversize", fabric: "Heavy cotton", badge: "New", stock: 6,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#111111" }],
    gallery: [IMG + "watani-street.jpg", IMG + "watani-roof.jpg"],
  },
  {
    id: "roots-tee", name: "Roots Tee", category: "tees", price: 480,
    fit: "Oversize", fabric: "Heavy cotton", badge: "", stock: 18,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#111111" }],
    gallery: [IMG + "roots-back.jpg"],
  },
  {
    id: "england-tee", name: "Three Lions Tee", category: "tees", price: 520,
    fit: "Oversize", fabric: "Interlock", badge: "", stock: 12,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [{ name: "White", hex: "#f2f2ee" }, { name: "Black", hex: "#111111" }],
    gallery: [IMG + "england.jpg"],
  },
  {
    id: "essential-set", name: "Essential Set", category: "sets", price: 1050,
    fit: "Oversize tee + wide-leg pants", fabric: "Interlock", badge: "New", stock: 30,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#16181b", img: IMG + "set-black.jpg" },
      { name: "Navy", hex: "#1f2a4a", img: IMG + "set-navy.jpg" },
      { name: "Grey", hex: "#9aa0a6", img: IMG + "set-grey.jpg" },
      { name: "Cream", hex: "#e9e1d0", img: IMG + "set-cream.jpg" },
    ],
    gallery: [IMG + "set-black.jpg"],
  },
  {
    id: "wide-leg-sweatpants", name: "Wide-Leg Sweatpants", category: "pants", price: 650,
    fit: "Wide leg", fabric: "Bolivar", badge: "", stock: 40,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#16181b", img: IMG + "pants-black.jpg" },
      { name: "Navy", hex: "#1f2a4a", img: IMG + "pants-navy.jpg" },
      { name: "Light Grey", hex: "#c4c8cc", img: IMG + "pants-grey.jpg" },
      { name: "Beige", hex: "#ece6d8", img: IMG + "pants-beige.jpg" },
    ],
    gallery: [IMG + "pants-black.jpg"],
  },
];

window.productImage = (p) => (p.colors[0].img || p.gallery[0]);
window.fmtEGP = (n) => "EGP " + n.toLocaleString("en-US");
