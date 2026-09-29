# Investment data access

Investments now use the Firebase browser SDK, like jobs and urgent help. There are no investment API routes or Firebase Admin credentials required for this feature.

The repository does not include the project's deployed Firestore Security Rules. Those rules must allow verified members to read approved posts and their own posts, create pending posts, edit only their own pending post, submit a single private response per approved post, and read their own response to retain the Interested state. Admins with the `investments` permission can moderate posts, edit approved posts, and read and correct private responses. The UI and service check status and permissions, but the deployed rules must enforce the same checks for direct SDK access.

For a ruleset with admin records keyed by Firebase UID, the following is a starting point to merge into the existing rules. If the deployed rules use legacy admin document IDs, adapt `investmentAdmin()` to that schema. Keep other collection rules intact.

```text
function verifiedInvestmentMember() {
  return request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.hasJoinedCommunity == true
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isVerified == true;
}

function investmentAdmin() {
  return request.auth != null
    && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.status == 'active'
    && (
      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin'
      || 'investments' in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.permissions
    );
}

match /investments/{investmentId} {
  allow read: if investmentAdmin()
    || (verifiedInvestmentMember() && (resource.data.status == 'approved' || resource.data.ownerId == request.auth.uid));
  allow create: if verifiedInvestmentMember()
    && request.resource.data.ownerId == request.auth.uid
    && request.resource.data.status == 'pending';
  allow update: if investmentAdmin()
    || (verifiedInvestmentMember()
      && resource.data.ownerId == request.auth.uid
      && resource.data.status == 'pending'
      && request.resource.data.ownerId == resource.data.ownerId
      && request.resource.data.status == 'pending'
      && request.resource.data.createdAt == resource.data.createdAt
      && request.resource.data.rejectionReason == resource.data.rejectionReason
      && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
        'name', 'amount', 'currency', 'sector', 'details', 'place', 'preferredLocation', 'updatedAt'
      ]));
  allow delete: if false;

  match /interests/{memberId} {
    allow get: if investmentAdmin() || (verifiedInvestmentMember() && memberId == request.auth.uid);
    allow list: if investmentAdmin();
    allow create: if verifiedInvestmentMember()
      && memberId == request.auth.uid
      && request.resource.data.memberId == request.auth.uid
      && request.resource.data.status == 'new'
      && get(/databases/$(database)/documents/investments/$(investmentId)).data.status == 'approved'
      && get(/databases/$(database)/documents/investments/$(investmentId)).data.ownerId != request.auth.uid;
    allow update: if investmentAdmin();
    allow delete: if false;
  }
}
```

Firestore combines matching `allow` rules with OR. Any broader rule that permits direct access to pending posts or private responses must also be narrowed. Firestore queries must be constrained to what rules allow; the member service uses separate approved and owner queries for that reason.
