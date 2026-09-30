'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ExternalLink, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { magazineService, type MagazineIssue } from '@/lib/services/magazineService';

const monthNow = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const displayMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export default function MagazineAdmin() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const canManage = admin?.role === 'super_admin'
    || admin?.permissions?.includes('magazines')
    || admin?.permissions?.includes('media');
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [title, setTitle] = useState('');
  const [issueMonth, setIssueMonth] = useState(monthNow);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isAuthenticated && !canManage) router.replace('/admin/dashboard');
  }, [isAuthenticated, canManage, router]);

  const load = async () => {
    setLoading(true);
    try {
      setIssues(await magazineService.getIssues());
      setError('');
    } catch {
      setError('Could not load magazines. Check access and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && canManage) void load();
  }, [isAuthenticated, canManage]);

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || busy) return;
    const form = event.currentTarget;
    setBusy(true);
    setError('');
    setNotice('');
    setProgress(0);
    try {
      const issue = await magazineService.uploadIssue(
        file,
        { title, issueMonth, description },
        setProgress
      );
      setIssues((current) => [issue, ...current]);
      setTitle('');
      setDescription('');
      setFile(null);
      form.reset();
      setNotice('Magazine published. Readers can open it from the Magazine page.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not upload the magazine.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (issue: MagazineIssue) => {
    if (busy) return;
    const confirmation = await Swal.fire({
      title: 'Delete this magazine?',
      text: `"${issue.title}" will be removed from the public Magazine page.`,
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
    setBusy(true);
    setError('');
    try {
      await magazineService.deleteIssue(issue);
      setIssues((current) => current.filter((item) => item.id !== issue.id));
      setNotice('Magazine deleted.');
    } catch {
      setError('Could not delete this magazine. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!canManage) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Magazines</h1>
          <p className="mt-2 text-sm text-[#6B5E5A]">Upload PDF issues for the public Magazine page.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7D7E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#7C3A21] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

      <section className="rounded-2xl border border-[#E7D7E8] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[#2A1636]">Upload a magazine</h2>
        <p className="mt-1 text-sm text-[#6B5E5A]">
          Upload a PDF up to 100 MB. Its first page becomes the cover, and readers see pages at their original proportions.
        </p>
        <form onSubmit={publish} className="mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#2A1636]">
            Magazine title
            <input
              type="text"
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="For example: Prabasi Odia September Edition"
              disabled={busy}
              className="mt-2 w-full rounded-xl border border-[#D4C8C0] bg-white p-3 text-sm font-normal outline-none focus:border-[#7C3A21] disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-semibold text-[#2A1636]">
            Issue month
            <input
              type="month"
              required
              value={issueMonth}
              onChange={(event) => setIssueMonth(event.target.value)}
              disabled={busy}
              className="mt-2 w-full rounded-xl border border-[#D4C8C0] bg-white p-3 text-sm font-normal outline-none focus:border-[#7C3A21] disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-semibold text-[#2A1636] sm:col-span-2">
            Short description <span className="font-normal text-[#6B5E5A]">(optional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={400}
              rows={2}
              disabled={busy}
              placeholder="What is this issue about?"
              className="mt-2 w-full rounded-xl border border-[#D4C8C0] bg-white p-3 text-sm font-normal outline-none focus:border-[#7C3A21] disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-semibold text-[#2A1636] sm:col-span-2">
            Magazine PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              required={!file}
              disabled={busy}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mt-2 block w-full rounded-xl border border-[#D4C8C0] bg-white p-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-[#FFF0DF] file:px-3 file:py-2 file:font-semibold file:text-[#7C3A21] disabled:opacity-50"
            />
            {file && <span className="mt-1 block text-xs font-normal text-[#6B5E5A]">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>}
          </label>
          {busy && (
            <div className="sm:col-span-2" role="status">
              <p className="text-xs text-[#6B5E5A]">Preparing or uploading PDF: {progress}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F3E6DC]">
                <div className="h-full bg-[#7C3A21] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !file || !title.trim() || !issueMonth}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3A21] px-5 py-3 text-sm font-semibold text-white hover:bg-[#612C18] disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? 'Publishing...' : 'Publish magazine'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#E7D7E8] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#2A1636]">Uploaded magazines</h2>
          <span className="rounded-full bg-[#FFF0DF] px-3 py-1 text-xs font-semibold text-[#7C3A21]">
            {loading ? '...' : issues.length}
          </span>
        </div>
        {loading ? (
          <p role="status" className="mt-5 flex items-center gap-2 text-sm text-[#6B5E5A]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading magazines...
          </p>
        ) : issues.length === 0 ? (
          <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#D4C8C0] text-center text-sm text-[#6B5E5A]">
            <BookOpen className="mb-3 h-7 w-7 text-[#7C3A21]" /> No magazines uploaded yet.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-sm">
              <thead className="border-b border-[#E7D7E8] text-xs uppercase tracking-wide text-[#6B5E5A]">
                <tr>
                  <th scope="col" className="pb-3 font-semibold">Magazine</th>
                  <th scope="col" className="pb-3 font-semibold">Issue</th>
                  <th scope="col" className="pb-3 font-semibold">Pages</th>
                  <th scope="col" className="pb-3 font-semibold">PDF size</th>
                  <th scope="col" className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-[#F0E7EE] last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img src={issue.coverUrl} alt="" className="h-16 w-11 shrink-0 rounded object-cover shadow-sm" />
                        <span className="max-w-56 font-semibold text-[#2A1636]">{issue.title}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[#6B5E5A]">{displayMonth(issue.issueMonth)}</td>
                    <td className="py-3 pr-4 text-[#6B5E5A]">{issue.pageCount}</td>
                    <td className="py-3 pr-4 text-[#6B5E5A]">{(issue.fileSize / 1024 / 1024).toFixed(1)} MB</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <a href={`/magazine/${issue.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Read ${issue.title}`} className="rounded-lg border border-[#E7D7E8] p-2 text-[#7C3A21] hover:bg-[#FFF0DF]">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button type="button" disabled={busy} onClick={() => void remove(issue)} aria-label={`Delete ${issue.title}`} className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
