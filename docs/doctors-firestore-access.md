# Doctor consultation data access

The doctor directory and consultation requests use the Firebase browser SDK, following the project's existing jobs and investments pattern. The repository does not contain the deployed Firestore Security Rules. Add equivalent rules in the Firebase project before using this feature with real patient information.

Public visitors can read **published doctor profiles**. Signed-in users can create consultation requests and read only their own requests. Admins with the `doctors` permission can manage profiles, see all requests and schedule them. Doctor profiles contain no private WhatsApp number or meeting link. Connection details are stored only on a private consultation request after an admin schedules it.

The following is a starting point for rulesets whose admin documents use Firebase UIDs as document IDs. If the existing admin records have generated IDs, adapt `doctorAdmin()` to that structure. Merge these matches into the current ruleset and keep other collections intact.

```text
function doctorAdmin() {
  return request.auth != null
    && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.status == 'active'
    && (
      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin'
      || 'doctors' in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.permissions
    );
}

match /doctors/{doctorId} {
  allow get, list: if doctorAdmin() || resource.data.published == true;
  allow create, update: if doctorAdmin();
  allow delete: if false;
}

match /consultationRequests/{requestId} {
  allow get, list: if doctorAdmin()
    || (request.auth != null && resource.data.userId == request.auth.uid);
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.keys().hasAll([
      'patientName', 'age', 'phone', 'email', 'city', 'concern', 'mode',
      'preferredDate', 'preferredTime', 'userId', 'doctorId', 'doctorName',
      'doctorSpecialty', 'status', 'scheduledAt', 'contactMethod',
      'contactValue', 'adminMessage', 'createdAt', 'updatedAt'
    ])
    && request.resource.data.status == 'pending'
    && request.resource.data.scheduledAt == ''
    && request.resource.data.contactMethod == ''
    && request.resource.data.contactValue == ''
    && request.resource.data.adminMessage == ''
    && request.resource.data.keys().hasOnly([
      'patientName', 'age', 'phone', 'email', 'city', 'concern', 'mode',
      'preferredDate', 'preferredTime', 'userId', 'doctorId', 'doctorName',
      'doctorSpecialty', 'status', 'scheduledAt', 'contactMethod',
      'contactValue', 'adminMessage', 'createdAt', 'updatedAt'
    ])
    && get(/databases/$(database)/documents/doctors/$(request.resource.data.doctorId)).data.published == true
    && request.resource.data.doctorName == get(/databases/$(database)/documents/doctors/$(request.resource.data.doctorId)).data.name
    && request.resource.data.doctorSpecialty == get(/databases/$(database)/documents/doctors/$(request.resource.data.doctorId)).data.specialty;
  allow update: if doctorAdmin();
  allow delete: if false;
}
```

Firestore combines overlapping `allow` rules with OR. Review any broader rules that could expose requests or unpublished doctor profiles. The member query filters on `userId`; the public doctor query filters on `published`.
