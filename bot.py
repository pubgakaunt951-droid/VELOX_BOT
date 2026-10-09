import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils import executor

API_TOKEN = 'YOUR_BOT_TOKEN_HERE'

logging.basicConfig(level=logging.INFO)

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    markup = InlineKeyboardMarkup()
    web_app = WebAppInfo(url="https://YOUR_WEB_APP_URL/index.html")
    markup.add(InlineKeyboardButton(text="VELOX UC SHOP", web_app=web_app))
    
    await message.reply(
        "Хуш омадед ба VELOX UC SHOP! Барои кушодани мағоза тугмаи зеринро пахш кунед.",
        reply_markup=markup
    )

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
    
