/**
 * Utility functions for CPF validation, masking, and privacy display
 */

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function formatCPF(cpf: string): string {
  const digits = cleanCPF(cpf).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCPFForPrivacy(cpf?: string): string {
  if (!cpf) return 'Não informado';
  const digits = cleanCPF(cpf);
  if (digits.length !== 11) return 'Não informado';
  const lastTwo = digits.slice(9);
  return `***.***.***-${lastTwo}`;
}

export function isValidCPF(cpf: string): boolean {
  const clean = cleanCPF(cpf);

  if (clean.length !== 11) return false;

  // Reject repetitive numbers (e.g., 000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Validate 1st digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  // Validate 2nd digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}
