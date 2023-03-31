import {lpad} from "../utils/service";

export function generateOrderId(user: any, dt: Date) {
    return 'N' + Object.keys(user)[0] +
        dt.getFullYear().toString().substring(2) +
        lpad(dt.getMonth() + 1) +
        lpad(dt.getDate()) +
        lpad(dt.getHours()) +
        lpad(dt.getMinutes()) +
        (user.orders ? user.orders.length : 0) + 1
}
