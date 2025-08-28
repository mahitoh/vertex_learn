/*
 End-to-end auth flow test:
 - Registers a random user
 - Logs in with the same credentials
 - Calls /api/auth/me using both cookie and bearer token
*/

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

type Json = Record<string, any> | undefined;

function logStep(title: string) {
  console.log(`\n=== ${title} ===`);
}

function extractSetCookie(headers: Headers): string | undefined {
  // Attempt Node's non-standard getSetCookie if present
  const getSetCookie = (headers as any).getSetCookie as (() => string[]) | undefined;
  const cookies = typeof getSetCookie === "function" ? getSetCookie.call(headers) : undefined;
  if (cookies && cookies.length > 0) return cookies.map((c: string) => c.split(";", 1)[0]).join("; ");
  // Fallback for environments that merge set-cookie
  const cookieHeader = headers.get("set-cookie");
  if (!cookieHeader) return undefined;
  const first = cookieHeader.split(",")[0];
  return first.split(";", 1)[0];
}

async function parseJsonSafe(res: Response): Promise<Json> {
  try {
    return (await res.json()) as Json;
  } catch {
    return undefined;
  }
}

async function main() {
  const email = `auth_test_${Date.now()}@example.com`;
  const password = "Test123"; // aligns with relaxed validation

  let cookie: string | undefined;
  let token: string | undefined;

  // 1) Register
  logStep("Register");
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      role: "staff",
      first_name: "Auth",
      last_name: "Tester",
    }),
  });
  const regJson = await parseJsonSafe(regRes);
  cookie = extractSetCookie(regRes.headers) || cookie;
  token = (regJson as any)?.data?.token || token;
  console.log("status:", regRes.status);
  console.log("cookie:", cookie ?? "<none>");
  console.log("token:", token ? `${token.slice(0, 16)}...` : "<none>");
  console.log("body:", JSON.stringify(regJson));

  // 2) Login
  logStep("Login");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify({ email, password }),
  });
  const loginJson = await parseJsonSafe(loginRes);
  const loginCookie = extractSetCookie(loginRes.headers);
  if (loginCookie) cookie = loginCookie;
  const loginToken = (loginJson as any)?.data?.token as string | undefined;
  if (loginToken) token = loginToken;
  console.log("status:", loginRes.status);
  console.log("cookie:", cookie ?? "<none>");
  console.log("token:", token ? `${token.slice(0, 16)}...` : "<none>");
  console.log("body:", JSON.stringify(loginJson));

  // 3) /me with cookie only
  logStep("/api/auth/me with cookie only");
  const meCookieRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { ...(cookie ? { Cookie: cookie } : {}) },
  });
  const meCookieJson = await parseJsonSafe(meCookieRes);
  console.log("status:", meCookieRes.status);
  console.log("body:", JSON.stringify(meCookieJson));

  // 4) /me with bearer token only
  logStep("/api/auth/me with bearer token only");
  const meBearerRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const meBearerJson = await parseJsonSafe(meBearerRes);
  console.log("status:", meBearerRes.status);
  console.log("body:", JSON.stringify(meBearerJson));
}

main().catch((err) => {
  console.error("Auth flow test failed:", err);
  process.exit(1);
});


