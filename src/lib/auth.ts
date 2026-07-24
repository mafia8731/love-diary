// 预置双账号
const USERS: Record<string, string> = {
  guohanxi: "liumengqi",
  liumengqi: "guohanxi",
};

export function validateCredentials(
  username: string,
  password: string
): boolean {
  return USERS[username] === password;
}

export function isValidUser(username: string): boolean {
  return username in USERS;
}
