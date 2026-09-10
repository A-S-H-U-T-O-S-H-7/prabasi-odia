const mediaTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
};

export const URGENT_HELP_MEDIA_ACCEPT = [
  ...Object.keys(mediaTypes).map(extension => `.${extension}`),
  ...new Set(Object.values(mediaTypes)),
  'image/heic-sequence', 'image/heif-sequence', 'video/x-m4v',
].join(',');

export const URGENT_HELP_MEDIA_HINT = 'Up to 3 files. Images: JPG, PNG, WebP, HEIC or HEIF (20 MB each). Videos: MOV, MP4, M4V or WebM (100 MB each).';

export function validateUrgentHelpMedia(file: Pick<File, 'name' | 'type' | 'size'>): string {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const aliases: Record<string, string> = {
    'image/jpg': 'image/jpeg',
    'image/heic-sequence': 'image/heic',
    'image/heif-sequence': 'image/heif',
    'video/x-m4v': 'video/mp4',
  };
  // Some devices provide no MIME type, or a generic binary type, for iPhone media.
  const type = !mimeType || mimeType === 'application/octet-stream'
    ? mediaTypes[extension]
    : aliases[mimeType] || mimeType;
  if (!type || !Object.values(mediaTypes).includes(type)) {
    throw new Error(`Unsupported file: ${file.name}. ${URGENT_HELP_MEDIA_HINT}`);
  }
  const limitMB = type.startsWith('video/') ? 100 : 20;
  if (file.size > limitMB * 1024 * 1024) {
    throw new Error(`${file.name} exceeds the ${limitMB} MB limit per ${type.startsWith('video/') ? 'video' : 'image'}.`);
  }
  return type;
}
