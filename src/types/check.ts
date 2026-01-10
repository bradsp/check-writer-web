/**
 * Type definition for check data
 * Consolidates all check-related fields into a single type-safe object
 */
export interface CheckData {
  date: string;
  payee: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amount: string;
  memo: string;
}
