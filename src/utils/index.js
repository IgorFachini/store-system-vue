
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

/**
 * Convert data by field name contains Date to data Date object
 * @param {Array, Object, String} date
 * @param {String} fieldName
 * @param {function} customFormat
 * @returns {Array, Object, String, Boolean, null}
 */
export function covertDateFieldName (data, fieldName, customFormat) {
  if (Array.isArray(data)) return data.map(d => covertDateFieldName(d))
  if (typeof data === 'object') {
    for (const key in data) {
      data[key] = covertDateFieldName(data[key], key, customFormat)
    }
  }
  if ((typeof fieldName === 'string' || typeof fieldName === 'number') && fieldName.toLowerCase().includes('date')) return customFormat ? customFormat(data) : new Date(data)
  return data
}
