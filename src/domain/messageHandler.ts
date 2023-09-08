import express from 'express'
import {
    COL_STK_ARTICUL,
    COL_STK_COLOUR,
    COL_STK_MODEL,
    COL_STK_MODEL_AND_COLOUR,
    COL_STK_PRICE_MANY,
    COL_STK_PRICE_ONE,
    COL_STK_SEASON,
    COL_STK_SIZE_L,
    IND_USER_CONF_MSG_AVAIL,
    MSG_AVAIL,
    MSG_CLEAR,
    MSG_NEW_ORDER,
    SIZES
} from '../config/constants'
import {states} from './states'
import logger from '../utils/logger'
import {sendMessage} from '../bot/bot'
import {MSG_ABOUT, MSG_HELP, msgCancelOrder, msgGoToHome} from './textForStages'
import {
    isLegalInputForRegExp,
    isValidPhonePartner
} from '../validation/validation'
import {filterArray, indexOfIgnoringCase} from '../utils/service'
import configMode from '../config/config'
import {TELEGRAM_SUPPORT} from './common'
import {
    arrStk,
    extractDataFromTableOrCache,
    getArrFromStock,
    images,
    userConf,
    usersRepo
} from './extractors'
import {
    composeButtonsFromArray,
    composeInitButtons,
} from './composeButtons'
import UserDto from '../entity/dto/UserDto'

// @ts-ignore// TODO REMOVE
export const messageHandler = async (req: express.Request, res: express.Response): Promise<express.Response | undefined> => {
    const message = req.body?.message ?? req.body?.edited_message
    const phonePartner = message?.contact?.phone_number?.trim()
    const photo = message?.photo ? message.photo[0] : null
    const chatId: string = message?.chat?.id ?? ''
    const user = await usersRepo.findOneBy({chat_id: chatId})
        ?? usersRepo.create(new UserDto(chatId))
    const messageText = message?.text?.trim()
    logger.info(JSON.stringify(req.body))
    if ((!messageText && !phonePartner && !photo) || !chatId) {
        return res.sendStatus(400)
    }
    switch (messageText) {
        case MSG_CLEAR:
        case states.HOME:
            user.state = states.HOME
            break
        case states.HELP:
            user.state = states.HELP
            break
        case states.ABOUT:
            user.state = states.ABOUT
            break
        case MSG_AVAIL:
            user.state = states.AVAIL
            break
        case MSG_NEW_ORDER:
        case states.NEW:
            user.state = states.NEW
            break
        default:
            if (!user.state) {
                user.state = states.HOME
            }
    }

    logger.info(user.state, messageText)

    switch (user.state) {
        case states.HOME:
            user.state = states.HOME
            let isPartner = !!user.phone
            let title = isPartner ? 'Партнер' : 'пользователь'
            let msgHome = '☀Уважаемый ' + title + '!\n' +
                'Рады приветствовать Вас в Telegram-боте компании производителя стильной женской обуви.\n' +
                '❓Справочная информация: ' + states.HELP + '\n' +
                '💁Поддержка: ' + TELEGRAM_SUPPORT + '\n' +
                'ℹПро компанию: ' + states.ABOUT +
                msgGoToHome
            await sendMessage(chatId, msgHome, composeInitButtons(isPartner))
            break

        case states.HELP :
            user.state = states.HELP
            await sendMessage(chatId, MSG_HELP)
            break

        case states.ABOUT:
            user.state = states.ABOUT
            await sendMessage(chatId, MSG_ABOUT)
            break

        case states.AVAIL:
            user.state = states.AVAIL
            if (messageText === MSG_AVAIL) {
                await extractDataFromTableOrCache()// TODO was await extractDataFromTableOrCache(true), but probably obsolete
                await sendMessage(
                    chatId,
                    'Введите артикул (5 цифр) или название товара (модель-цвет: достаточно несколько символов, в том числе не подряд)' +
                    msgGoToHome
                )
            } else {
                await extractDataFromTableOrCache()
                const MAX_ITEMS_LISTED = 50
                let dictItems
                let isArticul
                if (messageText.match('^[0-9]{5}$')) {
                    dictItems = getArrFromStock(COL_STK_ARTICUL)
                    isArticul = true
                } else {
                    dictItems = getArrFromStock(COL_STK_MODEL_AND_COLOUR)
                    isArticul = false
                }
                let item = messageText.toLowerCase()
                if (!isLegalInputForRegExp(item)) {
                    await sendMessage(chatId, 'Не допустимый ввод' + msgGoToHome)
                    return undefined
                }
                let actInd = indexOfIgnoringCase(dictItems, item)
                if (actInd === -1) {
                    let found = filterArray(dictItems, item, true)
                    let sizeFound = found?.length
                    if (!found || sizeFound === 0) {
                        let msgNotFound = isArticul
                            ? 'Введеный артикул \'' + item + '\' не существует. Повторите ввод'
                            : 'Введеный текст \'' + item +
                            '\' не найден в справочнике. Нужно вводить на русском языке. Повторите ввод'
                        await sendMessage(chatId, msgNotFound + msgGoToHome)
                    } else if (sizeFound > MAX_ITEMS_LISTED) {
                        await sendMessage(chatId, 'Найдено слишком много вариантов. ' +
                            'Попробуйте уточнить поиск. Повторите ввод' + msgGoToHome)
                    } else {
                        await sendMessage(chatId, 'Выберите товар из списка (найдено ' +
                            sizeFound + ')',
                            composeButtonsFromArray(found))
                    }
                } else {
                    let tuple = arrStk[actInd]
                    let actArt = tuple[COL_STK_ARTICUL - 1]
                    if (
                        actArt !== item &&
                        tuple[COL_STK_MODEL_AND_COLOUR - 1] !== item
                    ) {
                        await extractDataFromTableOrCache(true).then(
                            () => sendMessage(chatId, 'Подтвердите выбор', composeButtonsFromArray([item]))
                        )
                    }
                    let avail = ''
                    SIZES.forEach(
                        (size, i) =>
                            avail += tuple[COL_STK_SIZE_L - 1 + i] > 0
                                ? '\n' + '   ✓' + size + ':  ' + tuple[COL_STK_SIZE_L - 1 + i]
                                : ''
                    )
                    let msgWhenPhotoExist = images.includes(actArt)
                        ? '<a href="' + configMode.app.url + '/images/' + actArt + '.jpg' + '"> ‏ </a>'
                        : ''
                    let msg = actArt + '\n' +
                        tuple[COL_STK_MODEL - 1] + ' (' + tuple[COL_STK_COLOUR - 1] + ')' +
                        (avail || '\nНет в наличии') + '\n' +
                        'Цена ' + tuple[COL_STK_PRICE_ONE - 1] + ' / ' + tuple[COL_STK_PRICE_MANY - 1] + ' грн' + '\n' +
                        'Сезон ' + (tuple[COL_STK_SEASON - 1] ?? '').toLowerCase() + '\n' +
                        userConf[IND_USER_CONF_MSG_AVAIL] +
                        msgWhenPhotoExist +
                        msgGoToHome
                    await sendMessage(chatId, msg, {parse_mode: 'HTML'})
                }
            }
            break

        case states.NEW:
            user.state = states.PHONE_PARTNER
            /*user.order = new Order()
            await sendMessage(chatId, 'Для создания заказа необходимо распологать информацией:\n' +
                ' - имя клиента и номер телефона;\n' +
                ' - скрин оплаты;\n' +
                ' - тип доставки (Новая Почта/Укрпошта) и метод (отделение/почтомат/двери) для Новой Почты;\n' +
                ' - город и работающее отделение/почтомат Новой Почты;\n' +
                ' - город, улица, дом, квартира при адресной доставке Новой Почты;\n' +
                ' - индекс при доставке Укрпоштой;\n' +
                ' - артикул, размер, количество (до ' + MAX_POSITION_IN_ORDER + ' пар.)\n\n' +
                'Предоставьте свой номер телефона для идентификации',
                composeAuthButtons())*/
            break

        case states.PHONE_PARTNER:
            if (!isValidPhonePartner(phonePartner)) {
                await sendMessage(chatId, 'Данный телефонный номер не зарегистрирован для оформления заказа. ' +
                    'Используйте зарегистрированый номер.\n' +
                    'Для уточнения, какой номер зарегистрирован можете обратится к менеджеру ' +
                    TELEGRAM_SUPPORT + msgCancelOrder)
            } else {
                /*user.order = new Order()
                user.order.phonePartner = phonePartner.substring(1)
                user.state = states.DELIV_TYPE
                await sendMessage(chatId, 'Выберите тип доставки', composeTypeButtons())*/
            }
            break

        /*case states.DELIV_TYPE:
            switch (messageText) {
                case DELIV_TYPE_NP:
                    user.order.delivType = DELIV_TYPE_NP
                    break
                case DELIV_TYPE_NP_POD:
                    user.order.delivType = DELIV_TYPE_NP_POD
                    break
                case DELIV_TYPE_UP:
                    user.order.delivType = DELIV_TYPE_UP
                    break
                /*case DELIV_TYPE_OTHER:
                    user.order.delivType = null
                    break
                default:
                    await sendMessage(chatId, 'Тип доставки должен быть одним из перечисленных' +
                        msgCancelOrder, composeTypeButtons())
            }
            user.state = states.PHOTO_PAYM
            await sendMessage(chatId, 'Загрузите фотографию оплаты')
            break

        case states.PHOTO_PAYM:
            if (!await isValidPhotoPaym(photo)) {
                 await sendMessage(chatId,
                     'Загрузите фотографию оплаты (нажать кнопку в виде скрепки и отправить одну фотографию)' +
                     TELEGRAM_SUPPORT + msgCancelOrder)
             }
            switch (user.order.delivType) {
                case DELIV_TYPE_NP:
                case DELIV_TYPE_NP_POD:
                    user.state = states.NP_METHOD
                    await sendMessage(chatId, 'Выберите метод доставки Новой Почты', composeButtonsMethodNP())
                    break
                case DELIV_TYPE_UP:
                    user.state = states.CLIENT_NAME
                    await sendMessage(chatId, 'Фамилия имя клиента (2 слова через пробел)')
                    break
                /*case DELIV_TYPE_OTHER:
                    user.state = states.ITEM
                    await sendMessage(chatId, 'Артикул товара')
                    break
                default:
                    await sendMessage(chatId, 'Тип доставки должен быть одним из перечисленных' +
                        msgCancelOrder, composeTypeButtons())
            }
            break

        case states.NP_METHOD:
            if (!isValidNPmethod(messageText)) {
                await sendMessage(chatId, 'Метод доставки Новой Почты должен быть одним из перечисленных' +
                    msgCancelOrder, composeButtonsMethodNP())
            } else {
                user.order.npMethod = messageText
                user.state = states.CLIENT_NAME
                let msg = messageText === NP_METHOD_DOOR
                    ? 'Фамилия имя отчество клиента (3 слова через пробел)'
                    : 'Фамилия имя клиента (2 слова через пробел)'
                await sendMessage(chatId, msg)
            }
            break

        case states.CLIENT_NAME:
            let nameClient = makeFirstLetterCapital(messageText)
            if (!isClientNameValid(nameClient, user.order.npMethod)) {
            let msg = user.order.npMethod === NP_METHOD_DOOR
                ? 'Фамилия имя отчество клиента (3 слова через пробел).'
                : 'Фамилия имя клиента (2 слова через пробел).'
            msg += ' только буквы кирилличные'
            await sendMessage(chatId, 'Имя ' + nameClient + ' не прошло валидацию.\n' +
                msg + msgCancelOrder)
            } else {
                user.order.nameClient = nameClient
                user.state = states.CLIENT_PHONE
                await sendMessage(chatId, 'Телефон клиента в формате 067*******, 10 цифр')
            }
            break

        case states.CLIENT_PHONE:
            if (!isClientPhoneValid(messageText)) {
                await sendMessage(chatId, 'Телефон ' + messageText + ' не прошел валидацию.\n' +
                    'Телефон клиента в формате 067*********: 10 цифр без кода страны и пробелов' +
                    msgCancelOrder)
            } else {
                user.order.phoneClient = CODE_UA + messageText
                if (user.order.delivType === DELIV_TYPE_UP) {
                    user.state = states.UP_INDEX
                    await sendMessage(chatId, 'Индекс')
                } else {
                    user.state = states.NP_CITY
                    await sendMessage(chatId, 'Населенный пункт на украинском языке ' +
                        '(достаточно ввести несколько символов)')
                }
            }
            break

        case states.NP_CITY:
            const MAX_CITIES_LISTED = 15
            let city = makeFirstLetterCapital(messageText)
            if (!isLegalInputForRegExp(city)) {
                await sendMessage(chatId, 'Недопустимый ввод' +
                    msgCancelOrder)
                return undefined
            }
            const retrievedCities = await reloadArrCities()
            if (indexOfIgnoringCase(retrievedCities, city) === -1) {
                let found = filterArray(retrievedCities, city)
                let sizeFound = found?.length
                if (!found || sizeFound === 0) {
                    await sendMessage(chatId, 'Введеный текст \'' + city +
                        '\' не найден в справочнике. Населенный пункт нужно вводить на украинском языке. Повторите ввод' +
                        msgCancelOrder)
                } else if (sizeFound > MAX_CITIES_LISTED) {
                    await sendMessage(chatId, 'Найдено слишком много вариантов. ' +
                        'Попробуйте уточнить поиск. Повторите ввод' + msgCancelOrder)
                } else {
                    await sendMessage(chatId, 'Выберите населенный пункт из списка (найдено ' +
                        sizeFound + ')',
                        composeButtonsFromArray(found))
                }
            } else {
                user.order.npCity = city
                if (user.order.npMethod === NP_METHOD_DOOR) {
                    user.state = states.NP_STREET
                    await sendMessage(chatId, 'Улица (на украинском языке, только буквы)')
                } else {
                    user.state = states.NP_WH
                    await sendMessage(chatId,
                        'Номер отделения/почтомата (только цифры). Убедитесь, что работает')
                }
            }
            break

        case states.NP_WH:
            if (!isNpWhValid(messageText)) {
                await sendMessage(chatId, 'Номер отделения/почтомата не прошел валидацию.\n' +
                    'Только число' + msgCancelOrder)
            } else {
                user.order.npWh = messageText
                user.state = states.ITEM
                await sendMessage(chatId, 'Артикул товара')
            }
            break

        case states.NP_STREET:
            user.order.npStreet = messageText
            user.state = states.NP_HOUSE
            await sendMessage(chatId, 'Дом')
            break

        case states.NP_HOUSE:
            user.order.npHouse = messageText
            user.state = states.NP_FLAT
            await sendMessage(chatId, 'Квартира')
            break

        case states.NP_FLAT:
            user.order.npFlat = messageText
            user.state = states.ITEM
            await sendMessage(chatId, 'Артикул товара')
            break

        case states.UP_INDEX:
            if (!isUpIndexValid(messageText)) {
                await sendMessage(chatId, 'Индекс ' + messageText +
                    ' не прошел валидацию.\n' + 'Индекс отделения Укрпошты: 5 цифр.\n' +
                    'В случае, если введеный индекс корректный, но не принимается, сообщите менеджеру ' +
                    TELEGRAM_SUPPORT + msgCancelOrder)
            } else {
                user.order.upIndex = messageText
                user.state = states.ITEM
                await sendMessage(chatId, 'Артикул товара')
            }
            break

        case states.ITEM:
            if (!isItemValid(messageText, arrStk)) {
                await sendMessage(chatId, 'Артикул ' + messageText + ' не прошел валидацию.\n' +
                    'Артикул товара (5 цифр)' + msgCancelOrder)
            } else {
                user.order.lastItem = new Item(messageText)
                user.state = states.SIZE
                await sendMessage(chatId, 'Размер', composeSizeButtons())
            }
            break

        case states.SIZE:
            let size = parseInt(messageText)
            if (!isSizeValid(size, SIZES)) {
                await sendMessage(chatId, 'Размер ' + size + ' не прошел валидацию.\n' +
                    'Размер (число от ' + SIZES[0] + ' до ' + SIZES[SIZES.length - 1] + ')' +
                    msgCancelOrder, composeSizeButtons())
            } else {
                user.order.lastItem.size = size
                user.state = states.QTY
                await sendMessage(chatId, 'Кол-во', composeQtyButtons(MAX_QTY_IN_POSITION))
            }
            break

        case states.QTY:
            let qty = parseInt(messageText)
            if (!isQtyValid(qty, MAX_QTY_IN_POSITION)) {
                await sendMessage(chatId,
                    'Количество ' + qty + ' не прошло валидацию.\n' +
                    'Количество от 1 до ' + MAX_QTY_IN_POSITION + msgCancelOrder,
                    composeQtyButtons(MAX_QTY_IN_POSITION))
            } else {
                user.order.lastItem.qty = qty
                user.order.bucket.push(user.order.lastItem)
                user.state = states.SEND
                if (user.order.bucket.length === MAX_POSITION_IN_ORDER) {
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
                    user.state = states.ITEM
                    await sendMessage(chatId, 'Артикул товара')
                    break
                case MSG_SEND:
                    user.state = states.CREATED
                    let dt = new Date()
                    user.createdAt = dt
                    let orderId = '777'//generateOrderId(user, dt)
                    user.order.orderId = orderId
                    user.orders.push(user.order)
                    logger.debug(JSON.stringify(user))
                    await sendMessage(chatId, orderId + '\nЗаказ отправлен.\n' +
                        'В течение 24 часов (кроме выходных и праздничных дней) ' +
                        'Вы получите ответ от менеджера или в автоматическом режиме, что заказ принят.\n' +
                        'Важно: если не будет оповещения, то обратитесь к менеджеру ' +
                        TELEGRAM_SUPPORT + ' во избежание потери заказа!' + msgGoToHome)
                    //await placeOrder(docMain, user.order)
                    break
                case MSG_CLEAR:
                    user.state = states.HOME
                    await sendMessage(chatId, 'Заказ сброшен' + msgGoToHome)
                    break
                default:
                    if (Math.random() > 0.5) {//TODO SKIPPED user.order.bucket.length === MAX_POSITION_IN_ORDER) {
                        await sendMessage(chatId, 'Достигнут порог позиций в одном заказе. Отправить заказ?' +
                            msgCancelOrder, composOrderConfirmButtons())
                    } else {
                        await sendMessage(chatId, 'Добавить еще позицию или отправить заказ?' +
                            msgCancelOrder, composOrderConfirmButtons(true))
                    }
            }
            break

        default:
            logger.log('default for messageText ' + messageText)
            await sendMessage(chatId, 'Ответ не определен' +
                msgGoToHome + '.\nСправочная ифнормация находится по ' + states.HELP +
                '.\nПо определенным вопросам можете обратится к менеджеру ' + TELEGRAM_SUPPORT)
    */}
    return undefined
}
