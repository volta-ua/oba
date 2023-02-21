export function numberToLetter(numb) {

    let temp, letter = '';
    while (numb > 0) {
        temp = (numb - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        numb = (numb - temp - 1) / 26;
    }
    return letter;

}
