const DATABASE = 'prabasi-odia-join-draft';
const STORE = 'drafts';
const KEY = 'current';

// Explicitly exclude account passwords, OTPs and client verification flags.
const FIELDS = [
  'residencyStatus', 'fullName', 'dob', 'dobDay', 'dobMonth', 'dobYear', 'gender', 'bloodGroup', 'mobileCountryCode', 'mobileNumber',
  'occupation', 'email', 'photo', 'odishaHomeAddress', 'odishaDistrict', 'odishaCity',
  'odishaPinCode', 'currentAddress', 'currentCountry', 'currentState', 'currentCity',
  'currentLatitude', 'currentLongitude', 'currentPinCode', 'nearbyCommunityId',
  'nearbyCommunityName', 'requestedCommunityName', 'idType', 'aadharNumber',
  'passportNumber', 'identityConsent', 'identityDocumentSelected', 'aadharFront', 'aadharBack', 'passportFile',
] as const;

export interface JoinFormDraft {
  version: 1;
  step: number;
  values: Record<string, unknown>;
}

export function createJoinFormDraft(values: Record<string, unknown>, step: number): JoinFormDraft {
  return {
    version: 1,
    step: Math.max(1, Math.min(3, Math.trunc(step) || 1)),
    values: Object.fromEntries(FIELDS.filter((key) => values[key] !== undefined).map((key) => [key, values[key]])),
  };
}

let connection: Promise<IDBDatabase> | undefined;
function openDatabase() {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Draft storage is unavailable'));
    }).catch((error) => { connection = undefined; throw error; });
  }
  return connection;
}

export async function loadJoinFormDraft(): Promise<JoinFormDraft | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => {
      const draft = request.result;
      resolve(draft?.version === 1 && draft.values && typeof draft.values === 'object'
        ? createJoinFormDraft(draft.values, draft.step) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

async function writeDraft(draft: JoinFormDraft | null) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    if (draft) store.put(draft, KEY);
    else store.delete(KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

// Preserve write order, including clearing after the last autosave.
let writes: Promise<void> = Promise.resolve();
export function saveJoinFormDraft(draft: JoinFormDraft | null) {
  const operation = writes.catch(() => {}).then(() => writeDraft(draft));
  writes = operation;
  return operation;
}
