import {lpad} from "../service/service.js";

export function generateOrderId(user, dt) {
    return 'N' + Object.keys(user)[0] +
        dt.getFullYear().toString().substring(2) +
        lpad(dt.getMonth() + 1) +
        lpad(dt.getDate()) +
        lpad(dt.getHours()) +
        lpad(dt.getMinutes()) +
        (user.orders ? user.orders.length : 0) + 1
}
