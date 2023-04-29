const { Telegraf, session, Scenes } = require('telegraf')
const Config = require('./config.json')

require('dotenv').config({ path: "./.env" })

console.log(process.env)

const Stage = new Scenes.Stage()

const request = new Scenes.WizardScene(
    'request',
    ctx => {
        console.log(ctx)
        ctx.reply('Как к вам обращаться?')
        return ctx.wizard.next()
    },
    ctx => {
        ctx.wizard.state['name'] = ctx.message.text
        ctx.reply('Как с вами связаться?')
        return ctx.wizard.next()
    },
    ctx => {
        ctx.wizard.state['number'] = ctx.message.text
        ctx.telegram.sendMessage(process.env.ADMIN_CHAT, `Новая заявка:\n${ctx.wizard.state.name} ${ctx.wizard.state.number}`)
        ctx.reply('Спасибо за Ваше обращение, наш специалист скоро свяжется с Вами')
    }
)

Stage.register(request)

const bot = new Telegraf(process.env.TOKEN)

bot
    .use(session())
    .use(Stage.middleware())

bot.telegram.setMyCommands(Config.commands)

bot.start( ctx => {
    console.log(ctx.message)
    ctx.scene.enter('request')
})

bot.launch()
