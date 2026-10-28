
require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("velox.sqlite");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const ADMIN_KEY = process.env.ADMIN_KEY;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !ADMIN_CHAT_ID || !ADMIN_KEY) {
  console.warn("WARNING: Set BOT_TOKEN, ADMIN_CHAT_ID and ADMIN_KEY.");
}

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT DEFAULT '',
  wallet REAL NOT NULL DEFAULT 0 CHECK(wallet >= 0),
  level INTEGER NOT NULL DEFAULT 1,
  completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL CHECK(price >= 0),
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  player_id TEXT NOT NULL,
  server TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Дар интизорӣ',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const initialProducts = [
  ["uc30", "30 UC", "uc", 5],
  ["uc60", "60 UC", "uc", 10],
  ["uc120", "120 UC", "uc", 20],
  ["uc180", "180 UC", "uc", 30],
  ["uc325", "325 UC", "uc", 47],
  ["uc355", "355 UC", "uc", 58],
  ["uc385", "385 UC", "uc", 62],
  ["uc660", "660 UC", "uc", 90],
  ["uc720", "720 UC", "uc", 100],
  ["uc1440", "1440 UC", "uc", 195],
  ["uc1800", "1800 UC", "uc", 230],
  ["uc3850", "3850 UC", "uc", 430],
  ["uc4570", "4570 UC", "uc", 520],
  ["uc8100", "8100 UC", "uc", 880],
  ["uc16200", "16200 UC", "uc", 1700],

  ["crate1", "Яшики классик", "crates", 15],
  ["crate2", "Яшики премиум", "crates", 35],
  ["crate3", "Яшики мифик", "crates", 50],

  ["prime1", "PRIME — 1 моҳ", "prime", 11],
  ["prime3", "PRIME — 3 моҳ", "prime", 30],
  ["prime6", "PRIME — 6 моҳ", "prime", 65],
  ["prime12", "PRIME — 12 моҳ", "prime", 120],

  ["plus1", "PRIME PLUS — 1 моҳ", "primeplus", 100],
  ["plus3", "PRIME PLUS — 3 моҳ", "primeplus", 280],
  ["plus6", "PRIME PLUS — 6 моҳ", "primeplus", 550],
  ["plus12", "PRIME PLUS — 12 моҳ", "primeplus", 1055]
];

const insertProduct = db.prepare(`
INSERT OR IGNORE INTO products (id, name, category, price)
VALUES (?, ?, ?, ?)
`);

for (const p of initialProducts) insertProduct.run(...p);

// Telegram Mini App authentication
function verifyTelegram(initData) {
  if (!BOT_TOKEN || !initData) return null;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDate = Number(params.get("auth_date"));

    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return null;

    // Reject stale authentication data.
    if (!authDate ||
        Math.abs(Date.now() / 1000 - authDate) > 86400) {
      return null;
    }

    const entries = [...params.entries()]
      .filter(([key]) => key !== "hash")
      .sort(([a], [b]) => a.localeCompare(b));

    const dataCheckString = entries
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secret = crypto
      .createHmac("sha256", "WebAppData")
      .update(BOT_TOKEN)
      .digest();

    const calculated = crypto
      .createHmac("sha256", secret)
      .update(dataCheckString)
      .digest();

    const supplied = Buffer.from(hash, "hex");

    if (supplied.length !== calculated.length ||
        !crypto.timingSafeEqual(supplied, calculated)) {
      return null;
    }

    const user = JSON.parse(params.get("user") || "null");

    if (!user || !user.id) return null;
    return user;
  } catch {
    return null;
  }
}

function requireUser(req, res, next) {
  const user = verifyTelegram(req.get("x-telegram-init-data"));

  if (!user) {
    return res.status(401).json({
      error: "Telegram-ро кушоед ва аз дохили бот ворид шавед."
    });
  }

  const id = String(user.id);
  const username = user.username || user.first_name || "";

  db.prepare(`
    INSERT INTO users (id, username)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET username = excluded.username
  `).run(id, username);

  req.user = { id, username };
  next();
}

function requireAdmin(req, res, next) {
  const key = req.get("x-admin-key");

  if (!ADMIN_KEY || !key ||
      key.length !== ADMIN_KEY.length ||
      !crypto.timingSafeEqual(
        Buffer.from(key), Buffer.from(ADMIN_KEY)
      )) {
    return res.status(403).json({ error: "Дастрасӣ манъ аст." });
  }

  next();
}

async function notifyAdmin(text) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    throw new Error("Telegram admin settings are missing.");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text
      })
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error("Telegram notification failed.");
  }
}

app.get("/api/products", (req, res) => {
  const products = db.prepare(`
    SELECT id, name, category, price
    FROM products WHERE active = 1 ORDER BY rowid
  `).all();

  res.json(products);
});

app.get("/api/me", requireUser, (req, res) => {
  const user = db.prepare(`
    SELECT id, username, wallet, level, completed
    FROM users WHERE id = ?
  `).get(req.user.id);

  res.json(user);
});

app.get("/api/orders", requireUser, (req, res) => {
  const orders = db.prepare(`
    SELECT id, product_name, player_id, server,
           price, status, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 100
  `).all(req.user.id);

  res.json(orders);
});

const createOrder = db.transaction((userId, productId, playerId, server) => {
  const product = db.prepare(`
    SELECT * FROM products WHERE id = ? AND active = 1
  `).get(productId);

  if (!product) throw new Error("Маҳсулот ёфт нашуд.");

  if (product.price <= 0) {
    throw new Error("Нархи маҳсулот ҳоло танзим нашудааст.");
  }

  const user = db.prepare(`
    SELECT wallet FROM users WHERE id = ?
  `).get(userId);

  if (!user || user.wallet < product.price) {
    throw new Error("Баланс кофӣ нест. Аввал балансро пур кунед.");
  }

  const debit = db.prepare(`
    UPDATE users SET wallet = wallet - ?
    WHERE id = ? AND wallet >= ?
  `).run(product.price, userId, product.price);

  if (!debit.changes) throw new Error("Баланс кофӣ нест.");

  const result = db.prepare(`
    INSERT INTO orders
      (user_id, product_id, product_name, player_id, server, price)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    userId, product.id, product.name,
    playerId, server, product.price
  );

  return {
    id: result.lastInsertRowid,
    product,
    wallet: db.prepare("SELECT wallet FROM users WHERE id = ?")
      .get(userId).wallet
  };
});

app.post("/api/orders", requireUser, async (req, res) => {
  const { productId, playerId, server } = req.body || {};

  if (typeof productId !== "string" ||
      typeof playerId !== "string" ||
      !/^\d{5,20}$/.test(playerId) ||
      typeof server !== "string" ||
      !["Europe", "Middle East", "Asia", "KRJP",
        "North America", "Other"].includes(server)) {
    return res.status(400).json({
      error: "Маълумоти фармоиш нодуруст аст."
    });
  }

  let order;

  try {
    order = createOrder(
      req.user.id, productId, playerId, server
    );
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    await notifyAdmin(
      `🛒 ФАРМОИШИ НАВ — VELOX UC SHOP\n\n` +
      `№: ${order.id}\n` +
      `Маҳсулот: ${order.product.name}\n` +
      `Нарх: ${order.product.price} сомонӣ\n` +
      `PUBG ID: ${playerId}\n` +
      `Сервер: ${server}\n` +
      `Telegram ID: ${req.user.id}\n` +
      `Username: @${req.user.username || "нест"}\n\n` +
      `Статус: Дар интизорӣ`
    );
  } catch (e) {
    console.error("Admin notification error:", e.message);
    // The order is already saved. Do not charge again on retry.
    return res.status(202).json({
      id: order.id,
      wallet: order.wallet,
      warning: "Фармоиш сабт шуд, аммо огоҳии админ фиристода нашуд. Санҷиши сервер лозим аст."
    });
  }

  res.status(201).json({
    id: order.id,
    wallet: order.wallet,
    status: "Дар интизорӣ"
  });
});

// Admin: view all orders.
app.get("/api/admin/orders", requireAdmin, (req, res) => {
  res.json(db.prepare(`
    SELECT o.*, u.username
    FROM orders o JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC LIMIT 500
  `).all());
});

// Admin: change order status.
app.patch("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ["Дар интизорӣ", "Дар коркард", "Иҷро шуд", "Бекор шуд"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Статус нодуруст аст." });
  }

  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ?
  `).get(Number(req.params.id));

  if (!order) {
    return res.status(404).json({ error: "Фармоиш ёфт нашуд." });
  }

  db.transaction(() => {
    // Refund once if an order is cancelled.
    if (status === "Бекор шуд" && order.status !== "Бекор шуд") {
      db.prepare(`
        UPDATE users SET wallet = wallet + ? WHERE id = ?
      `).run(order.price, order.user_id);
    }

    // Do not allow reopening a cancelled order: prevents double refunds.
    if (order.status === "Бекор шуд" && status !== "Бекор шуд") {
      throw new Error("Фармоиши бекоршударо аз нав фаъол кардан мумкин нест.");
    }

    db.prepare("UPDATE orders SET status = ? WHERE id = ?")
      .run(status, order.id);

    if (status === "Иҷро шуд" && order.status !== "Иҷро шуд") {
      db.prepare(`
        UPDATE users
        SET completed = completed + 1,
            level = 1 + CAST((completed + 1) / 5 AS INTEGER)
        WHERE id = ?
      `).run(order.user_id);
    }
  })();

  res.json({ ok: true, id: order.id, status });
});

// Admin: adjust balance only after checking the actual payment.
app.post("/api/admin/wallet", requireAdmin, (req, res) => {
  const { userId, amount } = req.body || {};
  const value = Number(amount);

  if (!userId || !Number.isFinite(value) ||
      value <= 0 || value > 50000) {
    return res.status(400).json({
      error: "ID ё маблағ нодуруст аст."
    });
  }

  const result = db.prepare(`
    UPDATE users SET wallet = wallet + ? WHERE id = ?
  `).run(value, String(userId));

  if (!result.changes) {
    return res.status(404).json({ error: "Корбар ёфт нашуд." });
  }

  res.json({
    ok: true,
    wallet: db.prepare("SELECT wallet FROM users WHERE id = ?")
      .get(String(userId)).wallet
  });
});

// Serve the shop.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`VELOX UC SHOP server running on port ${PORT}`);
});
  
