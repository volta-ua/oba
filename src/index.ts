import express from 'express'
import configMode from './config/config'
import {sendMessage} from './bot/bot'
import logger from './utils/logger'
import {updateImagesOnServer} from './domain/images-update/updateImagesOnServer'
import {articulesWoImages} from './domain/images-update/articulesWoImages'
import {messageHandler} from './domain/messageHandler'
import {loadDuringStartup, reloadUserConfByExternalRequest} from './domain/extractors'
import {appDataSource} from './db/appDataSource'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.get('/', async (_req, res) => {
    res.send('App is working now')
})

app.post('/reloadUserConf', async (_rec, res) => {
    await reloadUserConfByExternalRequest()
    res.json({status: 'ok'})
})

app.get('/updateImagesOnServer', async (_rec, res) => {
    const details = await updateImagesOnServer()
    res.json({success: true, details})
})

app.get('/articulesWoImages', async (_rec, res) => {
    const details = await articulesWoImages()
    res.json({success: true, details})
})

app.post('/new-message', async (req: express.Request, res: express.Response): Promise<void> => {
    await messageHandler(req, res)
    res.send('Done')
})

const PORT = configMode.app.port

app.listen(PORT, async () => {
    logger.log(JSON.stringify(configMode))
    logger.log(`Server running on port ${PORT}`)
    await loadDuringStartup()
    appDataSource.initialize()
        .then(ds => {
            logger.info('DB is connected: ' + JSON.stringify(ds.options.logging))
        })
        .catch((err) => logger.error(err))
    /*await sendMessage(configMode.bot.TELEGRAM_CHANNEL_EVENTS ?? '',
        'server restarted')*/
    //throw new Error('777')
})

let isEmitted = false

process.on('uncaughtException', async (err: Error) => {
    if (!isEmitted) {
        await sendMessage(configMode.bot.TELEGRAM_CHANNEL_HEALTH ?? '',
            err.stack ?? '')
        isEmitted = true
        throw err
    } else {
        isEmitted = false
    }
})
