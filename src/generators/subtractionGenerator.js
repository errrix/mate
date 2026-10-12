import { getRandomDecimalStringByDigits, getRandomInRange, getRandomNumberByDigits } from './numberUtils';

const MAX_NON_ZERO_ATTEMPTS = 20;

function getComparableValue(value) {
    return Number(String(value).replace(',', '.'));
}

function getOperandsWithinLimit(limit, random) {
    if (limit < 2) {
        throw new RangeError('Невозможно составить вычитание с таким пределом.');
    }

    // Two distinct numbers up to the limit, so every valid example is equally likely.
    const first = getRandomInRange(1, limit, random);
    const second = getRandomInRange(1, limit - 1, random);
    const other = second >= first ? second + 1 : second;

    return [Math.max(first, other), Math.min(first, other)];
}

function getOperandsByDigits(minuendDigits, subtrahendDigits, useDecimals, random) {
    let minuend = useDecimals
        ? getRandomDecimalStringByDigits(minuendDigits, random)
        : getRandomNumberByDigits(minuendDigits, random);
    let subtrahend = useDecimals
        ? getRandomDecimalStringByDigits(subtrahendDigits, random)
        : getRandomNumberByDigits(subtrahendDigits, random);

    if (getComparableValue(subtrahend) > getComparableValue(minuend)) {
        [minuend, subtrahend] = [subtrahend, minuend];
    }

    return [minuend, subtrahend];
}

export function generateSubtraction(
    count,
    minuendDigits,
    subtrahendDigits,
    useDecimals = false,
    { limit = 0, random = Math.random } = {}
) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        let numbers;
        let attempts = 0;

        // Re-roll examples whose answer is zero; they are not worth a line on the sheet.
        do {
            numbers = limit > 0
                ? getOperandsWithinLimit(limit, random)
                : getOperandsByDigits(minuendDigits, subtrahendDigits, useDecimals, random);
            attempts++;
        } while (
            getComparableValue(numbers[0]) === getComparableValue(numbers[1])
            && attempts < MAX_NON_ZERO_ATTEMPTS
        );

        examples.push({
            numbers,
            operator: '−',
            type: 'subtraction'
        });
    }

    return examples;
}
