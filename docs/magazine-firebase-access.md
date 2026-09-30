# Magazine Firebase access

The Magazine feature stores issue metadata in the `magazines` Firestore collection and two files per issue in Cloud Storage:

- `magazines/{issueId}/issue.pdf`
- `magazines/{issueId}/cover.jpg`

The browser admin uploads the files directly to Storage and then publishes the Firestore document. Public visitors list published documents. The page reader requests the PDF through `/api/magazines/{issueId}/pdf`, which validates the saved Firebase download URL and streams it from Storage. The upload form limits PDFs to 100 MB and generates the cover from the first page. The PDF's page ratio is retained in the reader.

This repository does not contain the deployed Firebase rules. Merge equivalent matches into the project's existing Firestore and Storage rules before using the feature. Admins need `magazines` or `media` permission, or the `super_admin` role. Adapt the admin lookup if admin documents use legacy generated IDs instead of Firebase UIDs.

## Firestore rule example

```text
function magazineAdmin() {
  return request.auth != null
    && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.status == 'active'
    && (
      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin'
      || 'magazines' in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.permissions
      || 'media' in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.permissions
    );
}

match /magazines/{issueId} {
  allow get, list: if true;
  allow create, delete: if magazineAdmin();
  allow update: if false;
}
```

## Storage rule example

The Storage rule uses Firestore to check the admin document. Firebase asks for permission to connect Storage rules to Firestore when that feature is first enabled.

```text
function magazineStorageAdmin() {
  return request.auth != null
    && firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid))
    && firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.status == 'active'
    && (
      firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.role == 'super_admin'
      || 'magazines' in firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.permissions
      || 'media' in firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.permissions
    );
}

match /magazines/{issueId}/{fileName} {
  allow get: if magazineStorageAdmin()
    || firestore.exists(/databases/(default)/documents/magazines/$(issueId));
  allow list: if false;
  allow create, update: if magazineStorageAdmin()
    && (
      (fileName == 'issue.pdf'
        && request.resource.contentType == 'application/pdf'
        && request.resource.size <= 100 * 1024 * 1024)
      || (fileName == 'cover.jpg'
        && request.resource.contentType == 'image/jpeg'
        && request.resource.size <= 5 * 1024 * 1024)
    );
  allow delete: if magazineStorageAdmin();
}
```

The PDF route requires `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` in the server environment and outbound access to Firebase Storage. It forwards PDF byte-range requests so the reader can turn pages without configuring browser CORS on the Storage bucket. Firebase download URLs contain public access tokens; do not publish private PDFs as magazines.
