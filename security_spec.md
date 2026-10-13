# Security Specification: Sistem Arsip Kependudukan Desa Bojongloa

## 1. Data Invariants
- A `User` profile at `/users/{userId}` can only be read/updated by the user themselves (`request.auth.uid == userId`) or an admin (`isAdmin()`). Non-admins cannot alter their own `role` field.
- Bootstrapped admin is `ajamjamaludin45@gmail.com` or documents located in `/admins/{adminId}`.
- Submissions at `/submissions/{submissionId}`:
  - Warga can create their own submission with `status: 'menunggu'`.
  - Warga cannot approve, reject, or assign `suratNumber` to their own submission.
  - Only `admin` can update status to `'diproses'`, `'disetujui'`, or `'ditolak'`.
  - When rejected (`status: 'ditolak'`), `rejectionNote` must be provided.
  - Warga can only read/list their own submissions (`resource.data.userId == request.auth.uid`), while `admin` and `kades` can list all submissions for verification and reports.
- Population records at `/residents/{residentId}`:
  - Only `admin` can create, update, or delete resident master records.
  - `admin` and `kades` can read resident data for reports and population statistics.

## 2. The Dirty Dozen Payloads (Rejection Scenarios)
1. User attempts to create a profile with self-assigned `role: "admin"`.
2. Unauthenticated user attempts to create a submission.
3. User attempts to create a submission on behalf of another user (`userId != request.auth.uid`).
4. Warga user attempts to set `status: "disetujui"` on their own submission during creation.
5. Warga user attempts to update their own submission status to `"disetujui"`.
6. Admin updates status to `"ditolak"` without providing `rejectionNote`.
7. Non-admin user attempts to insert or modify records in `/residents`.
8. Unauthenticated user attempts to read user PII in `/users/{userId}`.
9. Warga attempts to read another warga's private submissions.
10. Malicious payload injecting oversized ID or invalid field types.
11. User attempts to mutate immutable field `createdAt`.
12. Terminal state violation: modifying a submission that has already been finalized without admin authority.

## 3. Test Runner
Included in security verification suite.
