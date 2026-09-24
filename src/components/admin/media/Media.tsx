'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { mediaService, validateMediaFile, type MediaItem, type MediaKind } from '@/lib/services/mediaService';

type FileKind = 'image' | 'video';
type QueuedFile = { id: string; file: File; kind: FileKind; status: 'uploading' | 'error'; progress: number; error?: string };
const categories: { id: MediaKind; label: string }[] = [{ id: 'image', label: 'Images' }, { id: 'video', label: 'Videos' }, { id: 'link', label: 'Links' }];

export default function AdminMedia() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('media');
  const [category, setCategory] = useState<MediaKind>('image');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const uploadingRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !canManage) router.replace('/admin/dashboard');
  }, [isAuthenticated, canManage, router]);

  const load = async () => {
    setLoading(true);
    try { setItems(await mediaService.getItems()); setError(''); }
    catch { setError('Could not load media. Check access and try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isAuthenticated && canManage) void load(); }, [isAuthenticated, canManage]);

  const addFiles = (files: FileList | File[], kind: FileKind) => {
    if (busy || uploadingRef.current) return;
    const selected = Array.from(files);
    const valid: QueuedFile[] = [];
    const rejected: string[] = [];
    for (const file of selected) {
      try {
        validateMediaFile(file, kind);
        valid.push({ id: crypto.randomUUID(), file, kind, status: 'uploading', progress: 0 });
      } catch (reason) { rejected.push(reason instanceof Error ? reason.message : file.name); }
    }
    setQueue(current => [...current, ...valid]);
    setError(rejected.join(' '));
    if (valid.length) void uploadFiles(valid, rejected);
  };

  const uploadFiles = async (files: QueuedFile[], rejected: string[] = []) => {
    if (!files.length || uploadingRef.current) return;
    uploadingRef.current = true;
    setBusy(true); setNotice('');
    let uploaded = 0;
    const failed: string[] = [];
    for (const item of files) {
      setQueue(current => current.map(entry => entry.id === item.id ? { ...entry, status: 'uploading', progress: 0, error: undefined } : entry));
      try {
        await mediaService.uploadFile(item.file, item.kind, progress => setQueue(current => current.map(entry => entry.id === item.id ? { ...entry, progress } : entry)));
        setQueue(current => current.filter(entry => entry.id !== item.id));
        uploaded++;
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Upload failed';
        failed.push(`${item.file.name}: ${message}`);
        setQueue(current => current.map(entry => entry.id === item.id ? { ...entry, status: 'error', error: message } : entry));
      }
    }
    if (uploaded) { setNotice(`${uploaded} ${uploaded === 1 ? 'file' : 'files'} published.`); await load(); }
    setError([...rejected, ...(failed.length ? [`${failed.length} ${failed.length === 1 ? 'file' : 'files'} failed. You can retry them below.`] : [])].join(' '));
    setBusy(false);
    uploadingRef.current = false;
  };

  const addLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await mediaService.addLink(linkTitle, linkUrl);
      setLinkTitle('');
      setLinkUrl('');
      setNotice('Link published.');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not publish this link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveLink = async () => {
    if (!editId || busy) return;
    setBusy(true); setError('');
    try { await mediaService.updateLink(editId, editTitle, editUrl); setEditId(null); setNotice('Link updated.'); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update link.'); }
    finally { setBusy(false); }
  };

  const remove = async (item: MediaItem) => {
    if (busy) return;
    const confirmation = await Swal.fire({
      title: `Delete this ${item.kind}?`,
      text: `"${item.title || item.kind}" will be permanently removed from the Media page.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#DC2626',
      background: '#FFF9F2',
      color: '#2A1636',
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;
    setBusy(true); setError('');
    try { await mediaService.deleteItem(item); setItems(current => current.filter(entry => entry.id !== item.id)); setNotice('Item deleted.'); }
    catch { setError('Could not delete the item. Please try again.'); }
    finally { setBusy(false); }
  };

  const visible = items.filter(item => item.kind === category);
  const fileCategory: FileKind = category === 'video' ? 'video' : 'image';
  const visibleQueue = queue.filter(item => item.kind === fileCategory);
  const failedFiles = visibleQueue.filter(item => item.status === 'error');

  if (!canManage) return null;

  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Media</h1><p className="mt-2 text-sm text-[#6B5E5A]">Publish images, videos and links to the public Media page.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7D7E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B1E5B] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
    </div>

    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E7D7E8] bg-white p-1.5 sm:inline-flex">
      {categories.map(tab => <button key={tab.id} type="button" onClick={() => { setCategory(tab.id); setError(''); setNotice(''); }} className={`rounded-xl px-3 py-2.5 text-sm font-semibold sm:min-w-28 ${category === tab.id ? 'bg-[#6B1E5B] text-white' : 'text-[#6B5E5A] hover:bg-[#F7EFF5]'}`}>{tab.label} <span className="ml-1 opacity-70">{items.filter(item => item.kind === tab.id).length}</span></button>)}
    </div>

    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

    {category !== 'link' ? <section className="rounded-2xl border border-[#E7D7E8] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-[#2A1636]">Bulk upload {category === 'image' ? 'images' : 'videos'}</h2>
      <p className="mt-1 text-sm text-[#6B5E5A]">Choose multiple files or drop them here to start uploading automatically. {category === 'image' ? 'Images up to 20 MB each.' : 'Videos up to 100 MB each.'}</p>
      <div onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!busy) addFiles(event.dataTransfer.files, fileCategory); }} className="mt-4 rounded-xl border-2 border-dashed border-[#D4C8C0] bg-[#FFF9F2] p-6 text-center">
        <Upload className="mx-auto h-7 w-7 text-[#8A2E72]" />
        <label className="mt-3 inline-flex cursor-pointer items-center rounded-xl bg-[#6B1E5B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#531547]">Choose {category === 'image' ? 'images' : 'videos'}<input type="file" multiple accept={category === 'image' ? 'image/*' : 'video/*'} disabled={busy} onChange={event => { if (event.target.files) addFiles(event.target.files, fileCategory); event.target.value = ''; }} className="sr-only" /></label>
        <p className="mt-2 text-xs text-[#6B5E5A]">or drag and drop files here</p>
      </div>
      {visibleQueue.length > 0 && <div className="mt-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-[#2A1636]">{busy ? 'Uploading files' : 'Failed uploads'} ({visibleQueue.length})</h3>{failedFiles.length > 0 && <button type="button" disabled={busy} onClick={() => void uploadFiles(failedFiles)} className="rounded-lg bg-[#6B1E5B] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Retry failed</button>}</div>
        {visibleQueue.map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E7D7E8] p-3 text-sm"><div className="min-w-0 flex-1"><p className="truncate font-medium text-[#2A1636]">{item.file.name}</p><p className="text-xs text-[#6B5E5A]">{item.kind} · {(item.file.size / 1024 / 1024).toFixed(1)} MB · {item.status === 'uploading' ? `${item.progress}%` : item.status}{item.error ? ` · ${item.error}` : ''}</p>{item.status === 'uploading' && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E7D7E8]"><div className="h-full bg-[#6B1E5B]" style={{ width: `${item.progress}%` }} /></div>}</div>{item.status !== 'uploading' && <button type="button" disabled={busy} onClick={() => setQueue(current => current.filter(entry => entry.id !== item.id))} aria-label={`Remove ${item.file.name} from queue`} className="rounded-lg p-2 text-[#6B5E5A] hover:bg-[#F7EFF5] disabled:opacity-50"><X className="h-4 w-4" /></button>}</div>)}
      </div>}
    </section> : <section className="rounded-2xl border border-[#E7D7E8] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-[#2A1636]">Add a website or YouTube link</h2>
      <p className="mt-1 text-sm text-[#6B5E5A]">Add one link at a time. It will appear in the Links tab on the public Media page.</p>
      <form onSubmit={addLink} className="mt-5 max-w-2xl space-y-4">
        <label className="block text-sm font-semibold text-[#2A1636]">Link name
          <input type="text" required maxLength={160} value={linkTitle} onChange={event => setLinkTitle(event.target.value)} placeholder="For example: Rath Yatra highlights" disabled={busy} className="mt-2 w-full rounded-xl border border-[#D4C8C0] bg-white p-3 text-sm font-normal outline-none focus:border-[#6B1E5B] disabled:opacity-50" />
          <span className="mt-1 block text-xs font-normal text-[#6B5E5A]">This is the name visitors will see.</span>
        </label>
        <label className="block text-sm font-semibold text-[#2A1636]">YouTube or website URL
          <input type="url" required value={linkUrl} onChange={event => setLinkUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." disabled={busy} className="mt-2 w-full rounded-xl border border-[#D4C8C0] bg-white p-3 text-sm font-normal outline-none focus:border-[#6B1E5B] disabled:opacity-50" />
          <span className="mt-1 block text-xs font-normal text-[#6B5E5A]">Paste the full link, starting with https://.</span>
        </label>
        <button type="submit" disabled={busy || !linkTitle.trim() || !linkUrl.trim()} className="rounded-xl bg-[#6B1E5B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Adding link…' : 'Add link'}</button>
      </form>
    </section>}

    <section className="rounded-2xl border border-[#E7D7E8] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-[#2A1636]">Published {category === 'image' ? 'images' : category === 'video' ? 'videos' : 'links'} ({visible.length})</h2>
      {loading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm text-[#6B5E5A]"><Loader2 className="h-4 w-4 animate-spin" /> Loading media…</p> : visible.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-[#D4C8C0] p-8 text-center text-sm text-[#6B5E5A]">No {category === 'image' ? 'images' : category === 'video' ? 'videos' : 'links'} published yet.</p> : <div className={`mt-5 grid gap-3 ${category === 'link' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {visible.map(item => <div key={item.id} className="overflow-hidden rounded-xl border border-[#E7D7E8] bg-[#FFF9F2]">
          {item.kind === 'image' && <img src={item.url} alt={item.title} className="aspect-square w-full object-cover" />}
          {item.kind === 'video' && <video src={item.url} controls preload="metadata" className="aspect-video w-full bg-black" />}
          <div className={item.kind === 'link' ? 'p-4' : 'p-2'}>
            {editId === item.id ? <div className="space-y-2"><input value={editTitle} onChange={event => setEditTitle(event.target.value)} aria-label="Link title" className="w-full rounded-lg border border-[#D4C8C0] p-2 text-sm" /><input value={editUrl} onChange={event => setEditUrl(event.target.value)} aria-label="Link URL" className="w-full rounded-lg border border-[#D4C8C0] p-2 text-sm" /><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => void saveLink()} className="rounded-lg bg-[#6B1E5B] px-3 py-2 text-xs font-semibold text-white">Save</button><button type="button" onClick={() => setEditId(null)} className="rounded-lg border border-[#D4C8C0] px-3 py-2 text-xs">Cancel</button></div></div> : <div className={item.kind === 'link' ? '' : 'flex items-center justify-between gap-2'}>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#2A1636]" title={item.title}>{item.title || item.kind}</p>{item.kind === 'link' && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-[#6B1E5B] hover:underline">{item.url}</a>}</div>
              <div className={item.kind === 'link' ? 'mt-3 flex items-center gap-2' : 'flex shrink-0'}>
                {item.kind === 'link' && <button type="button" disabled={busy} onClick={() => { setEditId(item.id); setEditTitle(item.title); setEditUrl(item.url); }} className="rounded-lg border border-[#D4C8C0] px-3 py-2 text-xs font-semibold text-[#6B1E5B]">Edit</button>}
                <button type="button" disabled={busy} onClick={() => void remove(item)} aria-label={`Delete ${item.title || item.kind}`} title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>}
          </div>
        </div>)}
      </div>}
    </section>
  </div>;
}
