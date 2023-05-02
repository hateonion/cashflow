export function convertCurrencyStringToNumber(currencyString: string): number {
  const numberWithCommas = currencyString.replace(/[^-0-9.,]/g, '');
  const number = parseFloat(numberWithCommas.replace(/,/g, ''));
  return number;
}