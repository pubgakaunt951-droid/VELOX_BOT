
/* =========================
   VELOX UC SHOP
   JAVASCRIPT
========================= */

// Нархҳои UC

const prices = {
    60: 10,
    325: 48,
    660: 92,
    1320: 184,
    1800: 240,
    3850: 450,
    8100: 870,
    16200: 1660,
    24300: 2480
};

// Баланси корбар

let balance = 0;

// Маҳсулоти интихобшуда

let selectedUC = 0;


// Интихоби UC

function selectUC(amount) {

    selectedUC = amount;

    const price = prices[amount];

    document.getElementById("ucAmount").value = amount;

    document.getElementById("result").innerText =
        amount + " UC — " + price + " сомонӣ";
}


// Ҳисоб кардани нарх

function calculatePrice() {

    const amount = Number(
        document.getElementById("ucAmount").value
    );

    const price = prices[amount];

    if (!price) {
        document.getElementById("result").innerText =
            "Ин миқдори UC дар рӯйхат нест!";
        return;
    }

    document.getElementById("result").innerText =
        "Нархи умумӣ: " + price + " сомонӣ";
}


// Фармоиш

function makeOrder() {

    const id = document.getElementById("pubgID").value;

    const amount = Number(
        document.getElementById("ucAmount").value
    );

    if (!id || !amount) {
        alert("Лутфан ҳамаи маълумотро пур кунед!");
        return;
    }

    const price = prices[amount];

    if (!price) {
        alert("Миқдори UC нодуруст аст!");
        return;
    }

    alert(
        "Фармоиш омода шуд!\n" +
        "PUBG ID: " + id +
        "\nUC: " + amount +
        "\nНарх: " + price + " сомонӣ"
    );
}


// Баланс

function updateBalance(amount) {

    balance += amount;

    document.getElementById("balance").innerText =
        balance.toFixed(2) + " сомонӣ";
}


// Тоза кардани фармоиш

function clearOrder() {

    document.getElementById("pubgID").value = "";

    document.getElementById("ucAmount").value = "";

    document.getElementById("result").innerText = "";
}


// Гузаштан ба қисми сайт

function goToSection(section) {

    const element = document.getElementById(section);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth"
        });
    }
}
