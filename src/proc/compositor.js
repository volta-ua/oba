import {
    DELIV_TYPE_NP, DELIV_TYPE_NP_POD, DELIV_TYPE_UP, DELIV_TYPE_OTHER,
    NP_METHOD_WH, NP_METHOD_POST, NP_METHOD_DOOR,
    MSG_CLEAR, MSG_SEND, MSG_ADD_POSITION, MSG_NEW_ORDER, MSG_AVAIL, MSG_AUTH
} from '../index.js'

export function composeInitButtons() {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': [
                [MSG_NEW_ORDER],
                [MSG_AVAIL]
            ]
        }
    }
}

export function composeAuthButtons() {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': [
                [{
                    text: MSG_AUTH,
                    request_contact: true
                }],
                [MSG_CLEAR]
            ]
        }
    }
}

export function composeTypeButtons() {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': [
                [{text: DELIV_TYPE_NP}],
                [{text: DELIV_TYPE_NP_POD}],
                [{text: DELIV_TYPE_UP}]
            ]
        }
    }
}

export function composeNPmethodButtons() {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': [
                [{text: NP_METHOD_WH}],
                [{text: NP_METHOD_POST}],
                [{text: NP_METHOD_DOOR}]
            ]
        }
    }
}

export function composeSizeButtons() {
    let buttons = [
        [{text: '35'}, {text: '36'}, {text: '37'}, {text: '38'}],
        [{text: '39'}, {text: '40'}, {text: '41'}, {text: '-'}],
    ]
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'resize_keyboard': true,
            'keyboard': buttons
        }
    }
}

export function composeQtyButtons(qtyMax) {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': '_'.repeat(qtyMax).split('_').map(
                i => [{text: i}]
            )
        }
    }
}

export function composeButtonsFromArray(arr) {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': arr.map(
                el => [{text: el}]
            )
        }
    }
}

export function composOrderConfirmButtons(isNext) {
    let buttons = isNext ? [[{text: MSG_ADD_POSITION}]] : []
    buttons.push([{text: MSG_SEND}])
    buttons.push([{text: MSG_CLEAR}])
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': buttons
        }
    }
}
