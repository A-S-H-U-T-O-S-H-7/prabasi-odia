import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const ADMIN_USERS_COLLECTION = 'admins';

// ============ AVAILABLE PERMISSIONS ============
export const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', name: 'View Dashboard', category: 'Dashboard' },
  { id: 'view_users', name: 'View Users', category: 'Users' },
  { id: 'verify_users', name: 'Verify Users', category: 'Users' },
  { id: 'edit_users', name: 'Edit Users', category: 'Users' },
  { id: 'delete_users', name: 'Delete Users', category: 'Users' },
  { id: 'view_communities', name: 'View Communities', category: 'Communities' },
  { id: 'create_communities', name: 'Create Communities', category: 'Communities' },
  { id: 'edit_communities', name: 'Edit Communities', category: 'Communities' },
  { id: 'delete_communities', name: 'Delete Communities', category: 'Communities' },
  { id: 'view_events', name: 'View Events', category: 'Events' },
  { id: 'create_events', name: 'Create Events', category: 'Events' },
  { id: 'edit_events', name: 'Edit Events', category: 'Events' },
  { id: 'delete_events', name: 'Delete Events', category: 'Events' },
  { id: 'view_notices', name: 'View Notices', category: 'Notices' },
  { id: 'create_notices', name: 'Create Notices', category: 'Notices' },
  { id: 'edit_notices', name: 'Edit Notices', category: 'Notices' },
  { id: 'delete_notices', name: 'Delete Notices', category: 'Notices' },
  { id: 'view_admins', name: 'View Admins', category: 'Admins' },
  { id: 'create_admins', name: 'Create Admins', category: 'Admins' },
  { id: 'edit_admins', name: 'Edit Admins', category: 'Admins' },
  { id: 'delete_admins', name: 'Delete Admins', category: 'Admins' },
  { id: 'view_activity', name: 'View Activity Logs', category: 'Activity' },
  { id: 'manage_settings', name: 'Manage Settings', category: 'Settings' },
];

export const ROLE_PERMISSIONS = {
  super_admin: AVAILABLE_PERMISSIONS.map(p => p.id),
  admin: [
    'view_dashboard',
    'view_users', 'verify_users', 'edit_users',
    'view_communities', 'create_communities', 'edit_communities',
    'view_events', 'create_events', 'edit_events',
    'view_notices', 'create_notices', 'edit_notices',
    'view_activity',
    'manage_settings',
  ],
  
  
};

export const ROLES = [
  { id: 'super_admin', name: 'Super Admin', description: 'Full access to everything' },
  { id: 'admin', name: 'Admin', description: 'Most features except admin management' },
];

export const getAllAdmins = async () => {
  try {
    const adminsRef = collection(db, ADMIN_USERS_COLLECTION);
    const q = query(adminsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const admins: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      admins.push({
        id: doc.id,
        uid: data.uid || doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'admin',
        permissions: data.permissions || [],
        status: data.status || 'active',
        createdAt: data.createdAt || null,
        lastLoginAt: data.lastLoginAt || null,
      });
    });
    
    return { success: true, admins };
  } catch (error: any) {
    console.error('Error getting admins:', error);
    return { success: false, error: error.message, admins: [] };
  }
};

export const getAdminById = async (adminId: string) => {
  try {
    const adminRef = doc(db, ADMIN_USERS_COLLECTION, adminId);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
      return { success: false, error: 'Admin not found' };
    }
    
    const data = adminSnap.data();
    return {
      success: true,
      admin: {
        id: adminSnap.id,
        uid: data.uid || adminSnap.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'admin',
        permissions: data.permissions || [],
        status: data.status || 'active',
        createdAt: data.createdAt || null,
        lastLoginAt: data.lastLoginAt || null,
      }
    };
  } catch (error: any) {
    console.error('Error getting admin:', error);
    return { success: false, error: error.message };
  }
};

export const createAdmin = async (adminData: any) => {
  try {
    let permissions = adminData.permissions || [];
    if (adminData.role === 'super_admin') {
      permissions = AVAILABLE_PERMISSIONS.map(p => p.id);
    } else if (permissions.length === 0) {
      permissions = ROLE_PERMISSIONS[adminData.role as keyof typeof ROLE_PERMISSIONS] || [];
    }
    
    const adminRef = doc(db, ADMIN_USERS_COLLECTION, adminData.uid);
    await setDoc(adminRef, {
      uid: adminData.uid,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      permissions: permissions,
      status: adminData.status || 'active',
      password: adminData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    });
    
    return { success: true, id: adminData.uid };
    
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return { success: false, error: error.message };
  }
};

export const updateAdmin = async (adminId: string, adminData: any) => {
  try {
    const adminRef = doc(db, ADMIN_USERS_COLLECTION, adminId);
    
    let permissions = adminData.permissions || [];
    if (adminData.role === 'super_admin') {
      permissions = AVAILABLE_PERMISSIONS.map(p => p.id);
    } else if (permissions.length === 0) {
      permissions = ROLE_PERMISSIONS[adminData.role as keyof typeof ROLE_PERMISSIONS] || [];
    }
    
    const updateData: any = {
      name: adminData.name,
      role: adminData.role,
      permissions: permissions,
      status: adminData.status,
      updatedAt: new Date().toISOString(),
    };
    
    if (adminData.password) {
      updateData.password = adminData.password;
    }
    
    await updateDoc(adminRef, updateData);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAdmin = async (adminId: string) => {
  try {
    // 🔧 FIX: Check if admin exists first
    const adminResult = await getAdminById(adminId);
    if (!adminResult.success || !adminResult.admin) {
      return { success: false, error: 'Admin not found' };
    }
    
    const adminToDelete = adminResult.admin;
    
    // Prevent deleting last super admin
    if (adminToDelete.role === 'super_admin') {
      const allAdminsResult = await getAllAdmins();
      if (!allAdminsResult.success) {
        return { success: false, error: 'Failed to check super admin count' };
      }
      const superAdminCount = allAdminsResult.admins.filter((a: any) => a.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return { success: false, error: 'Cannot delete the only super admin' };
      }
    }
    
    await deleteDoc(doc(db, ADMIN_USERS_COLLECTION, adminId));
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return { success: false, error: error.message };
  }
};