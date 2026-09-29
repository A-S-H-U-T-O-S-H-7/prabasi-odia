# Cultural Teams Firebase access

This feature uses the Firebase browser SDK and has no API route. The repository does not contain the deployed Firestore or Storage rules. Merge equivalent rules into the Firebase project before accepting registrations or enquiries.

Data is split into three Firestore collections:

- `culturalTeams`: public profile and gallery after approval; owner can read their own pending/rejected applications.
- `culturalTeamContacts`: private contact person, email and phone; only the owner and cultural-team admins can read it.
- `culturalTeamEnquiries`: private organiser requests and admin notes; only cultural-team admins can read it. Anyone can submit an enquiry for an approved team.

The registration writes the profile and private contact in one Firestore batch after images finish uploading. The example below assumes admin records are keyed by Firebase UID. If the project uses generated admin document IDs, adapt the admin function to the deployed schema.

```text
function culturalTeamAdmin() {
  return request.auth != null
    && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.status == 'active'
    && (
      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin'
      || 'cultural_teams' in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.permissions
    );
}

match /culturalTeams/{teamId} {
  allow get, list: if culturalTeamAdmin()
    || resource.data.status == 'approved'
    || (request.auth != null && resource.data.ownerId == request.auth.uid);
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid
    && request.resource.data.status == 'pending'
    && request.resource.data.rejectionReason == ''
    && request.resource.data.images is list
    && request.resource.data.images.size() >= 1
    && request.resource.data.images.size() <= 10;
  allow update: if culturalTeamAdmin();
  allow delete: if false;
}

match /culturalTeamContacts/{teamId} {
  allow get: if culturalTeamAdmin()
    || (request.auth != null && resource.data.ownerId == request.auth.uid);
  allow list: if culturalTeamAdmin();
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid
    && getAfter(/databases/$(database)/documents/culturalTeams/$(teamId)).data.ownerId == request.auth.uid;
  allow update: if culturalTeamAdmin();
  allow delete: if false;
}

match /culturalTeamEnquiries/{enquiryId} {
  allow get, list: if culturalTeamAdmin();
  allow create: if request.resource.data.keys().hasAll([
      'organiserName', 'email', 'phone', 'eventType', 'eventDate',
      'eventLocation', 'message', 'teamId', 'teamName', 'status',
      'adminNotes', 'createdAt', 'updatedAt'
    ])
    && request.resource.data.keys().hasOnly([
      'organiserName', 'email', 'phone', 'eventType', 'eventDate',
      'eventLocation', 'message', 'teamId', 'teamName', 'status',
      'adminNotes', 'createdAt', 'updatedAt'
    ])
    && request.resource.data.status == 'new'
    && request.resource.data.adminNotes == ''
    && get(/databases/$(database)/documents/culturalTeams/$(request.resource.data.teamId)).data.status == 'approved'
    && request.resource.data.teamName == get(/databases/$(database)/documents/culturalTeams/$(request.resource.data.teamId)).data.name;
  allow update: if culturalTeamAdmin();
  allow delete: if false;
}
```

Storage must allow a signed-in user to create JPG, PNG and WebP files up to 5 MB under `cultural-teams/{theirUid}/{teamId}/...`, read them to obtain download URLs, and delete them when an upload fails. Admins need read access to review pending images. Published gallery URLs are shared on public cards; Firebase download URLs are bearer links, so uploaded images should be treated as shareable media. Do not upload private documents to this gallery.

Firestore combines overlapping `allow` rules with OR. Review broader rules so they do not expose team contacts or enquiries. Public team queries filter by `status == approved`; owner queries filter by `ownerId`.
