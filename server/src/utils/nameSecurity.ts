const NAME_REPEATED_CHAR_REGEX = /(.)\1{4,}/;

export function normalizeFullName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function canonicalizeFullName(name: string): string {
  return normalizeFullName(name).toLowerCase();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSuspiciousRepeatedName(name: string): boolean {
  const normalized = normalizeFullName(name);
  if (!normalized) return true;

  const compact = normalized.replace(/\s+/g, "").toLowerCase();
  if (NAME_REPEATED_CHAR_REGEX.test(compact)) {
    return true;
  }

  const words = normalized
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  // Reject names like "rahul rahul rahul".
  return words.length >= 3 && new Set(words).size === 1;
}
