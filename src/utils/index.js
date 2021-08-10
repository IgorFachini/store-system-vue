
/**
 * Converts currency BRL string to float number
 * @param {String} str
 * @returns Number
 */
export function currencyToFloat (str) {
  if (typeof str === 'number') {
    return str
  }

  return Number(str.split('.').join('').split(',').join('.'))
}

/**
 * Convert number to BRl currency string
 * @param {Number} int
 * @return String
 */
export function toBRLCurrency (int) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(int))
}
