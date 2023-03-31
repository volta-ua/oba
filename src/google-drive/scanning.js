import logger from "../utils/logger.ts";

const getAllFoldersInclSubfolders = (folderId, subpath) => {
    subpath = subpath ?? ''
    let arr = []
    if (!subpath) {
        res = getRootFolderData(folderId)
        arr = res.arr
        subpath = res.rootFolder
    }
    arr = arr.concat(getAllFoldersInFolder(folderId, subpath))
    let subfolders = DriveApp.getFolderById(folderId).getFolders()
    while (subfolders.hasNext()) {
        let folder = subfolders.next()
        arr = arr.concat(getAllFoldersInclSubfolders(folder.getId(), subpath + '/' + folder.getName()))
    }
    return arr
}


const getAllFoldersInFolder = (folderId, subpath) => {

    subpath = subpath ?? ''

    let arr = []
    let folders = DriveApp.getFolderById(folderId).getFolders()

    while (folders.hasNext()) {
        let folder = folders.next()
        arr.push(
            [
                folder.getId(), folder.getUrl(),
                folder.getName(),
                subpath + '/' + folder.getName(),
                folder.getSize(),
                folder.getOwner().getEmail(),
                folder.getEditors().map(user => user.getEmail()),
                folder.getViewers().map(user => user.getEmail()),
                folder.getDateCreated(), folder.getLastUpdated()
            ]
        )
    }

    logger.log('getAllFoldersInFolder: ' + arr)
    return arr

}
