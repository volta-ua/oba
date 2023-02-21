import {ImageLoader} from "./imageLoader.js";

export async function updateImagesOnServer() {
    const imageLoader = new ImageLoader()
    await imageLoader.downloadFile('1t5wIvs47KbuHqw0TBL4RW3M4-w7vSMA5')
}
