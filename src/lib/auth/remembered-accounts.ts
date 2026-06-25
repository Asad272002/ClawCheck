"use client";

export type RememberedAccount = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  providers: string[];
  lastUsedAt: string;
};

const REMEMBERED_ACCOUNTS_KEY = "clawcheck.remembered-accounts";
const REMEMBERED_ACCOUNTS_EVENT = "clawcheck:remembered-accounts";
const MAX_REMEMBERED_ACCOUNTS = 5;
const EMPTY_REMEMBERED_ACCOUNTS: RememberedAccount[] = [];

let cachedSerializedRememberedAccounts = "";
let cachedRememberedAccounts: RememberedAccount[] = EMPTY_REMEMBERED_ACCOUNTS;

function isRememberedAccount(value: unknown): value is RememberedAccount {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RememberedAccount>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    (candidate.avatarUrl === null || typeof candidate.avatarUrl === "string") &&
    Array.isArray(candidate.providers) &&
    typeof candidate.lastUsedAt === "string"
  );
}

export function loadRememberedAccounts() {
  if (typeof window === "undefined") {
    return EMPTY_REMEMBERED_ACCOUNTS;
  }

  try {
    const rawValue = window.localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) ?? "";

    if (rawValue === cachedSerializedRememberedAccounts) {
      return cachedRememberedAccounts;
    }

    if (!rawValue) {
      cachedSerializedRememberedAccounts = "";
      cachedRememberedAccounts = EMPTY_REMEMBERED_ACCOUNTS;
      return cachedRememberedAccounts;
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      cachedSerializedRememberedAccounts = "";
      cachedRememberedAccounts = EMPTY_REMEMBERED_ACCOUNTS;
      return cachedRememberedAccounts;
    }

    cachedSerializedRememberedAccounts = rawValue;
    cachedRememberedAccounts = parsed
      .filter(isRememberedAccount)
      .sort((left, right) => new Date(right.lastUsedAt).getTime() - new Date(left.lastUsedAt).getTime());
    return cachedRememberedAccounts;
  } catch {
    cachedSerializedRememberedAccounts = "";
    cachedRememberedAccounts = EMPTY_REMEMBERED_ACCOUNTS;
    return cachedRememberedAccounts;
  }
}

export function saveRememberedAccount(account: Omit<RememberedAccount, "lastUsedAt">) {
  if (typeof window === "undefined") {
    return EMPTY_REMEMBERED_ACCOUNTS;
  }

  const nextAccount: RememberedAccount = {
    ...account,
    lastUsedAt: new Date().toISOString(),
  };

  const dedupedAccounts = loadRememberedAccounts().filter((item) => item.id !== account.id);
  const nextAccounts = [nextAccount, ...dedupedAccounts].slice(0, MAX_REMEMBERED_ACCOUNTS);
  const serializedAccounts = JSON.stringify(nextAccounts);
  cachedSerializedRememberedAccounts = serializedAccounts;
  cachedRememberedAccounts = nextAccounts;
  window.localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, serializedAccounts);
  window.dispatchEvent(new Event(REMEMBERED_ACCOUNTS_EVENT));
  return nextAccounts;
}

export function removeRememberedAccount(accountId: string) {
  if (typeof window === "undefined") {
    return EMPTY_REMEMBERED_ACCOUNTS;
  }

  const nextAccounts = loadRememberedAccounts().filter((item) => item.id !== accountId);
  const serializedAccounts = JSON.stringify(nextAccounts);
  cachedSerializedRememberedAccounts = serializedAccounts;
  cachedRememberedAccounts = nextAccounts;
  window.localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, serializedAccounts);
  window.dispatchEvent(new Event(REMEMBERED_ACCOUNTS_EVENT));
  return nextAccounts;
}

export function subscribeToRememberedAccounts(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();
  window.addEventListener(REMEMBERED_ACCOUNTS_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(REMEMBERED_ACCOUNTS_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}
