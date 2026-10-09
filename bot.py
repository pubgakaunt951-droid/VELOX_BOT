import os
import asyncio
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = os.getenv("BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://pubgakaunt951-droid.github.io/VELOX_BOT/")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton(
            "VELOX UC SHOP",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]

    await update.message.reply_text(
        "VELOX UC SHOP\n\nБарои кушодани мағоза тугмаи зерро пахш кун.",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling()

if __name__ == "__main__":
    main()
