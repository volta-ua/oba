import Item from "./Item";

export default class Order {
    orderId: string | undefined
    createdAt: Date | undefined
    bucket: Item[]
    lastItem: Item
    delivType: string | undefined
    npMethod?: string | undefined
    npWh?: string | undefined
    npCity?: string | undefined
    npStreet?: string | undefined
    npHouse?: string | undefined
    npFlat?: string | undefined
    nameClient?: string | undefined
    phoneClient?: string | undefined
    phonePartner?: string | undefined
    upIndex?: string | undefined
}
