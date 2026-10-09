let ucCart = {};

function updateUC(ucAmount, price, delta) {
    if (!ucCart[ucAmount]) ucCart[ucAmount] = { count: 0, pricePerUnit: price };
    ucCart[ucAmount].count += delta;
    if (ucCart[ucAmount].count < 0) ucCart[ucAmount].count = 0;

    document.getElementById('qty_' + ucAmount).innerText = ucCart[ucAmount].count;
    calculateTotal();
}

function calculateTotal() {
    let totalUc = 0;
    let totalPrice = 0;
    for (let uc in ucCart) {
        let item = ucCart[uc];
        totalUc += parseInt(uc) * item.count;
        totalPrice += item.pricePerUnit * item.count;
    }
    document.getElementById('totalUcVal').innerText = totalUc + " UC";
    document.getElementById('totalPriceVal').innerText = totalPrice + " TJS";
}

function checkoutUC() {
    let totalPrice = 0;
    for (let uc in ucCart) {
        totalPrice += ucCart[uc].pricePerUnit * ucCart[uc].count;
    }
    if (totalPrice === 0) {
        alert("Лутфан камаш ягон бастаи UC-ро интихоб кунед!");
        return;
    }
    switchScreen('payment');
}

function openPayment(name, price) {
    switchScreen('payment');
}

function toggleLangMenu() {
    document.getElementById('langDropdownMenu').classList.toggle('show');
}

function changeLanguage(langCode, langText, flagUrl) {
    document.getElementById('activeLangCode').innerText = langText;
    document.getElementById('activeFlagImg').src = flagUrl;
    document.getElementById('langDropdownMenu').classList.remove('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.lang-wrapper')) {
        document.getElementById('langDropdownMenu').classList.remove('show');
    }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(screenId === 'home') document.querySelectorAll('.nav-item')[0].classList.add('active');
    if(screenId === 'reviews') document.querySelectorAll('.nav-item')[1].classList.add('active');
    if(screenId === 'orders') document.querySelectorAll('.nav-item')[2].classList.add('active');
    if(screenId === 'profile') document.querySelectorAll('.nav-item')[3].classList.add('active');
    
    window.scrollTo(0, 0);
}

function copyCardNum() {
    const text = document.getElementById('cardNumberTxt').innerText;
    navigator.clipboard.writeText(text);
    alert("Рақами карта копия шуд!");
}

function submitPayment() {
    const pubgId = document.getElementById('payPubgId').value;
    if(!pubgId) {
        alert("Лутфан PUBG ID-ро ворид кунед!");
        return;
    }
    alert("Пардохти шумо ба админ рафт, каме мунтазир шавед то админ пардохти шуморо тафтиш кунад.");
    switchScreen('orders');
}

function submitAccount() {
    const col = parseInt(document.getElementById('accCol').value);
    const lvl = parseInt(document.getElementById('accLvl').value);
    let hasError = false;

    if(isNaN(col) || col < 20 || col > 101) {
        document.getElementById('colErr').style.display = 'block';
        hasError = true;
    } else {
        document.getElementById('colErr').style.display = 'none';
    }

    if(isNaN(lvl) || lvl < 40 || lvl > 100) {
        document.getElementById('lvlErr').style.display = 'block';
        hasError = true;
    } else {
        document.getElementById('lvlErr').style.display = 'none';
    }

    if(!hasError) {
        alert("Эълони аккаунт ба админ фиристода шуд!");
        switchScreen('home');
    }
       }
