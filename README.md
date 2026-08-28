# Peer Project Hub

Peer Project Hub is a React + Express + MongoDB application using Firebase Authentication and Firestore for user roles.

## Roles

- `user` → `/dashboard`
- `owner` → `/owner-dashboard`

The role is stored only in Firestore at:

`users/{firebaseUid}`

Example:

```text
users
  <firebaseUid>
    role: "owner"
    email: "owner@example.com"
```

New accounts are automatically created as `user`. An owner role must be assigned manually in Firestore by an administrator.

## Firebase setup

1. Enable Authentication → Email/Password.
2. Create/enable Firestore Database.
3. Deploy `firestore.rules`.
4. For an owner account, create `users/{Firebase UID}` with `role: owner`.
5. For normal accounts, the application creates `role: user` automatically.

## Backend setup

Create `server/.env` from `server/.env.example` and configure MongoDB plus Firebase Admin credentials.

```bash
cd server
npm install
npm run dev
```

Check:

`http://localhost:5000/api/health`

## Frontend setup

Create `client/.env` from `client/.env.example` and add your Firebase Web App configuration.

```bash
cd client
npm install
npm run dev
```

## Role testing

1. Log out.
2. Log in with a normal Firebase user → `/dashboard`.
3. Log out.
4. In Firestore set that user's `users/{uid}.role` to `owner`.
5. Log in again → `/owner-dashboard`.

The login page deliberately ignores stale `/dashboard` or `/owner-dashboard` paths and uses the current Firestore role to choose the correct dashboard.

## If an owner still sees `/dashboard`

Verify these three values match:

1. Firebase Authentication → Users → **User UID**
2. Firestore → `users` → **document ID**
3. `client/.env` → `VITE_FIREBASE_PROJECT_ID`

The document must contain exactly:

```text
role: owner
```

The app listens to Firestore role changes in real time, so changing `role` from `user` to `owner` while the account is logged in will redirect the user to `/owner-dashboard` automatically.

The application will not let a normal user create or change their own role to `owner` because `firestore.rules` blocks that change.


## Role-based dashboards

Firebase Authentication identifies the user. Firestore is the source of truth for the dashboard role:

```text
users/{firebaseUid}
  role: "user" | "owner"
```

New signups are always created as `user`. To promote an account, an authorized administrator must set that user's Firestore `role` field to `owner`. The frontend listens for role changes in real time, and the owner-only analytics API verifies the same role on the server.
