export function numberToLetter(numb: number): string {
    let temp, letter = ''
    while (numb > 0) {
        temp = (numb - 1) % 26
        letter = String.fromCharCode(temp + 65) + letter
        numb = (numb - temp - 1) / 26
    }
    return letter
}

export function uniqueTwoDimArr(arr: any[][], ind = 0): any[][] {
    const arrKeys = arr.map(el => el[ind])
    arr = arr.filter(
        (el, i) => arrKeys.indexOf(el[ind]) === i
    )
    return arr
}

export function convert2DimArrayInto1Dim(arr2d: any[][]): any[] {
    return [].concat.apply([], arr2d)
}

export function indexOfIgnoringCase(arr: string[], searchVal: string): number {
    searchVal = searchVal.toLowerCase()
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase() === searchVal) {
            return i
        }
    }
    return -1
}

export function filterArray(arr: string[], searchVal: string, isContainsWithMatchParts: boolean = false): string[] {
    searchVal = searchVal.toLowerCase()
    if (isContainsWithMatchParts) {
        searchVal = '^.*' + searchVal.replace(new RegExp(' ', 'g'), '.*') + '.*$'
        return arr.filter(
            el => el.toLowerCase().match(searchVal)
        )
    } else {
        return arr.filter(
            el => el.toLowerCase().includes(searchVal)
        )
    }
}

export function lpad(val: string | number, width: number = 2, z: string = '0'): string {
    val = val + ''
    return val.length >= width
        ? val :
        new Array(width - val.length + 1).join(z) + val
}

export function makeFirstLetterCapital(phrase: string): string {
    phrase = phrase.toLowerCase()
    let res = ''
    let prev = null
    for (let a = 0; a < phrase.length; a++) {
        let smb = phrase.substring(a, a + 1)
        if (!prev || prev.match('\W')) {
            //let temp = prev?.match('[:alpha:]')
            smb = smb.toUpperCase()
        }
        res += smb
        prev = smb
    }
    return res
}

export function slice2d(array: any[][], rowIndex: number, colIndex: number, numRows: number, numCols: number): any[][] {
    let result = []
    for (let i = rowIndex; i < (rowIndex + numRows); i++) {
        result.push(
            array[i].slice(colIndex, colIndex + numCols)
        )
    }
    return result
}
