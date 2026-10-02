// src/utils/auth.ts – helpers for the local account (hashing + checking inputs)

import * as Crypto from "expo-crypto";

export const MIN_PASSWORD_LENGTH = 8;

// " Alex@Beispiel.CH " → "alex@beispiel.ch" (so login isn't case-sensitive)
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Simple check: something@something.something
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

// 16 random bytes as hex, e.g. "9f3a…" – a new one for every account / new password
export function makeSalt(): string {
  return Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, "0")).join("");
}

// SHA-256 of salt + password. The same password with another salt gives another hash,
// so two accounts with "12345678" don't look the same.
export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);
}
