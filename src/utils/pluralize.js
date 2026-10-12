// Picks the Russian plural form: pluralize(3, ['лист', 'листа', 'листов']) -> 'листа'.
export function pluralize(count, [one, few, many]) {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return many;
    }

    if (lastDigit === 1) {
        return one;
    }

    return lastDigit >= 2 && lastDigit <= 4 ? few : many;
}
