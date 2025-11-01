/**
 * Generate a unique bill number
 * Format: ATA-YYYYMMDD-XXXXX
 * Example: ATA-20250101-00001
 */
export const generateBillNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-5); // Last 5 digits of timestamp for uniqueness
  
  return `ATA-${year}${month}${day}-${time}`;
};

/**
 * Format amount as Indian currency
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (date: Date | any): string => {
  if (!date) return '';
  
  const d = date.toDate ? date.toDate() : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};
