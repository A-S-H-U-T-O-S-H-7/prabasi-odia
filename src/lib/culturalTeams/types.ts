export const CULTURAL_ART_FORMS = ['Dance', 'Music', 'Folk performance', 'Theatre', 'Storytelling', 'Visual arts', 'Mixed arts', 'Other'] as const;
export const TRAVEL_SCOPES = ['states', 'national', 'international'] as const;
export type TravelScope = typeof TRAVEL_SCOPES[number];
export type CulturalTeamStatus = 'pending' | 'approved' | 'rejected';
export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
] as const;

export interface CulturalTeamImage { url: string; path: string; }
export interface CulturalTeam {
  id: string;
  ownerId: string;
  name: string;
  artForm: string;
  description: string;
  baseCity: string;
  baseState: string;
  baseCountry: string;
  memberCount: number;
  languages: string;
  travelScopes: TravelScope[];
  availableStates: string[];
  images: CulturalTeamImage[];
  status: CulturalTeamStatus;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}
export type CulturalTeamDraft = Pick<CulturalTeam, 'name' | 'artForm' | 'description' | 'baseCity' | 'baseState' | 'baseCountry' | 'memberCount' | 'languages' | 'travelScopes' | 'availableStates'>;
export interface CulturalTeamContact { ownerId: string; contactName: string; email: string; phone: string; }
export interface CulturalTeamEnquiry {
  id: string;
  teamId: string;
  teamName: string;
  organiserName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: EnquiryStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}
export type CulturalTeamEnquiryDraft = Pick<CulturalTeamEnquiry, 'organiserName' | 'email' | 'phone' | 'eventType' | 'eventDate' | 'eventLocation' | 'message'>;
