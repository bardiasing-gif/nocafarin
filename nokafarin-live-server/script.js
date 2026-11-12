const products = [
  {id:1, name:"مربای تمشک", price:600000, image:"https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80"},
  {id:2, name:"مربای انجیر", price:600000, image:"https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80"},
  {id:3, name:"مربای کامکوات", price:650000, image:"https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80"},
  {id:4, name:"ترشی کلم", price:650000, image:"https://images.unsplash.com/photo-1589135233689-7d5c8f7f5b5f?auto=format&fit=crop&w=800&q=80"},
  {id:5, name:"ترشی کدو", price:700000, image:"https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80"},
  {id:6, name:"رب انار", price:700000, image:"https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80"}
];

const formatPrice = value => new Intl.NumberFormat("fa-IR").format(value);
let cart = {};
try {
  const savedCart = JSON.parse(localStorage.getItem("nokafarin_cart") || "{}");
  if (savedCart && typeof savedCart === "object" && !Array.isArray(savedCart)) {
    cart = Object.fromEntries(
      Object.entries(savedCart)
        .filter(([id, quantity]) =>
          products.some(product => product.id === Number(id)) &&
          Number.isInteger(quantity) && quantity > 0
        )
        .map(([id, quantity]) => [Number(id), quantity])
    );
  }
} catch (error) {
  cart = {};
}

function saveCart() {
  try {
    localStorage.setItem("nokafarin_cart", JSON.stringify(cart));
  } catch (error) {
    console.warn("ذخیره سبد خرید در این مرورگر ممکن نشد.", error);
  }
}
let activeProductId = null;

const productsContainer = document.getElementById("products");
productsContainer.innerHTML = products.map(product => `
  <article class="product">
    <img src="${product.image}" alt="${product.name}" loading="lazy"
      onerror="this.src='https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80'">
    <div class="product-info">
      <h3>${product.name}</h3>
      <span class="weight">وزن: ۹۰۰ گرم</span>
      <div class="product-bottom">
        <span class="price">${formatPrice(product.price)} تومان</span>
        <div class="product-actions">
          <button class="more-btn" onclick="openProductPage(${product.id})">جزئیات</button>
          <button class="add-btn" onclick="addToCart(${product.id})">افزودن</button>
        </div>
      </div>
    </div>
  </article>
`).join("");

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  closeDetails();
  openCart();
}

function changeQty(id, amount) {
  cart[id] += amount;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => {
    return sum + products.find(product => product.id === Number(id)).price * quantity;
  }, 0);

  document.getElementById("cart-count").textContent = formatPrice(count);
  document.getElementById("cart-total").textContent = formatPrice(total) + " تومان";

  document.getElementById("cart-items").innerHTML = entries.length
    ? entries.map(([id, quantity]) => {
        const product = products.find(item => item.id === Number(id));
        return `
          <div class="cart-row">
            <div><b>${product.name}</b><small>${formatPrice(product.price)} تومان</small></div>
            <div class="qty">
              <button onclick="changeQty(${id}, -1)">−</button>
              <b>${formatPrice(quantity)}</b>
              <button onclick="changeQty(${id}, 1)">+</button>
              <button class="remove-item" onclick="removeFromCart(${id})" aria-label="حذف ${product.name}">×</button>
            </div>
          </div>`;
      }).join("")
    : '<p class="empty">سبد خریدت هنوز خالیه.</p>';
}

renderCart();

function openCart() {
  document.getElementById("cart-panel").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cart-panel").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

function showDetails(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  activeProductId = id;
  document.getElementById("detail-image").src = product.image;
  document.getElementById("detail-image").alt = product.name;
  document.getElementById("detail-title").textContent = product.name;
  document.getElementById("detail-price").textContent = formatPrice(product.price) + " تومان";
  document.getElementById("detail-overlay").classList.add("open");
}
function closeDetails() {
  document.getElementById("detail-overlay").classList.remove("open");
  activeProductId = null;
}

document.getElementById("cart-open").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.getElementById("detail-close").addEventListener("click", closeDetails);
document.getElementById("detail-overlay").addEventListener("click", event => {
  if (event.target.id === "detail-overlay") closeDetails();
});
document.getElementById("detail-add").addEventListener("click", () => {
  if (activeProductId !== null) addToCart(activeProductId);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeDetails();
    closeCart();
  }
});


function openProductPage(id, updateHistory = true) {
  const product = products.find(item => item.id === Number(id));
  if (!product) return;
  closeDetails();
  closeCart();
  document.getElementById("main-content").hidden = true;
  document.getElementById("product-page").hidden = false;
  document.getElementById("page-product-image").src = product.image;
  document.getElementById("page-product-image").alt = product.name;
  document.getElementById("page-product-name").textContent = product.name;
  document.getElementById("page-product-price").textContent = formatPrice(product.price) + " تومان";
  document.getElementById("page-product-add").onclick = () => addToCart(product.id);
  if (updateHistory) history.pushState({ productId: product.id }, "", "?product=" + product.id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHomePage(updateHistory = true) {
  document.getElementById("product-page").hidden = true;
  document.getElementById("main-content").hidden = false;
  if (updateHistory) history.pushState({}, "", window.location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("back-to-shop").addEventListener("click", () => showHomePage());
window.addEventListener("popstate", () => {
  const id = new URLSearchParams(window.location.search).get("product");
  if (id) openProductPage(id, false);
  else showHomePage(false);
});

const initialProductId = new URLSearchParams(window.location.search).get("product");
if (initialProductId) openProductPage(initialProductId, false);



// بخش ثبت سفارش — افزوده شده بدون تغییر منطق سایر بخش‌های سایت
const checkoutOverlay = document.getElementById("checkout-overlay");
const checkoutForm = document.getElementById("checkout-form");
const checkoutFormView = document.getElementById("checkout-form-view");
const checkoutSuccess = document.getElementById("checkout-success");

function openCheckout() {
  if (!Object.keys(cart).length) {
    closeCart();
    return;
  }
  const summary = Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(item => item.id === Number(id));
    return `<div class="checkout-summary-row"><span>${product.name} × ${formatPrice(quantity)}</span><b>${formatPrice(product.price * quantity)} تومان</b></div>`;
  }).join("");
  const total = Object.entries(cart).reduce((sum, [id, quantity]) => {
    return sum + products.find(item => item.id === Number(id)).price * quantity;
  }, 0);
  document.getElementById("checkout-summary").innerHTML =
    `<h3>خلاصه سفارش</h3>${summary}<div class="checkout-summary-total"><span>جمع کل محصولات</span><b>${formatPrice(total)} تومان</b></div>`;
  checkoutForm.reset();
  checkoutFormView.hidden = false;
  checkoutSuccess.hidden = true;
  checkoutOverlay.classList.add("open");
  checkoutOverlay.setAttribute("aria-hidden", "false");
  closeCart();
}
function closeCheckout() {
  checkoutOverlay.classList.remove("open");
  checkoutOverlay.setAttribute("aria-hidden", "true");
}
document.getElementById("checkout-open").addEventListener("click", openCheckout);
document.getElementById("checkout-close").addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", event => {
  if (event.target === checkoutOverlay) closeCheckout();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCheckout();
});

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!Object.keys(cart).length) {
    alert("سبد خرید خالی است.");
    closeCheckout();
    return;
  }
  const data = new FormData(checkoutForm);
  const phone = String(data.get("phone") || "")
    .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[\s-]/g, "");
  const phoneValid = /^(\+98|0098|0)?9[0-9]{9}$/.test(phone);
  if (!phoneValid) {
    checkoutForm.elements.phone.setCustomValidity("شماره موبایل معتبر وارد کن.");
    checkoutForm.elements.phone.reportValidity();
    checkoutForm.elements.phone.setCustomValidity("");
    return;
  }

  const items = Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(item => item.id === Number(id));
    return { id: product.id, name: product.name, quantity, unitPrice: product.price, lineTotal: product.price * quantity };
  });
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const orderNumber = "NK-" + Date.now().toString().slice(-8);
  const order = {
    orderNumber,
    createdAt: new Date().toISOString(),
    customer: {
      name: String(data.get("customerName")).trim(),
      phone,
      province: String(data.get("province")).trim(),
      city: String(data.get("city")).trim(),
      address: String(data.get("address")).trim(),
      note: String(data.get("note") || "").trim()
    },
    items,
    total,
    status: "ثبت‌شده در مرورگر؛ در انتظار ارسال به فروشگاه"
  };

  try {
    const previousOrders = JSON.parse(localStorage.getItem("nokafarin_orders") || "[]");
    const safeOrders = Array.isArray(previousOrders) ? previousOrders : [];
    safeOrders.push(order);
    localStorage.setItem("nokafarin_orders", JSON.stringify(safeOrders));
  } catch (error) {
    alert("ذخیره سفارش در مرورگر ممکن نشد. فضای ذخیره‌سازی مرورگر را بررسی کن و دوباره تلاش کن.");
    return;
  }

  const orderText = [
    "سفارش جدید از فروشگاه نُکافرین",
    "شماره سفارش: " + orderNumber,
    "",
    "نام گیرنده: " + order.customer.name,
    "شماره تماس: " + order.customer.phone,
    "استان: " + order.customer.province,
    "شهر: " + order.customer.city,
    "نشانی: " + order.customer.address,
    "",
    "محصولات:",
    ...items.map(item => `- ${item.name} | تعداد: ${formatPrice(item.quantity)} | مبلغ: ${formatPrice(item.lineTotal)} تومان`),
    "",
    "جمع کل محصولات: " + formatPrice(total) + " تومان",
    "توضیحات: " + (order.customer.note || "ندارد"),
    "",
    "هزینه ارسال و روش پرداخت نیازمند هماهنگی با فروشگاه است."
  ].join("\n");

  document.getElementById("checkout-order-number").textContent = "شماره سفارش: " + orderNumber;
  document.getElementById("checkout-order-text").value = orderText;
  checkoutFormView.hidden = true;
  checkoutSuccess.hidden = false;

  cart = {};
  saveCart();
});

document.getElementById("copy-order").addEventListener("click", async () => {
  const text = document.getElementById("checkout-order-text").value;
  const button = document.getElementById("copy-order");
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "متن سفارش کپی شد ✓";
  } catch (error) {
    const field = document.getElementById("checkout-order-text");
    field.focus();
    field.select();
    const copied = document.execCommand("copy");
    button.textContent = copied ? "متن سفارش کپی شد ✓" : "متن را انتخاب و کپی کن";
  }
});

document.getElementById("new-order").addEventListener("click", () => {
  closeCheckout();
  showHomePage(false);
});


// ارسال دستی سفارش به پیوی روبیکای فروشگاه
document.getElementById("send-rubika").addEventListener("click", async () => {
  const message = document.getElementById("checkout-order-text").value;
  // باز کردن صفحه روبیکا در همان کلیک کاربر تا مسدودکننده پنجره جلوی آن را نگیرد
  window.open("https://rubika.ir/support_dvd", "_blank", "noopener,noreferrer");
  const button = document.getElementById("send-rubika");
  try {
    await navigator.clipboard.writeText(message);
    button.textContent = "متن کپی شد؛ در پیوی روبیکا جای‌گذاری کن ✓";
  } catch (error) {
    const field = document.getElementById("checkout-order-text");
    field.focus();
    field.select();
    document.execCommand("copy");
    button.textContent = "متن انتخاب شد؛ کپی کن و در روبیکا بفرست";
  }
});
