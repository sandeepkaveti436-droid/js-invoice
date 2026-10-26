const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertUnderThousand(num: number): string {
  let s = '';
  if (num >= 100) {
    s += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    s += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    s += ONES[num] + ' ';
  }
  return s.trim();
}

/**
 * Converts a monetary number to words (e.g. 1250.50 -> "One Thousand Two Hundred Fifty Dollars and Fifty Cents Only")
 */
export function numberToWords(amount: number, currencyCode = 'INR'): string {
  const safeAmount = Math.max(0, Math.round(amount * 100) / 100);
  const integerPart = Math.floor(safeAmount);
  const decimalPart = Math.round((safeAmount - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return 'Zero';

  let result = '';

  const billions = Math.floor(integerPart / 1000000000);
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (billions > 0) result += convertUnderThousand(billions) + ' Billion ';
  if (millions > 0) result += convertUnderThousand(millions) + ' Million ';
  if (thousands > 0) result += convertUnderThousand(thousands) + ' Thousand ';
  if (remainder > 0) result += convertUnderThousand(remainder) + ' ';

  const currencyUnit = currencyCode === 'INR' ? 'Rupees' : currencyCode === 'EUR' ? 'Euros' : currencyCode === 'GBP' ? 'Pounds' : 'Dollars';
  const subunit = currencyCode === 'INR' ? 'Paise' : 'Cents';

  result = result.trim() + ' ' + currencyUnit;

  if (decimalPart > 0) {
    result += ` and ${convertUnderThousand(decimalPart)} ${subunit}`;
  }

  return result.trim() + ' Only';
}
