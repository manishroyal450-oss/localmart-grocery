# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. Every `cafeOrders/{orderId}` document MUST belong to an authenticated, email-verified user (`firebaseUid == request.auth.uid`) and start in `status == 'pending'`.
2. `orderId` in the document payload MUST match the path `{orderId}` (`^[a-zA-Z0-9_\-]+$`, max 64 chars).
3. Customers can ONLY read/list their own orders (`resource.data.firebaseUid == request.auth.uid`) and CANNOT change order `status`, `grandTotal`, `firebaseUid`, or `createdAt` after creation.
4. Only verified Cafe Admins (`manishroyal450@gmail.com` with `email_verified == true` or document in `/admins/{uid}`) can list all orders, update `status` (`'pending'` | `'confirmed'`) + `updatedAt`, and delete stored orders (`cafeOrders/{orderId}`).
5. Customer PII (`email`, `contactNumber`, `address`) is isolated into `/users/{userId}/private/contact` gated by parent `/users/{userId}` ownership (`get()` + `exists()`), never readable by other customers.
6. Every `createdAt` and `updatedAt` timestamp MUST equal `request.time`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Order Write**: `auth = null` creating `cafeOrders/FFC-100001` -> Denied (Master Gate & Auth).
2. **Unverified Email Spoof**: `auth.token.email = 'manishroyal450@gmail.com', email_verified = false` listing `cafeOrders` -> Denied (`email_verified == true` required).
3. **Cross-User Order Spoofing (Create)**: `auth.uid = 'userA'` creating order with `firebaseUid: 'userB'` -> Denied (`incoming().firebaseUid == request.auth.uid`).
4. **Self-Confirmation Bypass (Create)**: `auth.uid = 'userA'` creating order with `status: 'confirmed'` -> Denied (`incoming().status == 'pending'`).
5. **Shadow / Ghost Field Injection**: Creating order with extra `isAdminOverride: true` key -> Denied (`data.keys().hasOnly(...)`).
6. **Customer Status Tampering (Update)**: Non-admin `userA` updating their own order `status` to `'confirmed'` or `grandTotal` to `0` -> Denied (`isAdmin()` + `affectedKeys().hasOnly(['status', 'updatedAt'])`).
7. **Cross-User Order Read (Get/List)**: `userB` requesting `cafeOrders/FFC-100001` owned by `userA` -> Denied (`resource.data.firebaseUid == request.auth.uid`).
8. **ID Poisoning**: Creating `cafeOrders/<1500-char-junk>` or `cafeOrders/order.with.dots` -> Denied (`isValidId(orderId)`).
9. **Client Timestamp Forgery**: Creating order with `createdAt: "2020-01-01T00:00:00Z"` instead of `serverTimestamp()` -> Denied (`incoming().createdAt == request.time`).
10. **Non-Gmail / Invalid Phone Bypass**: Creating `users/userA/private/contact` with `email: "test@yahoo.com"` or `contactNumber: "+1 1234567890"` -> Denied (`@gmail.com` & `+91` 10-digit regex guards).
11. **PII Enumeration (`list /users`)**: Authenticated user listing `/users` or `/users/{otherUid}/private/contact` -> Denied (`allow list: if false` & `isOwner(userId)`).
12. **Self-Assigned Admin Escalation**: Authenticated user writing `/admins/{uid}` -> Denied (`allow write: if false`).
