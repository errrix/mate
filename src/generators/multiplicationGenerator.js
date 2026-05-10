/**
 * Генератор примеров на умножение
 */

/**
 * Генерирует случайное число заданной разрядности
 */
function getRange(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return { min, max };
}

function getRandomNumber(digits) {
    const { min, max } = getRange(digits);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLimitedFactors(firstDigits, secondDigits, maxResult) {
    const firstRange = getRange(firstDigits);
    const secondRange = getRange(secondDigits);

    if (firstRange.min * secondRange.min > maxResult) {
        throw new RangeError('Невозможно сгенерировать умножение с таким ограничением результата.');
    }

    const validFirstNumbers = [];
    for (let first = firstRange.min; first <= firstRange.max; first++) {
        if (first * secondRange.min <= maxResult) {
            validFirstNumbers.push(first);
        }
    }

    const first = validFirstNumbers[getRandomInRange(0, validFirstNumbers.length - 1)];
    const maxSecond = Math.min(secondRange.max, Math.floor(maxResult / first));
    const second = getRandomInRange(secondRange.min, maxSecond);

    return [first, second];
}

/**
 * Генерирует примеры на умножение
 * @param {number} count - количество примеров
 * @param {number} firstDigits - разрядность первого множителя
 * @param {number} secondDigits - разрядность второго множителя
 * @param {number} maxResult - максимальный результат (0 = без ограничений)
 * @returns {Array} массив примеров
 */
export function generateMultiplication(count, firstDigits, secondDigits, maxResult) {
    const examples = [];
    for (let i = 0; i < count; i++) {
        const [first, second] = maxResult > 0
            ? generateLimitedFactors(firstDigits, secondDigits, maxResult)
            : [getRandomNumber(firstDigits), getRandomNumber(secondDigits)];
        
        examples.push({ 
            numbers: [first, second],
            operator: '×',
            type: 'multiplication'
        });
    }
    return examples;
}
