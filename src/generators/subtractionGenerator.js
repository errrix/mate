import { getRandomDecimalStringByDigits, getRandomNumberByDigits } from './numberUtils';

function getComparableValue(value) {
    return Number(String(value).replace(',', '.'));
}

export function generateSubtraction(count, minuendDigits, subtrahendDigits, useDecimals = false) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        let minuend = useDecimals
            ? getRandomDecimalStringByDigits(minuendDigits)
            : getRandomNumberByDigits(minuendDigits);
        let subtrahend = useDecimals
            ? getRandomDecimalStringByDigits(subtrahendDigits)
            : getRandomNumberByDigits(subtrahendDigits);

        if (getComparableValue(subtrahend) > getComparableValue(minuend)) {
            [minuend, subtrahend] = [subtrahend, minuend];
        }

        examples.push({
            numbers: [minuend, subtrahend],
            operator: '-',
            type: 'subtraction'
        });
    }

    return examples;
}
