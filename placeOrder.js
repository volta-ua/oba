const SH_REM = 'REMOTE'
const ROW_BOT_HEADER = 2
const COL_KEY = 'status'
const STATUS_NEW = 'NEW'


export async function placeOrder(doc, order) {
    //await doc.loadInfo()
    const sheet = doc.sheetsByTitle[SH_REM]
    const rows = await sheet.getRows()
    let lastRow = 0

    for (let row of rows) {
        if (!row[COL_KEY]) {
            lastRow++
            break
        }
    }

    const insertedOrder = await sheet.addRow(
        {
            on: true,
            status: STATUS_NEW,
            phonePartner: order.phonePartner,
            orderId: order.orderId,
            delivType: order.delivType,
            phoneClient: order.phoneClient,
            nameClient: order.nameClient ?? '',
            npCity: order.npCity ?? '',
            npWh: order.npWh,
            npStreet: order.npStreet ?? '',
            npHouse: order.npHouse ?? '',
            npFlat: order.npFlat ?? '',
            upIndex: order.upIndex ?? '',
            pod: order.pod ?? '',
            item1: order.item1 ?? '',
            size1: order.size1 ?? '',
            qty1: order.qty1 ?? '',
            item2: order.item2 ?? '',
            size2: order.size2 ?? '',
            qty2: order.qty2 ??'',
            item3: order.item3 ?? '',
            size3: order.size3 ?? '',
            qty3: order.qty3 ?? '',
            item4: order.item4 ?? '',
            size4: order.size4 ?? '',
            qty4: order.qty4 ?? '',
            item5: order.item5 ?? '',
            size5: order.size5 ?? '',
            qty5: order.qty5 ?? '',
            note: order.note ?? '',
            createdAt: order.createdAt
        }
    )
    console.log('order placed')
}