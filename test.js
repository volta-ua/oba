import TblImageScanner from "./src/google-sheet/models/TblImageScanner.js";
import {config} from "dotenv";

async function check() {
    /*
    const obj = {arr: [1, 2]}

    obj.arr.forEach(
        el => console.log(el)
    )
    */

    config()
    const newTable = TblImageScanner.createInstance()
    const newTable2 = TblImageScanner.createInstance()
}

check()
