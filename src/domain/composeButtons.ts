import {
    DELIV_TYPE_NP, DELIV_TYPE_NP_POD, DELIV_TYPE_UP, NP_METHOD_WH, NP_METHOD_POST,
    NP_METHOD_DOOR, MSG_CLEAR, MSG_SEND, MSG_ADD_POSITION, MSG_AVAIL, MSG_AUTH
} from '../config/constants'

export const composeInitButtons = () => {
    return {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'one_time_keyboard': true,
            'keyboard': [
                [MSG_AVAIL]
            ]
        }
    }
}

export const composeAuthButtons = () => {
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

export const composeTypeButtons = () => {
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

export const composeButtonsMethodNP = () => {
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

export const composeSizeButtons = () => {
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

export const composeQtyButtons = (qtyMax: number) => {
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

export const composeButtonsFromArray = (arr: string[]) => {
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

export const composOrderConfirmButtons = (isNext: boolean = false) => {
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
