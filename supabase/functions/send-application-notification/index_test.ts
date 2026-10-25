import { handleRequest } from "./index.ts";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

for (const name of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "RESEND_FROM_EMAIL"]) {
  Deno.env.set(name, name === "SUPABASE_URL" ? "https://test.supabase.co" : "test-value");
}

type Scenario = { otherOwner?: boolean; missingContact?: boolean; alreadySent?: boolean; resendFails?: boolean };

async function run(scenario: Scenario = {}) {
  const originalFetch = globalThis.fetch;
  const emails: Record<string, unknown>[] = [];
  let recorded = false;
  globalThis.fetch = async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    if (url.includes("/auth/v1/user")) return Response.json({ id: "user-1" });
    if (url.includes("/rest/v1/applications?")) return Response.json([{
      id: "application-1", user_id: scenario.otherOwner ? "user-2" : "user-1",
      university_id: "university-1", applicant_name: "Test", email: "applicant@example.com",
      created_at: "2026-10-23T00:00:00Z",
      internship: { id: "job-1", company_name: "Company", title: "Job" },
    }]);
    if (url.includes("/rest/v1/application_email_notifications")) {
      if (method === "POST") { recorded = true; return new Response(null, { status: 201 }); }
      return Response.json(scenario.alreadySent ? [{ resend_id: "existing-email" }] : []);
    }
    if (url.includes("/rest/v1/internship_recruiter_contacts")) {
      return Response.json(scenario.missingContact ? [] : [{ email: "recruiter@example.com" }]);
    }
    if (url.includes("/rest/v1/profiles") || url.includes("/rest/v1/universities")) return Response.json([]);
    if (url === "https://api.resend.com/emails") {
      emails.push(JSON.parse(String(init?.body)));
      assert(new Headers(init?.headers).get("Idempotency-Key") === "application-application-1-submitted", "stable idempotency key");
      return scenario.resendFails ? Response.json({ error: "failed" }, { status: 429 }) : Response.json({ id: "resend-1" });
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  try {
    const response = await handleRequest(new Request("https://test/functions/v1/notify", {
      method: "POST", headers: { Authorization: "Bearer test-user-token" },
      body: JSON.stringify({ application_id: "application-1" }),
    }));
    return { response, body: await response.json(), emails, recorded };
  } finally { globalThis.fetch = originalFetch; }
}

Deno.test("rejects anonymous requests", async () => {
  const result = await handleRequest(new Request("https://test", { method: "POST" }));
  assert(result.status === 401, "must require authorization");
});
Deno.test("cannot send another applicant's notification", async () => {
  const result = await run({ otherOwner: true });
  assert(result.response.status === 404 && result.emails.length === 0, "must reject other owner");
});
Deno.test("uses the private recruiter address and records successful sending", async () => {
  const result = await run();
  assert(result.body.notification_sent === true && result.recorded, "must record success");
  assert(JSON.stringify(result.emails[0].to) === '["recruiter@example.com"]', "must use stored recipient");
  assert(result.emails[0].reply_to === "applicant@example.com", "reply goes to applicant");
});
Deno.test("does not resend a previously successful notification", async () => {
  const result = await run({ alreadySent: true });
  assert(result.body.notification_sent === true && result.emails.length === 0, "must not duplicate email");
});
Deno.test("missing recipient does not send email", async () => {
  const result = await run({ missingContact: true });
  assert(result.response.status === 422 && result.emails.length === 0, "must require configured recipient");
});
Deno.test("Resend failure does not mark notification as sent", async () => {
  const result = await run({ resendFails: true });
  assert(result.response.status === 502 && !result.recorded, "must allow retry after failure");
});
