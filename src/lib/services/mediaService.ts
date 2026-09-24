import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

export type MediaKind = 'image' | 'video' | 'link';
export type MediaItem = {
  id: string;
  kind: MediaKind;
  title: string;
  url: string;
  storagePath?: string;
  createdAt: string;
};

const mediaCollection = collection(db, 'mediaItems');
const maxSize: Record<'image' | 'video', number> = { image: 20 * 1024 * 1024, video: 100 * 1024 * 1024 };

function mapItem(id: string, data: Record<string, unknown>): MediaItem {
  return {
    id,
    kind: data.kind === 'video' || data.kind === 'link' ? data.kind : 'image',
    title: String(data.title || ''),
    url: String(data.url || ''),
    storagePath: typeof data.storagePath === 'string' ? data.storagePath : undefined,
    createdAt: String(data.createdAt || ''),
  };
}

export function validateMediaFile(file: File, kind: 'image' | 'video') {
  if (!file.type.startsWith(`${kind}/`)) throw new Error(`${file.name} is not a supported ${kind} file.`);
  if (file.size === 0 || file.size > maxSize[kind]) throw new Error(`${file.name} must be under ${maxSize[kind] / 1024 / 1024} MB.`);
}

export function validateMediaLink(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString();
  } catch { /* The message below is shown for malformed URLs. */ }
  throw new Error('Enter a complete http or https link.');
}

export const mediaService = {
  async getItems(): Promise<MediaItem[]> {
    const snapshot = await getDocs(query(mediaCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(item => mapItem(item.id, item.data()));
  },

  async uploadFile(file: File, kind: 'image' | 'video', onProgress?: (percent: number) => void): Promise<MediaItem> {
    validateMediaFile(file, kind);
    const storagePath = `media/${kind}s/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    await new Promise<void>((resolve, reject) => task.on('state_changed',
      snapshot => onProgress?.(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)),
      reject,
      resolve,
    ));
    try {
      const url = await getDownloadURL(storageRef);
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const createdAt = new Date().toISOString();
      const result = await addDoc(mediaCollection, { kind, title, url, storagePath, createdAt });
      return { id: result.id, kind, title, url, storagePath, createdAt };
    } catch (error) {
      await deleteObject(storageRef).catch(() => {});
      throw error;
    }
  },

  async addLink(title: string, value: string): Promise<MediaItem> {
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length > 160) throw new Error('Link title must be 1–160 characters.');
    const url = validateMediaLink(value);
    const createdAt = new Date().toISOString();
    const result = await addDoc(mediaCollection, { kind: 'link', title: cleanTitle, url, createdAt });
    return { id: result.id, kind: 'link', title: cleanTitle, url, createdAt };
  },

  async updateLink(id: string, title: string, value: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length > 160) throw new Error('Link title must be 1–160 characters.');
    await updateDoc(doc(db, 'mediaItems', id), { title: cleanTitle, url: validateMediaLink(value) });
  },

  async deleteItem(item: MediaItem) {
    await deleteDoc(doc(db, 'mediaItems', item.id));
    if (item.storagePath) await deleteObject(ref(storage, item.storagePath)).catch(error => console.error('Media file cleanup failed', error));
  },
};
