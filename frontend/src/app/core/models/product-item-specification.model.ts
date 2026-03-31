/**
 * Specifications stored as nested objects keyed by category name.
 * Each category contains field key → value pairs.
 *
 * Example:
 * {
 *   network: { technology: ['GSM', 'LTE'], bands2G: ['GSM850', 'GSM900'] },
 *   body:    { dimensions: '162.8 x 77.6 x 8.2 mm', weight: '218 g', esim: true },
 *   display: { type: 'Dynamic AMOLED 2X', size: '6.9 inches' },
 * }
 */
export type ProductItemSpecification = Record<string, Record<string, any>>;
