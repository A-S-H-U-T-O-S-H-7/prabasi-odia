import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'site_settings';

// Default settings
const DEFAULT_SETTINGS = {
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    whatsapp: '',
  },
  contact: {
    phone1: '+91 99999 99999',
    phone2: '',
    contactEmail: 'hello@prabasiodia.com',
    address: 'Bhubaneswar, Odisha, India',
  },
};

// Get all settings
export const getSettings = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return { success: true, settings: settingsSnap.data() };
    } else {
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      return { success: true, settings: DEFAULT_SETTINGS };
    }
  } catch (error: any) {
    console.error('Error getting settings:', error);
    return { success: false, error: error.message, settings: DEFAULT_SETTINGS };
  }
};

// Update social links
export const updateSocialLinks = async (socialData: any, adminData?: any) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await updateDoc(settingsRef, {
      social: socialData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminData?.uid || 'admin',
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating social links:', error);
    return { success: false, error: error.message };
  }
};

// Update contact settings
export const updateContactSettings = async (contactData: any, adminData?: any) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await updateDoc(settingsRef, {
      contact: contactData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminData?.uid || 'admin',
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating contact settings:', error);
    return { success: false, error: error.message };
  }
};

// Get contact info for Contact page & Footer
export const getContactInfo = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        success: true,
        contact: data.contact || DEFAULT_SETTINGS.contact,
        social: data.social || DEFAULT_SETTINGS.social,
      };
    }
    return {
      success: true,
      contact: DEFAULT_SETTINGS.contact,
      social: DEFAULT_SETTINGS.social,
    };
  } catch (error: any) {
    console.error('Error getting contact info:', error);
    return { success: false, contact: null, social: null };
  }
};

// Get social links for Footer
export const getSocialLinks = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        success: true,
        social: data.social || DEFAULT_SETTINGS.social,
      };
    }
    return { success: true, social: DEFAULT_SETTINGS.social };
  } catch (error: any) {
    console.error('Error getting social links:', error);
    return { success: false, social: null };
  }
};