export interface EServiceRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: 'pan_card' | 'passport' | 'aadhaar_pvc' | 'fd_credit_card' | 'bank_account';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDetails: {
    // Common fields
    address?: string;
    dateOfBirth?: string;
    
    // PAN Card specific
    fatherName?: string;
    panCardType?: 'individual' | 'company' | 'trust' | 'huf';
    
    // Passport specific
    passportType?: 'ordinary' | 'diplomatic' | 'official';
    placeOfBirth?: string;
    emergencyContact?: string;
    
    // Aadhaar PVC specific
    aadhaarNumber?: string;
    
    // FD/Credit Card specific
    bankPreference?: string;
    employmentType?: 'salaried' | 'self_employed' | 'business' | 'retired';
    monthlyIncome?: string;
    cardType?: 'savings' | 'current' | 'fixed_deposit' | 'credit_card';
    
    // Bank Account specific
    accountType?: 'savings' | 'current' | 'salary';
    initialDeposit?: string;
    nomineeName?: string;
    nomineeRelation?: string;
  };
  documents?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  adminNotes?: string;
  created_at: Date;
  updated_at?: Date;
  updated_by?: string;
  assignedAgent?: string;
  assignedAt?: any;
}

export interface EServiceFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  requestDetails: Record<string, any>;
}

export const E_SERVICE_TYPES = {
  pan_card: {
    label: 'PAN Card Application',
    description: 'Apply for a new PAN card or reissue/correction of existing PAN card',
    icon: '📄',
    estimatedTime: '15-20 working days',
    documents: ['Photo', 'Identity Proof', 'Address Proof', 'Date of Birth Proof'],
    fee: '₹107 (New) / ₹107 (Reissue)'
  },
  passport: {
    label: 'Passport Application',
    description: 'Fresh passport application or passport renewal services',
    icon: '📖',
    estimatedTime: '30-45 working days',
    documents: ['Photo', 'Birth Certificate', 'Address Proof', 'Identity Proof'],
    fee: '₹1,500 (36 pages) / ₹2,000 (60 pages)'
  },
  aadhaar_pvc: {
    label: 'Aadhaar PVC Card',
    description: 'Order Aadhaar PVC card (plastic card) for durability',
    icon: '🆔',
    estimatedTime: '7-10 working days',
    documents: ['Aadhaar Number', 'Registered Mobile Number'],
    fee: '₹50'
  },
  fd_credit_card: {
    label: 'FD/Credit Card Assistance',
    description: 'Fixed deposit account opening and credit card application assistance',
    icon: '💳',
    estimatedTime: '10-15 working days',
    documents: ['Identity Proof', 'Address Proof', 'Income Proof', 'Bank Statements'],
    fee: 'As per bank charges'
  },
  bank_account: {
    label: 'Bank Account Opening',
    description: 'Assistance with opening savings, current, or salary accounts',
    icon: '🏦',
    estimatedTime: '3-7 working days',
    documents: ['Identity Proof', 'Address Proof', 'Photo', 'Initial Deposit'],
    fee: 'As per bank charges'
  }
} as const;
