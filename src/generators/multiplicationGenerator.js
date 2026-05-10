/**
 * Генератор примеров на умножение
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
        let first = getRandomNumber(firstDigits);
        let second = getRandomNumber(secondDigits);
        let result = first * second;
        
        // Применяем ограничение на результат если задано
        if (maxResult > 0) {
            let attempts = 0;
            while (result > maxResult && attempts < 50) {
                first = getRandomNumber(firstDigits);
                second = getRandomNumber(secondDigits);
                result = first * second;
                attempts++;
            }
        }
        
        examples.push({ 
            numbers: [first, second],
            operator: '×',
            type: 'multiplication'
        });
    }
    return examples;
}
