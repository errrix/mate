export function getDigitRange(digits) {
    const min = 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    return { min, max };
}

export function getRandomInRange(min, max) {
    if (max < min) {
        throw new RangeError('Invalid random range.');
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomNumberByDigits(digits) {
    const { min, max } = getDigitRange(digits);
    return getRandomInRange(min, max);
}

export function getRandomDecimalStringByDigits(digits, decimalPlaces = 2) {
    const integerPart = getRandomNumberByDigits(digits);
    const decimalMax = 10 ** decimalPlaces - 1;
    const decimalPart = getRandomInRange(1, decimalMax)
        .toString()
        .padStart(decimalPlaces, '0');

    return `${integerPart},${decimalPart}`;
}
