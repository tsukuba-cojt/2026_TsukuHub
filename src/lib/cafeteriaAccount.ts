const domain = "cafeteria.tsukuhub.com";
export function cafeteriaAccountEmail(accountName: string): string {
  const name = accountName.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(name)) throw new Error("アカウント名を確認してください。");
  return `${name}@${domain}`;
}
export function cafeteriaAccountName(email: string): string {
  return email.endsWith(`@${domain}`) ? email.slice(0, -domain.length - 1) : email;
}
