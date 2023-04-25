const { Telegraf } = require('telegraf')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start(ctx => {
    console.log(ctx.message)
    ctx.reply('Hello, World!')
})

bot.launch()
