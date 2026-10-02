// The account on this phone (only one per device, nothing is sent to a server).
// The password itself is NEVER stored – only a hash of salt + password.

interface Account {
  email: string; // lowercase, e.g. "alex@beispiel.ch"
  passwordHash: string; // SHA-256 of salt + password (hex)
  salt: string; // random per account (hex) – same password ≠ same hash
  createdAt: number; // ms timestamp
}

export default Account;
