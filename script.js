
const products = [
  { uc: 30, price: 6 },
  { uc: 60, price: 10 },
  { uc: 325, price: 48 },
  { uc: 660, price: 92 },
  { uc: 1320, price: 184 },
  { uc: 1800, price: 240 },
  { uc: 3850, price: 450 },
  { uc: 8100, price: 870 },
  { uc: 16200, price: 1660 },
  { uc: 24300, price: 2480 }
];

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function openModal(title, content) {
  let modal = document.querySelector(".modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = '<div class="modal-content"></div>';
    document.body.appendChild(modal);
  }

  const box = modal.querySelector(".modal-content");
  box.innerHTML = `
    <h2>${title}</h2>
    ${content}
    <button class="close-btn" onclick="closeModal()">Бастан</button>
  `;

  modal.classList.add("show");
}

function closeModal() {
  document.querySelector(".modal")?.classList.remove("show");
}

function buyUC(uc, price) {
  openModal(
    "Хариди UC",
    `
      <p>🎮 PUBG Mobile</p>
      <p>💎 Миқдор: <strong>${uc} UC</strong></p>
      <p>💰 Нарх: <strong>${price} сомонӣ</strong></p>
      <input id="pubgId" placeholder="PUBG ID-и худро навис" />
      <button onclick="submitOrder(${uc}, ${price})">
        Санҷиши ID ва фармоиш
      </button>
    `
  );
}

function submitOrder(uc, price) {
  const id = document.querySelector("#pubgId")?.value.trim();

  if (!id || !/^\d+$/.test(id)) {
    showToast("Лутфан PUBG ID-и дурустро навис!");
    return;
  }

  const message =
    `Салом! Фармоиши VELOX UC SHOP\n` +
    `PUBG ID: ${id}\n` +
    `UC: ${uc}\n` +
    `Нарх: ${price} сомонӣ`;

  const url =
    "https://t.me/VELOX_UC?" +
    "text=" + encodeURIComponent(message);

  closeModal();
  window.open(url, "_blank");
  showToast("Паёми фармоиш омода шуд");
}

function topUpBalance() {
  openModal(
    "Пур кардани баланс",
    `
      <p>💳 Пардохт бо корти бонкӣ</p>
      <p>Қабулкунандаи пардохт: Шарифмох.М.Д</p>
      <input id="topupAmount" type="number" min="5" max="50000"
        placeholder="Маблағ (5–50000 сомонӣ)" />
      <button onclick="sendTopup()">Давом додан</button>
    `
  );
}

function sendTopup() {
  const amount = Number(
    document.querySelector("#topupAmount")?.value
  );

  if (!Number.isFinite(amount) || amount < 5 || amount > 50000) {
    showToast("Маблағ бояд аз 5 то 50000 сомонӣ бошад");
    return;
  }

  const message =
    `Салом! Барои пур кардани баланс дар VELOX UC SHOP.\n` +
    `Маблағ: ${amount} сомонӣ.\n` +
    `Лутфан маълумоти пардохтро фиристед.`;

  window.open(
    "https://t.me/VELOX_UC?text=" + encodeURIComponent(message),
    "_blank"
  );

  closeModal();
}

function showOrders() {
  openModal(
    "Мои заказы",
    "<p>Барои дидани фармоишҳо ба администратор нависед.</p>"
  );
}

function showReviews() {
  window.open("https://t.me/otzif_VELOX", "_blank");
}

function showSupport() {
  window.open("https://t.me/VELOX_UC", "_blank");
}

function showProfile() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  openModal(
    "👑 Мой профиль",
    `
      <p>👤 Ном: ${user?.first_name || "Меҳмон"}</p>
      <p>🆔 Telegram ID: ${user?.id || "Дар Telegram кушоед"}</p>
      <p>💰 Баланс: 0 сомонӣ</p>
      <p>🎁 Мои бонусы</p>
      <p>🔔 Уведомления</p>
    `
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();
  tg?.expand();

  document.querySelectorAll("[data-uc]").forEach(button => {
    button.addEventListener("click", () => {
      const uc = Number(button.dataset.uc);
      const product = products.find(item => item.uc === uc);

      if (product) buyUC(product.uc, product.price);
    });
  });

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "balance") topUpBalance();
      if (action === "orders") showOrders();
      if (action === "reviews") showReviews();
      if (action === "support") showSupport();
      if (action === "profile") showProfile();
    });
  });
});
    
