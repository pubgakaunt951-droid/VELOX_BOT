import os
import sqlite3
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_ID = os.getenv("ADMIN_ID", "")
DATABASE = "velox.db"

API = f"https://api.telegram.org/bot{BOT_TOKEN}"


def db():
    con = sqlite3.connect(DATABASE)
    con.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT NOT NULL,
            product TEXT NOT NULL,
            amount REAL NOT NULL,
            player_id TEXT,
            status TEXT DEFAULT 'Ожидает проверки',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    con.commit()
    return con


def notify_admin(text):
    if not BOT_TOKEN or not ADMIN_ID:
        return False

    try:
        r = requests.post(
            f"{API}/sendMessage",
            json={"chat_id": ADMIN_ID, "text": text},
            timeout=15
        )
        return r.ok
    except requests.RequestException:
        app.logger.exception("Telegram notification failed")
        return False


@app.route("/")
def home():
    return jsonify({
        "name": "VELOX UC SHOP",
        "status": "online"
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/order", methods=["POST"])
def create_order():
    data = request.get_json(silent=True) or {}

    telegram_id = str(data.get("telegram_id", "")).strip()
    product = str(data.get("product", "")).strip()
    player_id = str(data.get("player_id", "")).strip()

    try:
        amount = float(data.get("amount", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid amount"}), 400

    if not telegram_id or not product or amount <= 0:
        return jsonify({"error": "Invalid order"}), 400

    con = db()
    cur = con.execute(
        """INSERT INTO orders
        (telegram_id, product, amount, player_id)
        VALUES (?, ?, ?, ?)""",
        (telegram_id, product, amount, player_id)
    )
    order_id = cur.lastrowid
    con.commit()
    con.close()

    message = (
        "VELOX UC SHOP — ЗАКАЗ\n\n"
        f"Заказ: #{order_id}\n"
        f"Telegram ID: {telegram_id}\n"
        f"Товар: {product}\n"
        f"Сумма: {amount:.2f} TJS\n"
        f"PUBG ID: {player_id or 'Не указан'}\n"
        "Статус: Ожидает проверки"
    )

    notified = notify_admin(message)

    return jsonify({
        "ok": True,
        "order_id": order_id,
        "status": "Ожидает проверки",
        "admin_notified": notified
    }), 201


@app.route("/api/orders/<int:order_id>")
def get_order(order_id):
    con = db()
    con.row_factory = sqlite3.Row

    row = con.execute(
        "SELECT * FROM orders WHERE id = ?",
        (order_id,)
    ).fetchone()

    con.close()

    if row is None:
        return jsonify({"error": "Order not found"}), 404

    return jsonify(dict(row))


if __name__ == "__main__":
    db().close()
    app.run(host="0.0.0.0", port=5000)
