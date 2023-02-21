export function numberToLetter(numb) {

    let temp, letter = '';
    while (numb > 0) {
        temp = (numb - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        numb = (numb - temp - 1) / 26;
    }
    return letter;

}

export function uniqueTwoDimArr(arr, ind = 0) {
    const arrKeys = arr.map(el => el[ind])
    arr = arr.filter(
        (el, i) => arrKeys.indexOf(el[ind]) === i
    )
    return arr
}
