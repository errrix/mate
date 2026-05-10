/**
 * Генератор примеров на вычитание
 */

/**
 * Генерирует случайное число заданной разрядности
 */
function getRandomNumber(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Генерирует примеры на вычитание
 * @param {number} count - количество примеров
 * @param {number} minuendDigits - разрядность уменьшаемого
 * @param {number} subtrahendDigits - разрядность вычитаемого
 * @returns {Array} массив примеров
 */
export function generateSubtraction(count, minuendDigits, subtrahendDigits) {
    const examples = [];
    for (let i = 0; i < count; i++) {
        let minuend = getRandomNumber(minuendDigits);
        let subtrahend = getRandomNumber(subtrahendDigits);
        
        // Гарантируем неотрицательный результат
        if (subtrahend > minuend) {
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
