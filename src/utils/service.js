export function numberToLetter(numb) {
    let temp, letter = ''
    while (numb > 0) {
        temp = (numb - 1) % 26
        letter = String.fromCharCode(temp + 65) + letter
        numb = (numb - temp - 1) / 26
    }
    return letter
}

export function uniqueTwoDimArr(arr, ind = 0) {
    const arrKeys = arr.map(el => el[ind])
    arr = arr.filter(
        (el, i) => arrKeys.indexOf(el[ind]) === i
    )
    return arr
}

export function convert2DimArrayInto1Dim(arr2d) {
    return [].concat.apply([], arr2d)
}

export function includesIgnoringCase(arr, searchVal) {
    searchVal = searchVal.toLowerCase()
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase() === searchVal) {
            return i
        }
    }
    return false
}

export function filterArray(arr, searchVal, isContainsWithMatchParts) {
    searchVal = searchVal.toLowerCase()
    if (isContainsWithMatchParts) {
        searchVal = '^.*' + searchVal.replaceAll(' ', '.*') + '.*$'
        return arr.filter(
            el => el.toLowerCase().match(searchVal)
        )
    } else {
        return arr.filter(
            el => el.toLowerCase().includes(searchVal)
        )
    }
}

export function lpad(val, width, z) {
    z = z || '0'
    width = width || 2
    val = val + ''
    return val.length >= width
        ? val :
        new Array(width - val.length + 1).join(z) + val
}

export function makeFirstLetterCapital(phrase) {
    phrase = phrase.toLowerCase()
    let res = ''
    let prev = null
    for (let a = 0; a < phrase.length; a++) {
        let smb = phrase.substring(a, a + 1)
        if (!prev || prev.match('\W')) {
            let temp = prev?.match('[:alpha:]')
            smb = smb.toUpperCase()
        }
        res += smb
        prev = smb
    }
    return res
}

export function slice2d(array, rowIndex, colIndex, numRows, numCols) {
    let result = []
    for (let i = rowIndex; i < (rowIndex + numRows); i++) {
        result.push(
            array[i].slice(colIndex, colIndex + numCols)
        )
    }
    return result
}
