let totalUcCount = 0;
let totalPriceSum = 0;
let userBalance = 0;

// Гузариш байни табҳо
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

// Калкулятори UC (масалан: 60 + 60 = 120 UC)
function addUc(uc, price) {
  totalUcCount += uc;
  totalPriceSum += price;

  document.getElementById('total-uc').innerText = totalUcCount + " UC";
  document.getElementById('total-price').innerText = totalPriceSum.toFixed(2) + " сомони";
}

function resetUcCalc() {
  totalUcCount = 0;
  totalPriceSum = 0;
  document.getElementById('total-uc').innerText = "0 UC";
  document.getElementById('total-price').innerText = "0.00 сомони";
}

// Копировать кардани рақами карта
function copyCardNumber() {
  const cardNum = "919664644";
  navigator.clipboard.writeText(cardNum).then(() => {
    alert("Рақами карта копировать шуд: " + cardNum);
  });
}

// Пур кардани баланс
function openBalanceModal() {
  document.getElementById('modal-balance').style.display = 'flex';
}

function submitBalance() {
  const amount = document.getElementById('balance-amount-input').value;
  const file = document.getElementById('balance-file-input').files;

  if (!amount || file.length === 0) {
    alert("Лутфан сумма ва чеки пардохтро дохил кунед!");
    return;
  }

  alert("Дархост барои пур кардани баланс фиристода шуд!");
  closeModal('modal-balance');
}

// Харидории UC
function submitUcOrder() {
  const pubgId = document.getElementById('uc-pubg-id').value;
  const file = document.getElementById('uc-check-file').files;

  if (totalUcCount === 0) {
    alert("Лутфан, аввал миқдори UC-ро интихоб кунед!");
    return;
  }
  if (!pubgId) {
    alert("Лутфан, PUBG ID-ро ворид кунед!");
    return;
  }
  if (file.length === 0) {
    alert("Лутфан, чеки пардохтро боргирӣ кунед!");
    return;
  }

  addOrderToHistory(totalUcCount + " UC", pubgId, totalPriceSum);
  alert("Закази шумо қабул шуд ва ба 'Мои заказы' илова гардид!");

  resetUcCalc();
  document.getElementById('uc-pubg-id').value = '';
  document.getElementById('uc-check-file').value = '';
  openTab('tab-orders');
}

// Фурӯши аккаунт
function openSellAccModal() {
  document.getElementById('modal-sell-acc').style.display = 'flex';
}

function submitAccountForSale() {
  const media = document.getElementById('acc-media-file').files;
  const lvl = document.getElementById('acc-lvl').value;
  const price = document.getElementById('acc-price').value;

  if (media.length === 0 || !lvl || !price) {
    alert("Лутфан ҳамаи майдонҳо ва файлро пур кунед!");
    return;
  }

  alert("Аккаунти шумо барои тафтиш фиристода шуд!");
  closeModal('modal-sell-acc');
}

// Илова ба Мои заказы
function addOrderToHistory(title, pubgId, price) {
  const container = document.getElementById('orders-container');
  const div = document.createElement('div');
  div.className = 'gold-box list-item';
  div.innerHTML = `
    <div>
      <b>${title}</b> <span class="badge-pending">В обработке</span>
      <div class="sub-text">ID: ${pubgId}</div>
      <div class="price">${price.toFixed(2)} сомони</div>
    </div>
  `;
  container.prepend(div);
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}
