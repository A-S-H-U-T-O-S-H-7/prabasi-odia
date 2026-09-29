export const INVESTMENT_SECTORS = ['Technology', 'Healthcare', 'Education', 'Agriculture', 'Manufacturing', 'Real Estate', 'Retail', 'Hospitality', 'Other'] as const;

export type InvestmentStatus = 'pending' | 'approved' | 'rejected' | 'closed';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  currency: 'INR' | 'USD';
  sector: string;
  details: string;
  place: string;
  preferredLocation: string;
  ownerId: string;
  status: InvestmentStatus;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentInterest {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  status: 'new' | 'reviewed' | 'contacted';
  createdAt: string;
}

export type InvestmentInterestDetails = Pick<InvestmentInterest, 'name' | 'email' | 'phone' | 'location' | 'message'>;
