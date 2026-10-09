const tg = window.Telegram.WebApp;
tg.expand();

let currentLang = 'tg';
let userBalance = 0.00;
let orders = [];
let reviews = [];

// Тарҷумаҳо
const translations = {
  tg: {
    payTitle: "Пуркунии Баланс",
    uploadLabel: "Чеки пардохтро илова кунед:",
    paySubmit: "Оплатить",
    alertMsg: "Пардохти шумо ба админ рафт каме мунтазир шавед то админ Пардохти шуморо тафтиш кунад"
  },
  ru: {
    payTitle: "Пополнение баланса",
    uploadLabel: "Загрузите чек оплаты:",
    paySubmit: "Оплатить",
    alertMsg: "Ваш платеж отправлен администратору, подождите пока администратор проверит ваш платеж"
  },
  en: {
    payTitle: "Recharge Balance",
    uploadLabel: "Upload payment receipt:",
    paySubmit: "Pay",
    alertMsg: "Your payment has been sent to the admin, please wait while the admin verifies your payment"
  }
};

// Идоракунии забон
document.getElementById('langSelectBtn').addEventListener('click', () => {
  document.getElementById('langMenu').classList.toggle('hidden');
});

function changeLang(lang) {
  currentLang = lang;
  document.getElementById('langMenu').classList.add('hidden');
  
  const flags = { tg: '🇹🇯', ru: '🇷🇺', en: '🇬🇧' };
  const texts = { tg: 'TJK', ru: 'RUS', en: 'ENG' };
  
  document.getElementById('currentLangFlag').innerText = flags[lang];
  document.getElementById('currentLangText').innerText = texts[lang];

  document.getElementById('txtPayTitle').innerText = translations[lang].payTitle;
  document.getElementById('txtUploadLabel').innerText = translations[lang].uploadLabel;
  document.getElementById('txtPaySubmit').innerText = translations[lang].paySubmit;
  document.getElementById('alertMessage').innerText = translations[lang].alertMsg;
}

function toggleLangMenu() {
  document.getElementById('langMenu').classList.toggle('hidden');
}

// Нусхабардории карта
function copyCardNumber() {
  const cardNum = document.getElementById('cardNumber').innerText;
  navigator.clipboard.writeText(cardNum);
  alert("Рақами карта копировать шуд!");
}

// Модалҳо
function openRechargeModal() {
  document.getElementById('paymentModal').classList.remove('hidden');
}

function submitPayment() {
  document.getElementById('paymentModal').classList.add('hidden');
  document.getElementById('alertModal').classList.remove('hidden');
}

function closeAlertModal() {
  document.getElementById('alertModal').classList.add('hidden');
  switchTab('shop');
}

// Навигатсия
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// Харидории маҳсулот
function buyItem(name, price) {
  openRechargeModal();
  orders.push({ id: Date.now(), name: name, price: price, status: 'pending' });
  renderOrders();
}

// Бахши Аккаунт
function toggleAccForm() {
  document.getElementById('accSellForm').classList.toggle('hidden');
}

function submitAccount() {
  const col = parseInt(document.getElementById('accCollection').value);
  const lvl = parseInt(document.getElementById('accLevel').value);
  const colErr = document.getElementById('colError');
  const lvlErr = document.getElementById('lvlError');
  
  let valid = true;

  if (isNaN(col) || col < 20 || col > 101) {
    colErr.classList.remove('hidden');
    valid = false;
  } else {
    colErr.classList.add('hidden');
  }

  if (isNaN(lvl) || lvl < 40 || lvl > 100) {
    lvlErr.classList.remove('hidden');
    valid = false;
  } else {
    lvlErr.classList.add('hidden');
  }

  if (valid) {
    alert("Аккаунти шумо барои тафтиш ба админ фиристода шуд.");
    toggleAccForm();
  }
}

// Рандор кардани Заказҳо
function renderOrders() {
  const list = document.getElementById('ordersList');
  list.innerHTML = '';
  
  orders.forEach((ord, index) => {
    const item = document.createElement('div');
    item.style.cssText = "background:#1e1e1e; padding:12px; margin-bottom:8px; border-radius:6px;";
    
    let statusText = ord.status === 'completed' 
      ? `<span style="color:#28a745">Гузашт</span>` 
      : `<span style="color:#ff9900">Дар тафтиш</span>`;
      
    item.innerHTML = `
      <div><b>${ord.name}</b> - ${ord.price} TJS</div>
      <div>Статус: ${statusText}</div>
      ${ord.status === 'completed' ? `
        <div style="color:red; margin-top:6px; cursor:pointer;" onclick="openReviewForm(${index})">Отзыви худро монед (1-5 ситора)</div>
      ` : ''}
    `;
    list.appendChild(item);
  });
}

function openReviewForm(index) {
  const stars = prompt("Аз 1 то 5 ситора гузоред:");
  const text = prompt("Шарҳ нависед (то 50 калима):");
  if (stars && text) {
    alert("Отзыви шумо ба админ фиристода шуд!");
  }
}

// Профиль
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
  const user = tg.initDataUnsafe.user;
  document.getElementById('userName').innerText = user.first_name + (user.last_name ? ' ' + user.last_name : '');
  document.getElementById('userId').innerText = `ID: ${user.id}`;
}

function openSupport() {
  tg.openTelegramLink("https://t.me/your_admin_username");
                       }
  
