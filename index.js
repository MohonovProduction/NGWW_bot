const { Telegraf, session, Scenes, Markup } = require('telegraf')
const Config = require('./config.json')

require('dotenv').config({ path: "./.env" })

console.log(process.env)

const Stage = new Scenes.Stage()

const request = new Scenes.WizardScene(
    'request',
    async ctx => {
        await ctx.reply(
            'Как к вам обращаться?',
            {
                reply_markup: {
                    remove_keyboard: true
                }
            }
        )
        return ctx.wizard.next()
    },
    async ctx => {
        ctx.wizard.state['name'] = ctx.message.text
        await ctx.reply(
            'Как с вами связаться?',
            {
                reply_markup: {
                    keyboard: [
                        [new Markup.button.contactRequest('Отправить контакты')]
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            }
        )

        return ctx.wizard.next()
    },
    async ctx => {
        if (!('contact' in ctx.message)) {
            await ctx.reply('Пожалуйста, отправтье Ваши контакты, чтобы мы могли связаться с вами')
            return ctx.wizard.back()
        }

        ctx.wizard.state['contact'] = ctx.message.contact

        await ctx.telegram.sendMessage(
            process.env.ADMIN_CHAT,
            `<b>Новая заявка:</b>\n\n${ctx.wizard.state.name} / tg: ${ctx.wizard.state.contact.first_name}\n\n<pre>${ctx.wizard.state.contact.phone_number}</pre>`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    remove_keyboard: true
                }
            }
        )
        await ctx.telegram.sendContact(
            process.env.ADMIN_CHAT,
            ctx.wizard.state.contact.phone_number,
            ctx.wizard.state.contact.first_name,
        )

        await ctx.reply('Спасибо за Ваше обращение, наш специалист скоро свяжется с Вами')

        return ctx.scene.leave()
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
