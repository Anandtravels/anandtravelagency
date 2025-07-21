export interface EServiceFee {
  id: string;
  serviceType: 'pan_card' | 'passport' | 'aadhaar_pvc' | 'fd_credit_card' | 'bank_account';
  fee: string;
  description?: string;
  lastUpdated: Date;
  updatedBy: string;
}

export interface EServiceFeeFormData {
  pan_card: string;
  passport: string;
  aadhaar_pvc: string;
  fd_credit_card: string;
  bank_account: string;
}
