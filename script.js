let currentSelectedUc = 0;
let currentSelectedPrice = 0;

document.addEventListener("DOMContentLoaded", function() {
  lucide.createIcons();
});

// Навигация
function openTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');

  if (tabId === 'tab-main') document.getElementById('btn-nav-main').classList.add('active');
  if (tabId === 'tab-reviews') document.getElementById('btn-nav-reviews').classList.add('active');
  if (tabId === 'tab-orders') document.getElementById('btn-nav-orders').classList.add('active');
  if (tabId === 'tab-profile') document.getElementById('btn-nav-profile').classList.add('active');

  document.getElementById('top-back-btn').style.display = 'none';
  document.getElementById('top-menu-btn').style.display = 'block';
}

function openPage(pageId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  document.getElementById('top-back-btn').style.display = 'block';
  document.getElementById('top-menu-btn').style.display = 'none';
}

function goHome() {
  openTab('tab-main');
}

// Интихоби UC
function selectUc(ucAmount, priceSomoni) {
  currentSelectedUc = ucAmount;
  currentSelectedPrice = priceSomoni;

  document.querySelectorAll('.uc-card').forEach(card => card.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  document.getElementById('selected-uc-text').innerText = ucAmount + " UC";
  document.getElementById('selected-price-text').innerText = priceSomoni.toFixed(2) + " сомони";
}

// Тасдиқи харид ва додани чек
function submitOrder(itemType) {
  const pubgId = document.getElementById('pubg-id-input').value;
  const fileInput = document.getElementById('check-file-input');

  if (currentSelectedUc === 0 && itemType === 'UC') {
    alert("Лутфан, миқдори UC-ро интихоб кунед!");
    return;
  }

  if (!pubgId) {
    alert("Лутфан, PUBG ID-и худро ворид кунед!");
    return;
  }

  if (fileInput.files.length === 0) {
    alert("Лутфан, чеки пардохтро боргирӣ кунед!");
    return;
  }

  const itemName = currentSelectedUc + " UC";
  const itemPrice = currentSelectedPrice;

  addOrderToHistory(itemName, pubgId, itemPrice);

  alert("Закази шумо қабул шуд! Бахши 'Мои заказы'-ро санҷед.");
  
  // Тоза кардани форма
  document.getElementById('pubg-id-input').value = '';
  fileInput.value = '';
  currentSelectedUc = 0;
  currentSelectedPrice = 0;
  document.getElementById('selected-uc-text').innerText = "0 UC";
  document.getElementById('selected-price-text').innerText = "0.00 сомони";

  openTab('tab-orders');
}

function quickBuy(title, price) {
  const pubgId = prompt("Лутфан, PUBG ID-и худро ворид кунед:");
  if (pubgId) {
    addOrderToHistory(title, pubgId, price);
    alert("Заказ қабул шуд!");
    openTab('tab-orders');
  }
}

// Илова кардан ба бахши "Мои заказы"
function addOrderToHistory(title, pubgId, price) {
  const ordersList = document.getElementById('orders-list');
  const newOrder = document.createElement('div');
  newOrder.className = 'gold-box list-item';
  newOrder.innerHTML = `
    <div>
      <b>${title}</b> <span class="badge-pending">В обработке</span>
      <div class="sub-text">ID игрока: ${pubgId}</div>
      <div class="price">${price.toFixed(2)} сомони</div>
    </div>
    <i data-lucide="eye" class="icon-btn-style"></i>
  `;
  ordersList.prepend(newOrder);
  lucide.createIcons();
}
