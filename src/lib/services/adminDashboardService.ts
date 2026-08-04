import { db } from '@/lib/firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp 
} from 'firebase/firestore';

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  totalCommunities: number;
  totalEvents: number;
  totalNotices: number;
}

export interface AgeGroupData {
  name: string;
  value: number;
  color: string;
}

export interface StateData {
  state: string;
  count: number;
  color: string;
}

export interface GrowthData {
  date: string;
  count: number;
}

export interface CountryData {
  country: string;
  count: number;
  color: string;
}

export interface CountryStateAgeData {
  country: string;
  state: string;
  total: number;
  ageGroups: Record<string, number>;
}

export interface RecentUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  isVerified: boolean;
}

export const adminDashboardService = {
  getAgeFromUserData(userData: any): number | null {
    if (typeof userData.age === 'number' && userData.age > 0) {
      return userData.age;
    }

    if (typeof userData.dob === 'string' && userData.dob) {
      const birthDate = new Date(userData.dob);
      if (!Number.isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 0 ? age : null;
      }
    }

    return null;
  },

  getAgeGroup(age: number | null): string {
    if (age === null) return 'Unknown';
    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 34) return '25-34';
    if (age >= 35 && age <= 44) return '35-44';
    if (age >= 45 && age <= 54) return '45-54';
    if (age >= 55) return '55+';
    return 'Unknown';
  },

  // Get dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalUsers = 0;
      let verifiedUsers = 0;
      let pendingUsers = 0;
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        totalUsers++;
        if (data.isVerified) verifiedUsers++;
        if (data.hasJoinedCommunity && !data.isVerified) pendingUsers++;
      });
      
      const communitiesSnapshot = await getDocs(collection(db, 'communities'));
      const totalCommunities = communitiesSnapshot.size;
      
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;
      
      const noticesSnapshot = await getDocs(collection(db, 'notices'));
      const totalNotices = noticesSnapshot.size;
      
      return {
        totalUsers,
        verifiedUsers,
        pendingUsers,
        totalCommunities,
        totalEvents,
        totalNotices,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalUsers: 0,
        verifiedUsers: 0,
        pendingUsers: 0,
        totalCommunities: 0,
        totalEvents: 0,
        totalNotices: 0,
      };
    }
  },

  // Get age group distribution
  async getAgeGroupData(): Promise<AgeGroupData[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const ageGroups: Record<string, number> = {
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45-54': 0,
        '55+': 0,
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const age = this.getAgeFromUserData(data);
        if (age !== null) {
          const ageGroup = this.getAgeGroup(age);
          if (ageGroup !== 'Unknown') {
            ageGroups[ageGroup]++;
          }
        }
      });
      
      const colors = ['#6B1E5B', '#8A2E72', '#D9772B', '#E6A11C', '#34D399'];
      
      return Object.entries(ageGroups).map(([name, value], index) => ({
        name,
        value,
        color: colors[index] || '#8884d8',
      })).filter(item => item.value > 0);
    } catch (error) {
      console.error('Error getting age group data:', error);
      return [];
    }
  },

  // Get state-wise distribution
  async getStateData(): Promise<StateData[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const stateMap: Record<string, number> = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const state = data.currentState || data.odishaDistrict || 'Other';
        stateMap[state] = (stateMap[state] || 0) + 1;
      });
      
      const colors = ['#6B1E5B', '#8A2E72', '#D9772B', '#E6A11C', '#34D399', '#059669', '#0EA5E9', '#7C3AED', '#EC4899', '#14B8A6'];
      
      return Object.entries(stateMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([state, count], index) => ({
          state,
          count,
          color: colors[index % colors.length],
        }));
    } catch (error) {
      console.error('Error getting state data:', error);
      return [];
    }
  },

  // Get country-wise distribution
  async getCountryData(): Promise<CountryData[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const countryMap: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const country = (data.currentCountry || 'Unknown').trim();
        const safeCountry = country || 'Unknown';
        countryMap[safeCountry] = (countryMap[safeCountry] || 0) + 1;
      });

      const colors = ['#6B1E5B', '#8A2E72', '#D9772B', '#E6A11C', '#34D399', '#059669', '#0EA5E9', '#7C3AED', '#EC4899', '#14B8A6'];

      return Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count], index) => ({
          country,
          count,
          color: colors[index % colors.length],
        }));
    } catch (error) {
      console.error('Error getting country data:', error);
      return [];
    }
  },

  // Get country + state wise age groups
  async getCountryStateAgeData(): Promise<CountryStateAgeData[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const matrix: Record<string, CountryStateAgeData> = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const country = (data.currentCountry || 'Unknown').trim() || 'Unknown';
        const state = (data.currentState || 'Unknown').trim() || 'Unknown';
        const key = `${country}__${state}`;

        if (!matrix[key]) {
          matrix[key] = {
            country,
            state,
            total: 0,
            ageGroups: {
              '18-24': 0,
              '25-34': 0,
              '35-44': 0,
              '45-54': 0,
              '55+': 0,
              Unknown: 0,
            },
          };
        }

        const age = this.getAgeFromUserData(data);
        const ageGroup = this.getAgeGroup(age);
        matrix[key].ageGroups[ageGroup] = (matrix[key].ageGroups[ageGroup] || 0) + 1;
        matrix[key].total += 1;
      });

      return Object.values(matrix)
        .sort((a, b) => b.total - a.total)
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting country state age data:', error);
      return [];
    }
  },

  // Get user growth data (last 30 days)
  async getGrowthData(days: number = 30): Promise<GrowthData[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const now = new Date();
      const dateMap: Record<string, number> = {};
      
      // Initialize all dates with 0
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        dateMap[key] = 0;
      }
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        if (createdAt) {
          let dateStr;
          if (createdAt.toDate) {
            dateStr = createdAt.toDate().toISOString().split('T')[0];
          } else {
            dateStr = new Date(createdAt).toISOString().split('T')[0];
          }
          if (dateMap[dateStr] !== undefined) {
            dateMap[dateStr]++;
          }
        }
      });
      
      // Convert to cumulative growth
      let cumulative = 0;
      const result = Object.entries(dateMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => {
          cumulative += count;
          return { date, count: cumulative };
        });
      
      return result;
    } catch (error) {
      console.error('Error getting growth data:', error);
      return [];
    }
  },

  // Get recent users
  async getRecentUsers(limitCount: number = 5): Promise<RecentUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const users: RecentUser[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          displayName: data.displayName || 'Unknown',
          email: data.email || '',
          photoURL: data.photoURL || '',
          createdAt: data.createdAt || new Date().toISOString(),
          isVerified: data.isVerified || false,
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  },

  // Get top communities by member count
  async getTopCommunities(limitCount: number = 5) {
    try {
      const snapshot = await getDocs(collection(db, 'communities'));
      
      const communities: { id: string; name: string; memberCount: number }[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        communities.push({
          id: doc.id,
          name: data.name || 'Unknown',
          memberCount: data.memberCount || 0,
        });
      });
      
      return communities
        .sort((a, b) => b.memberCount - a.memberCount)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting top communities:', error);
      return [];
    }
  },
};