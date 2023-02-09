import axios from 'axios'
import express from 'express'
import {GoogleSpreadsheet} from 'google-spreadsheet'
import {
    isValidPhonePartner, isClientNameValid, isValidNPmethod, isClientPhoneValid,
    isNpWhValid, isUpIndexValid, isItemValid, isSizeValid, isQtyValid, isValidPhotoPaym,
    isLegalInputForRegExp
} from './validation/validation.js'
import {
    composeAuthButtons, composeInitButtons, composeButtonsFromArray, composeNPmethodButtons,
    composeQtyButtons, composeSizeButtons, composeTypeButtons, composOrderConfirmButtons
} from './proc/compositor.js'
import {placeOrder} from './proc/placeOrder.js'
import {
    convert2DimArrayInto1Dim,
    filterArray,
    includesIgnoringCase,
    makeFirstLetterCapital,
    slice2d
} from './service/service.js'
import {generateOrderId} from "./proc/util.js"
import configMode from "./config.js"

console.log(JSON.stringify(configMode))

export const CONF = {skip_validation: true}
export const MSG_NEW_ORDER = 'СОЗДАТЬ ЗАКАЗ'
export const MSG_AVAIL = 'НАЛИЧИЕ ТОВАРА'
export const MSG_AUTH = 'АВТОРИЗАЦИЯ'
export const MSG_CLEAR = 'ОТМЕНА'
export const MSG_ADD_POSITION = 'ДОБАВИТЬ ПОЗИЦИЮ'
export const MSG_SEND = 'ОТПРАВИТЬ'
export const DELIV_TYPE_NP = 'НОВАЯ ПОЧТА'
export const DELIV_TYPE_NP_POD = 'НОВАЯ ПОЧТА (налож. платеж)'
export const DELIV_TYPE_UP = 'УКРПОШТА'
export const DELIV_TYPE_OTHER = 'ПРОЧЕЕ'
export const NP_METHOD_WH = 'ОТДЕЛЕНИЕ'
export const NP_METHOD_POST = 'ПОЧТОМАТ'
export const NP_METHOD_DOOR = 'ДВЕРИ'

const TELEGRAM_URI = `https://api.telegram.org/bot${configMode.bot.TELEGRAM_API_TOKEN}`
const TELEGRAM_URI_SEND_MESSAGE = `${TELEGRAM_URI}/sendMessage`
export const TELEGRAM_URI_FILE = `https://api.telegram.org/file/bot${configMode.bot.TELEGRAM_API_TOKEN}`
export const TELEGRAM_URI_FILE_ID = `${TELEGRAM_URI}/getFile?file_id=`
const TELEGRAM_SUPPORT = process.env.TELEGRAM_SUPPORT

const SH_DICT = 'DICT'
const ADDR_DICT_CITIES = 'P2:P'
const ADDR_DICT_USER_CONF = 'B14:B14'
const IND_USER_CONF_MSG_AVAIL = 0
const SH_STK = 'STOCK'
const COL_STK_MODEL_AND_COLOUR = 1
const COL_STK_ARTICUL = 2
const COL_STK_MODEL = 5
const COL_STK_COLOUR = 6
const COL_STK_SISE_L = 7
const COL_STK_PRICE_ONE = 15
const COL_STK_PRICE_MANY = 16
const COL_STK_SEASON = 19
const ADDR_STK_DATA = 'A4:S'
const MAX_POSITION_IN_ORDER = 5
const MAX_QTY_IN_POSITION = 10

const CODE_UA = '38'
const SIZES = [35, 36, 37, 38, 39, 40, 41]
const RELOAD_STK_MS = 5 * 60 * 1000

const app = express()

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)
await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
})

const ctx = {
    'reload_stk_last_date': new Date()
}

const users = {}

const states = {
    HOME: '/home',
    HELP: '/help',
    ABOUT: '/about',
    AVAIL: '/avail',
    NEW: '/new_order',
    PHONE_PARTNER: 'PHONE_PARTNER',
    DELIV_TYPE: 'DELIV_TYPE',
    PHOTO_PAYM: 'PHOTO_PAYM',
    NP_METHOD: 'NP_METHOD',
    TYPE_NP: 'новая почта',
    TYPE_UP: 'укрпошта',
    TYPE_OTHER: 'прочее',
    CLIENT_NAME: 'NAME_CLIENT',
    CLIENT_PHONE: 'PHONE_CLIENT',
    NP_DELIV: 'NP_DELIV',
    NP_CITY: 'NP_CITY',
    NP_WH: 'NP_WH',
    NP_STREET: 'NP_STREET',
    NP_HOUSE: 'NP_HOUSE',
    NP_FLAT: 'NP_FLAT',
    UP_INDEX: 'UP_INDEX',
    ITEM: 'ITEM',
    SIZE: 'SIZE',
    QTY: 'QTY',
    SEND: 'SEND',
    CREATED: 'CREATED'
}

function msgCancelOrder() {
    return '\n   >>>>  Чтобы отменить и вернутся к началу нажмите ' + states.HOME
}

function msgGoToHome() {
    return '\n   >>>>  Вернутся на главную страницу: ' + states.HOME
}

app.get('/', async (req, res) => {
    res.send('App is working now')
})

app.post('/reload', async (rec, res) => {
    await reloadAll()
    console.log('reloaded externally')
    res.json({status: 'ok'})
})

app.post('/new-message', async (req, res) => {
    const message = req.body?.message ?? req.body?.edited_message
    const phonePartner = message?.contact?.phone_number?.trim()
    const photo = message?.photo ? message.photo[0] : null
    const chatId = message?.chat?.id
    let messageText = message?.text?.trim()
    console.info('====================')
    console.info(JSON.stringify(req.body))
    console.info('====================')
    if ((!messageText && !phonePartner && !photo) || !chatId) {
        return res.sendStatus(400)
    }

    let actState

    switch (messageText) {
        case MSG_CLEAR:
        case states.HOME:
            actState = states.HOME
            break
        case states.HELP:
            actState = states.HELP
            break
        case states.ABOUT:
            actState = states.ABOUT
            break
        case MSG_AVAIL:
            actState = states.AVAIL
            break
        case MSG_NEW_ORDER:
        case states.NEW:
            actState = states.NEW
            break
        default:
            if (!users[chatId]?.state) {
                actState = states.HOME
            } else {
                actState = users[chatId].state
            }
    }

    console.log({actState, messageText})

    switch (actState) {
        case states.HELP :
            users[chatId] = {state: states.HELP}
            let msgHelp = 'Обратитесь в службу поддержки ' + TELEGRAM_SUPPORT + ' случаях:\n' +
                ' - сбоя работы бота;\n' +
                ' - отсутствии уведомления о принятии заказа в работу (24 часа в рабочии дни).\n' +
                'Обратите внимание на необходимую информацию для отправки заказа: в случае отсутствии оной отправить заказ не получится.\n' +
                'Обязательно нужно скинуть фото оплаты/предоплаты.\n' +
                'Обязательно нужно указать рабочее отделение доставки.\n' +
                'Поиск городов Новой Почты осуществляется на украинском языке.\n' +
                'Поиск наименований товара при проверке доступности осуществляется на русском языке. В поиске можно использовать неколько частей слов: например, "мари кож" найдет модель "мариса.евро" цвета "чер.кож".\n' +
                'Поиск артикулов товара при проверке доступности осуществляется вводом 5-ти цифр.\n' +
                'Примечание: возможность отправки заказа в боте в состоянии разработки\n' +
                msgGoToHome()
            await sendMessage(chatId, msgHelp)
            break

        case states.ABOUT:
            users[chatId] = {state: states.ABOUT}
            let msgAbout = 'Мы интернет-магазин "СТИЛЬНАЯ ОБУВЬ" - украинский производитель ЖЕНСКОЙ кожаной обуви.\n' +
                'Сайт: https://oba.com.ua\n' +
                'Telegram: https://t.me/artshoesua\n' +
                'Instagram: https://www.instagram.com/artshoes.ua/\n' +
                'Мониторинг посылок: ' + process.env.URL_TTN + '\n' +
                msgGoToHome()
            await sendMessage(chatId, msgAbout)
            break

        case states.AVAIL:
            users[chatId] = {state: states.AVAIL}
            if (messageText === MSG_AVAIL) {
                await extractDataFromTableOrCache(true)
                await sendMessage(
                    chatId,
                    'Введите артикул (5 цифр) или название товара (модель-цвет: достаточно несколько символов, в том числе не подряд).' +
                    msgGoToHome()
                )
            } else {
                await extractDataFromTableOrCache()
                    .then(
                        async () => {
                            const MAX_ITEMS_LISTED = 50
                            let dictItems = null
                            let isArticul = null
                            if (messageText.match('^[0-9]{5}$')) {
                                dictItems = await getDictArticuls()
                                isArticul = true
                            } else {
                                dictItems = await getDictModelAndColour()
                                isArticul = false
                            }
                            let item = messageText.toLowerCase()
                            if (!isLegalInputForRegExp(item)) {
                                await sendMessage(chatId, 'Не допустимый ввод' + msgGoToHome())
                                return
                            }
                            let actInd = includesIgnoringCase(dictItems, item)
                            if (actInd === false) {
                                let found = filterArray(dictItems, item, true)
                                let sizeFound = found?.length
                                if (!found || sizeFound === 0) {
                                    let msgNotFound = isArticul
                                        ? 'Введеный артикул \'' + item + '\' не существует. Повторите ввод.'
                                        : 'Введеный текст \'' + item +
                                        '\' не найден в справочнике. Нужно вводить на русском языке. Повторите ввод.'
                                    await sendMessage(chatId, msgNotFound + msgGoToHome())
                                } else if (sizeFound > MAX_ITEMS_LISTED) {
                                    await sendMessage(chatId, 'Найдено слишком много вариантов. ' +
                                        'Попробуйте уточнить поиск. Повторите ввод.' + msgGoToHome())
                                } else {
                                    await sendMessage(chatId, 'Выберите товар из списка (найдено ' +
                                        sizeFound + ')',
                                        composeButtonsFromArray(found))
                                }
                            } else {
                                let tuple = arrStk[actInd]
                                if (
                                    tuple[COL_STK_ARTICUL - 1] !== item &&
                                    tuple[COL_STK_MODEL_AND_COLOUR - 1] !== item
                                ) {
                                    await extractDataFromTableOrCache(true).then(
                                        () => sendMessage(chatId, 'Подтвердите выбор', composeButtonsFromArray([item]))
                                    )
                                }
                                let avail = ''
                                SIZES.forEach(
                                    (size, i) =>
                                        avail += tuple[COL_STK_SISE_L - 1 + i] > 0
                                            ? '\n' + '   ✓' + size + ':  ' + tuple[COL_STK_SISE_L - 1 + i]
                                            : ''
                                )
                                let msg = tuple[COL_STK_ARTICUL - 1] + '\n' +
                                    tuple[COL_STK_MODEL - 1] + ' (' + tuple[COL_STK_COLOUR - 1] + ')' +
                                    (avail || '\nНет в наличии') + '\n' +
                                    'Цена ' + tuple[COL_STK_PRICE_ONE - 1] + ' / ' + tuple[COL_STK_PRICE_MANY - 1] + ' грн' + '\n' +
                                    'Сезон ' + tuple[COL_STK_SEASON - 1].toLowerCase() + '\n' +
                                    userConf[IND_USER_CONF_MSG_AVAIL] +
                                    msgGoToHome()
                                await sendMessage(chatId, msg)
                            }
                        }
                    )
            }
            break

        case states.HOME:
            users[chatId] = {state: states.HOME}
            let msgHome = 'Добрый день!\n' +
                'Рады приветствовать Вас в Telegram-боте компании производителя стильной женской обуви.\n' +
                'Справочная информация: ' + states.HELP + '\n' +
                'Поддержка: ' + TELEGRAM_SUPPORT + '\n' +
                'Про компанию: ' + states.ABOUT + '\n' +
                msgGoToHome()
            await sendMessage(chatId, msgHome, composeInitButtons())
            break

        case states.NEW:
            users[chatId] = {state: states.PHONE_PARTNER, order: null}
            await sendMessage(chatId, 'Для создания заказа необходимо распологать информацией:\n' +
                ' - имя клиента и номер телефона;\n' +
                ' - скрин оплаты;\n' +
                ' - тип доставки (Новая Почта/Укрпошта) и метод (отделение/почтомат/двери) для Новой Почты;\n' +
                ' - город и работающее отделение/почтомат Новой Почты;\n' +
                ' - город, улица, дом, квартира при адресной доставке Новой Почты;\n' +
                ' - индекс при доставке Укрпоштой;\n' +
                ' - артикул, размер, количество (до ' + MAX_POSITION_IN_ORDER + ' пар.)\n\n' +
                'Предоставьте свой номер телефона для идентификации',
                composeAuthButtons())
            break

        case states.PHONE_PARTNER:
            if (!isValidPhonePartner(phonePartner)) {
                await sendMessage(chatId, 'Данный телефонный номер не зарегистрирован для оформления заказа. ' +
                    'Используйте зарегистрированый номер.\n' +
                    'Для уточнения, какой номер зарегистрирован можете обратится к менеджеру ' +
                    TELEGRAM_SUPPORT + '.' + msgCancelOrder())
            } else {
                users[chatId].order = {}
                users[chatId].order.phonePartner = phonePartner.substring(1)
                users[chatId].state = states.DELIV_TYPE
                await sendMessage(chatId, 'Выберите тип доставки', composeTypeButtons())
            }
            break

        case states.DELIV_TYPE:
            switch (messageText) {
                case DELIV_TYPE_NP:
                    users[chatId].order.delivType = DELIV_TYPE_NP
                    break
                case DELIV_TYPE_NP_POD:
                    users[chatId].order.delivType = DELIV_TYPE_NP_POD
                    break
                case DELIV_TYPE_UP:
                    users[chatId].order.delivType = DELIV_TYPE_UP
                    break
                /*case DELIV_TYPE_OTHER:
                    users[chatId].order.delivType = null
                    break*/
                default:
                    await sendMessage(chatId, 'Тип доставки должен быть одним из перечисленных.' +
                        msgCancelOrder(), composeTypeButtons())
            }
            users[chatId].state = states.PHOTO_PAYM
            await sendMessage(chatId, 'Загрузите фотографию оплаты')
            break

        case states.PHOTO_PAYM:
            if (!isValidPhotoPaym(photo)) {
                await sendMessage(chatId,
                    'Загрузите фотографию оплаты (нажать кнопку в виде скрепки и отправить одну фотографию)' +
                    TELEGRAM_SUPPORT + '.' + msgCancelOrder())
            }
            switch (users[chatId].order.delivType) {
                case DELIV_TYPE_NP:
                case DELIV_TYPE_NP_POD:
                    users[chatId].state = states.NP_METHOD
                    await sendMessage(chatId, 'Выберите метод доставки Новой Почты', composeNPmethodButtons())
                    break
                case DELIV_TYPE_UP:
                    users[chatId].state = states.CLIENT_NAME
                    await sendMessage(chatId, 'Фамилия имя клиента (2 слова через пробел)')
                    break
                /*case DELIV_TYPE_OTHER:
                    users[chatId].state = states.ITEM
                    await sendMessage(chatId, 'Артикул товара')
                    break*/
                default:
                    await sendMessage(chatId, 'Тип доставки должен быть одним из перечисленных.' +
                        msgCancelOrder(), composeTypeButtons())
            }
            break

        case states.NP_METHOD:
            if (!isValidNPmethod(messageText)) {
                await sendMessage(chatId, 'Метод доставки Новой Почты должен быть одним из перечисленных.' +
                    msgCancelOrder(), composeNPmethodButtons())
            } else {
                users[chatId].order.npMethod = messageText
                users[chatId].state = states.CLIENT_NAME
                let msg = messageText === NP_METHOD_DOOR
                    ? 'Фамилия имя отчество клиента (3 слова через пробел)'
                    : 'Фамилия имя клиента (2 слова через пробел)'
                await sendMessage(chatId, msg)
            }
            break

        case states.CLIENT_NAME:
            let nameClient = makeFirstLetterCapital(messageText)
            if (!isClientNameValid(nameClient, users[chatId].order.npMethod)) {
                let msg = users[chatId].order.npMethod === NP_METHOD_DOOR
                    ? 'Фамилия имя отчество клиента (3 слова через пробел).'
                    : 'Фамилия имя клиента (2 слова через пробел).'
                msg += ' только буквы кирилличные.'
                await sendMessage(chatId, 'Имя ' + nameClient + ' не прошло валидацию.\n' +
                    msg + msgCancelOrder())
            } else {
                users[chatId].order.nameClient = nameClient
                users[chatId].state = states.CLIENT_PHONE
                await sendMessage(chatId, 'Телефон клиента в формате 067*******, 10 цифр')
            }
            break

        case states.CLIENT_PHONE:
            if (!isClientPhoneValid(messageText)) {
                await sendMessage(chatId, 'Телефон ' + messageText + ' не прошел валидацию.\n' +
                    'Телефон клиента в формате 067*********: 10 цифр без кода страны и пробелов.' +
                    msgCancelOrder())
            } else {
                users[chatId].order.phoneClient = CODE_UA + messageText
                if (users[chatId].order.delivType === DELIV_TYPE_UP) {
                    users[chatId].state = states.UP_INDEX
                    await sendMessage(chatId, 'Индекс')
                } else {
                    users[chatId].state = states.NP_CITY
                    await sendMessage(chatId, 'Населенный пункт на украинском языке ' +
                        '(достаточно ввести несколько символов)')
                }
            }
            break

        case states.NP_CITY:
            const MAX_CITIES_LISTED = 15
            let city = makeFirstLetterCapital(messageText)
            if (!isLegalInputForRegExp(city)) {
                await sendMessage(chatId, 'Недопустимый ввод.' +
                    msgCancelOrder())
                return
            }
            const retrievedCities = await retrieveCities()
            if (!includesIgnoringCase(retrievedCities, city)) {
                let found = filterArray(retrievedCities, city)
                let sizeFound = found?.length
                if (!found || sizeFound === 0) {
                    await sendMessage(chatId, 'Введеный текст \'' + city +
                        '\' не найден в справочнике. Населенный пункт нужно вводить на украинском языке. Повторите ввод.' +
                        msgCancelOrder())
                } else if (sizeFound > MAX_CITIES_LISTED) {
                    await sendMessage(chatId, 'Найдено слишком много вариантов. ' +
                        'Попробуйте уточнить поиск. Повторите ввод.' + msgCancelOrder())
                } else {
                    await sendMessage(chatId, 'Выберите населенный пункт из списка (найдено ' +
                        sizeFound + ')',
                        composeButtonsFromArray(found))
                }
            } else {
                users[chatId].order.npCity = city
                if (users[chatId].order.npMethod === NP_METHOD_DOOR) {
                    users[chatId].state = states.NP_STREET
                    await sendMessage(chatId, 'Улица (на украинском языке, только буквы)')
                } else {
                    users[chatId].state = states.NP_WH
                    await sendMessage(chatId,
                        'Номер отделения/почтомата (только цифры). Убедитесь, что работает')
                }
            }
            break

        case states.NP_WH:
            if (!isNpWhValid(messageText)) {
                await sendMessage(chatId, 'Номер отделения/почтомата не прошел валидацию.\n' +
                    'Только число.' + msgCancelOrder())
            } else {
                users[chatId].order.npWh = messageText
                users[chatId].state = states.ITEM
                await sendMessage(chatId, 'Артикул товара')
            }
            break

        case states.NP_STREET:
            users[chatId].order.npStreet = messageText
            users[chatId].state = states.NP_HOUSE
            await sendMessage(chatId, 'Дом')
            break

        case states.NP_HOUSE:
            users[chatId].order.npHouse = messageText
            users[chatId].state = states.NP_FLAT
            await sendMessage(chatId, 'Квартира')
            break

        case states.NP_FLAT:
            users[chatId].order.npFlat = messageText
            users[chatId].state = states.ITEM
            await sendMessage(chatId, 'Артикул товара')
            break

        case states.UP_INDEX:
            if (!isUpIndexValid(messageText)) {
                await sendMessage(chatId, 'Индекс ' + messageText +
                    ' не прошел валидацию.\n' + 'Индекс отделения Укрпошты: 5 цифр.\n' +
                    'В случае, если введеный индекс корректный, но не принимается, сообщите менеджеру ' +
                    TELEGRAM_SUPPORT + '.' + msgCancelOrder())
            } else {
                users[chatId].order.upIndex = messageText
                users[chatId].state = states.ITEM
                await sendMessage(chatId, 'Артикул товара')
            }
            break

        case states.ITEM:
            if (!isItemValid(messageText)) {
                await sendMessage(chatId, 'Артикул ' + messageText + ' не прошел валидацию.\n' +
                    'Артикул товара (5 цифр).' + msgCancelOrder())
            } else {
                let pos = users[chatId].order.pos ?? 0
                pos++
                users[chatId].order.pos = pos
                users[chatId].order['item' + pos] = messageText
                users[chatId].state = states.SIZE
                await sendMessage(chatId, 'Размер', composeSizeButtons())
            }
            break

        case states.SIZE:
            let size = parseInt(messageText)
            if (!isSizeValid(size, SIZES)) {
                await sendMessage(chatId, 'Размер ' + size + ' не прошел валидацию.\n' +
                    'Размер (число от ' + SIZES[0] + ' до ' + SIZES[SIZES.length - 1] + ').' +
                    msgCancelOrder(), composeSizeButtons())
            } else {
                let pos = users[chatId].order.pos
                users[chatId].order['size' + pos] = size
                users[chatId].state = states.QTY
                await sendMessage(chatId, 'Кол-во', composeQtyButtons(MAX_QTY_IN_POSITION))
            }
            break

        case states.QTY:
            let qty = parseInt(messageText)
            if (!isQtyValid(qty, MAX_QTY_IN_POSITION)) {
                await sendMessage(chatId,
                    'Количество ' + qty + ' не прошло валидацию.\n' +
                    'Количество от 1 до ' + MAX_QTY_IN_POSITION + '.' + msgCancelOrder(),
                    composeQtyButtons(MAX_QTY_IN_POSITION))
            } else {
                let pos = users[chatId].order.pos
                users[chatId].order['qty' + pos] = qty
                users[chatId].state = states.SEND
                if (pos === MAX_POSITION_IN_ORDER) {
                    await sendMessage(chatId, 'Достигнут порог позиций в одном заказе. Отправить заказ?',
                        composOrderConfirmButtons())
                } else {
                    await sendMessage(chatId, 'Добавить еще позицию или отправить заказ?',
                        composOrderConfirmButtons(true))
                }
            }
            break

        case states.SEND:
            switch (messageText) {
                case MSG_ADD_POSITION:
                    users[chatId].state = states.ITEM
                    await sendMessage(chatId, 'Артикул товара')
                    break
                case MSG_SEND:
                    users[chatId].state = states.CREATED
                    let dt = new Date()
                    users[chatId].order.createdAt = dt
                    let orderId = generateOrderId(users, dt)
                    users[chatId].order.orderId = orderId
                    let orders = users[chatId].orders ?? []
                    orders.push(users[chatId].order)
                    users[chatId].orders = orders
                    console.debug(JSON.stringify(users))
                    await sendMessage(chatId, orderId + '\nЗаказ отправлен.\n' +
                        'В течение 24 часов (кроме выходных и праздничных дней) ' +
                        'Вы получите ответ от менеджера или в автоматическом режиме, что заказ принят.\n' +
                        'Важно: если не будет оповещения, то обратитесь к менеджеру ' +
                        TELEGRAM_SUPPORT + ' во избежание потери заказа!' + msgGoToHome())
                    await placeOrder(doc, users[chatId].order)
                    break
                case MSG_CLEAR:
                    users[chatId].state = states.HOME
                    await sendMessage(chatId, 'Заказ сброшен.' + msgGoToHome())
                    break
                default:
                    let pos = users[chatId].order.pos
                    if (pos === MAX_POSITION_IN_ORDER) {
                        await sendMessage(chatId, 'Достигнут порог позиций в одном заказе. Отправить заказ?' +
                            msgCancelOrder(), composOrderConfirmButtons())
                    } else {
                        await sendMessage(chatId, 'Добавить еще позицию или отправить заказ?' +
                            msgCancelOrder(), composOrderConfirmButtons(true))
                    }
            }
            break

        default:
            console.log('default for messageText ' + messageText)
            await sendMessage(chatId, 'Ответ не определен.' +
                msgGoToHome() + '.\nСправочная ифнормация находится по ' + states.HELP +
                '.\nПо определенным вопросам можете обратится к менеджеру ' + TELEGRAM_SUPPORT)
    }

    async function sendMessage(chatId, text, options) {
        try {
            await axios.post(TELEGRAM_URI_SEND_MESSAGE, {
                chat_id: chatId, text: text, ...options
            })
            res.send('Done')
        } catch (e) {
            console.log(e)
            res.send(e)
        }
    }

    async function sendPhoto(chatId, photo, caption, options) {
        try {
            await axios.post(TELEGRAM_URI_PHOTO, {
                chat_id: chatId, photo: photo, caption: caption, ...options
            })
            res.send('Done')
        } catch (e) {
            console.log(e)
            res.send(e)
        }
    }

})

async function reloadAll() {
    await extractDataFromTableOrCache(true)
    await reloadUserConf()
}

async function extractDataFromTableOrCache(isForce) {
    let dtNow = new Date()
    if (isForce || dtNow.getTime() - ctx.reload_stk_last_date.getTime() > RELOAD_STK_MS) {
        await reloadInfo()
        await reloadStk()
        ctx.reload_stk_last_date = dtNow
    }
    console.log('extractDataFromTableOrCache done with reload_stk_last_date = ' + ctx.reload_stk_last_date)
}

async function reloadInfo() {
    await doc.loadInfo()
        .then(res => console.log('reloadInfo done'))
}

let arrStk = null

async function reloadStk() {
    arrStk = await doc.sheetsByTitle[SH_STK].getCellsInRange(ADDR_STK_DATA)
    console.log('reloadStk done')
}

let userConf = null

async function reloadUserConf() {
    const sheet = doc.sheetsByTitle[SH_DICT]
    userConf = await sheet.getCellsInRange(ADDR_DICT_USER_CONF)
    userConf = convert2DimArrayInto1Dim(userConf)
    console.log('reloadUserConf done ')
}

async function retrieveCities() {
    const sheet = doc.sheetsByTitle[SH_DICT]
    let cities = await sheet.getCellsInRange(ADDR_DICT_CITIES)
    cities = convert2DimArrayInto1Dim(cities)
    console.log('retrieveCities done')
    return cities
}

async function getDictModelAndColour() {
    let modelAndColours = slice2d(arrStk, 0, COL_STK_MODEL_AND_COLOUR - 1, arrStk.length, 1)
    modelAndColours = convert2DimArrayInto1Dim(modelAndColours)
    console.log('getDictModelAndColour done')
    return modelAndColours
}

async function getDictArticuls() {
    let articuls = slice2d(arrStk, 0, COL_STK_ARTICUL - 1, arrStk.length, 1)
    articuls = convert2DimArrayInto1Dim(articuls)
    console.log('getDictArticuls done')
    return articuls
}

await reloadAll()
await getDictModelAndColour()
await getDictArticuls()

const PORT = configMode.app.port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
