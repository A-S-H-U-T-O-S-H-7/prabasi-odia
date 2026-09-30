import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

export interface MagazineIssue {
  id: string;
  title: string;
  issueMonth: string;
  description: string;
  pdfUrl: string;
  coverUrl: string;
  pdfPath: string;
  coverPath: string;
  pageCount: number;
  pageRatio: number;
  fileSize: number;
  createdAt: string;
}

const collectionName = 'magazines';
const magazines = collection(db, collectionName);
const maxPdfSize = 100 * 1024 * 1024;

function mapIssue(id: string, data: Record<string, unknown>): MagazineIssue {
  return {
    id,
    title: String(data.title || ''),
    issueMonth: String(data.issueMonth || ''),
    description: String(data.description || ''),
    pdfUrl: String(data.pdfUrl || ''),
    coverUrl: String(data.coverUrl || ''),
    pdfPath: String(data.pdfPath || ''),
    coverPath: String(data.coverPath || ''),
    pageCount: Number(data.pageCount || 0),
    pageRatio: Number(data.pageRatio || 0.707),
    fileSize: Number(data.fileSize || 0),
    createdAt: String(data.createdAt || ''),
  };
}

async function uploadBlob(path: string, blob: Blob, onProgress?: (percent: number) => void) {
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, blob, { contentType: blob.type });
  await new Promise<void>((resolve, reject) => {
    task.on('state_changed',
      (snapshot) => onProgress?.(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)),
      reject,
      resolve
    );
  });
  return getDownloadURL(storageRef);
}

async function preparePdf(file: File) {
  if (file.size === 0 || file.size > maxPdfSize || !/\.pdf$/i.test(file.name)) {
    throw new Error('Choose a PDF file up to 100 MB.');
  }
  const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (header !== '%PDF-') throw new Error('The selected file is not a valid PDF.');

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;
  try {
    const page = await pdf.getPage(1);
    const original = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 720 / original.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create the magazine cover.');
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const cover = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create the magazine cover.')), 'image/jpeg', 0.85);
    });
    return { cover, pageCount: pdf.numPages, pageRatio: original.width / original.height };
  } finally {
    await task.destroy();
  }
}

export const magazineService = {
  async getIssues(): Promise<MagazineIssue[]> {
    const snapshot = await getDocs(query(magazines, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((item) => mapIssue(item.id, item.data()));
  },

  async getIssue(id: string): Promise<MagazineIssue | null> {
    const snapshot = await getDoc(doc(db, collectionName, id));
    return snapshot.exists() ? mapIssue(snapshot.id, snapshot.data()) : null;
  },

  async uploadIssue(
    file: File,
    details: { title: string; issueMonth: string; description: string },
    onProgress?: (percent: number) => void
  ): Promise<MagazineIssue> {
    const title = details.title.trim();
    if (!title || title.length > 160) throw new Error('Enter a title up to 160 characters.');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(details.issueMonth)) {
      throw new Error('Choose a valid issue month.');
    }
    const { cover, pageCount, pageRatio } = await preparePdf(file);
    const issueRef = doc(magazines);
    const pdfPath = `magazines/${issueRef.id}/issue.pdf`;
    const coverPath = `magazines/${issueRef.id}/cover.jpg`;
    const uploadedPaths: string[] = [];

    try {
      uploadedPaths.push(pdfPath);
      const pdfUrl = await uploadBlob(pdfPath, file, onProgress);
      uploadedPaths.push(coverPath);
      const coverUrl = await uploadBlob(coverPath, cover);
      const issue: MagazineIssue = {
        id: issueRef.id,
        title,
        issueMonth: details.issueMonth,
        description: details.description.trim(),
        pdfUrl,
        coverUrl,
        pdfPath,
        coverPath,
        pageCount,
        pageRatio,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
      };
      await setDoc(issueRef, issue);
      return issue;
    } catch (error) {
      await Promise.allSettled(uploadedPaths.map((path) => deleteObject(ref(storage, path))));
      throw error;
    }
  },

  async deleteIssue(issue: MagazineIssue) {
    await deleteDoc(doc(db, collectionName, issue.id));
    await Promise.allSettled([issue.pdfPath, issue.coverPath]
      .filter(Boolean)
      .map((path) => deleteObject(ref(storage, path))));
  },
};
