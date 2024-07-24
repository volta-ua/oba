import {states} from "./states"
import {TELEGRAM_SUPPORT} from "./common"

export const msgCancelOrder = '\n\n🛑🔙  Отменить и вернутся к началу: ' + states.HOME

export const msgGoToHome = '\n\n🔙  На главную страницу: ' + states.HOME

export const MSG_HELP = `Обратитесь в службу поддержки ${TELEGRAM_SUPPORT} случаях:\n · сбоя работы бота;\n\
 · отсутствии уведомления о принятии заказа в работу (24 часа в рабочии дни).\n\
 ✓ Обратите внимание на необходимую информацию для отправки заказа: в случае отсутствии оной отправить заказ не получится.\n\
 ✓ Обязательно нужно скинуть фото оплаты/предоплаты.\n\
 ✓ Обязательно нужно указать рабочее отделение доставки.\n\
 ✓ Поиск городов Новой Почты осуществляется на украинском языке.\n\
 ✓ Поиск наименований товара при проверке доступности осуществляется на русском языке. \
 В поиске можно использовать неколько частей слов: например, "мари кож" найдет модель "мариса.евро" цвета "чер.кож".\n\
 ✓ Поиск артикулов товара при проверке доступности осуществляется вводом 5-ти цифр.\n\
 Примечание: возможность отправки заказа в боте в состоянии разработки ${msgGoToHome}`

export const MSG_ABOUT = `Мы интернет-магазин "СТИЛЬНАЯ ОБУВЬ" - украинский производитель ЖЕНСКОЙ кожаной обуви.\n\
🌎Сайт: https://oba.com.ua\n\
🏆Telegram: https://t.me/artshoesua\n\
🤳Instagram: https://www.instagram.com/artshoes.ua/\n\
🔎Мониторинг посылок: ${process.env.URL_TTN}${msgGoToHome}`