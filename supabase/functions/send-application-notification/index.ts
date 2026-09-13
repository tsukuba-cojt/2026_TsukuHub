import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const response = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const htmlEscape = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const textValue = (value: unknown) => String(value ?? "").trim();

const field = (label: string, value: unknown) =>
  `<tr><th style="padding:8px 12px;text-align:left;vertical-align:top;background:#f4f7fb;white-space:nowrap">${htmlEscape(label)}</th><td style="padding:8px 12px;white-space:pre-wrap">${htmlEscape(value) || "未入力"}</td></tr>`;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405);

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return response({ error: "missing_authorization" }, 401);
  const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!accessToken) return response({ error: "missing_authorization" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFrom = Deno.env.get("RESEND_FROM_EMAIL");
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return response({ error: "supabase_not_configured" }, 500);
  if (!resendApiKey || !resendFrom) return response({ error: "resend_not_configured" }, 503);

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData.user) return response({ error: "invalid_authorization" }, 401);

  let body: { application_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return response({ error: "invalid_json" }, 400);
  }
  const applicationId = textValue(body.application_id);
  if (!applicationId) return response({ error: "application_id_required" }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: application, error: applicationError } = await adminClient
    .from("applications")
    .select("id, user_id, university_id, applicant_name, email, faculty, graduation_year, motivation, skills, portfolio_url, additional_notes, created_at, internship:internships(id, company_name, company_contact_email, title)")
    .eq("id", applicationId)
    .maybeSingle();
  if (applicationError) {
    console.error("application_lookup_failed", applicationError.code);
    return response({ error: "application_lookup_failed" }, 500);
  }
  if (!application || application.user_id !== userData.user.id) return response({ error: "application_not_found" }, 404);

  const internship = Array.isArray(application.internship) ? application.internship[0] : application.internship;
  const [{ data: profile }, { data: university }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, name, grade, faculty, major, category, university_id")
      .eq("id", userData.user.id)
      .maybeSingle(),
    adminClient
      .from("universities")
      .select("name, short_name")
      .eq("id", application.university_id)
      .maybeSingle(),
  ]);
  const recipient = textValue(internship?.company_contact_email);
  if (!recipient) return response({ error: "company_contact_email_not_configured" }, 422);

  const subject = `【TsukuHub】${textValue(application.applicant_name)}さんからインターン応募がありました`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172b4d"><h1 style="font-size:20px">インターン応募のお知らせ</h1><p>${htmlEscape(internship?.company_name)}「${htmlEscape(internship?.title)}」に応募がありました。</p><h2 style="font-size:16px">応募フォームの入力内容</h2><table style="border-collapse:collapse;width:100%;max-width:720px">${[
    field("氏名", application.applicant_name), field("メールアドレス", application.email), field("所属学群・学類", application.faculty), field("卒業予定年", `${application.graduation_year}年`), field("志望理由", application.motivation), field("経験・スキル", application.skills), field("ポートフォリオURL", application.portfolio_url), field("補足事項", application.additional_notes),
  ].join("")}</table><h2 style="font-size:16px">プロフィール情報</h2><table style="border-collapse:collapse;width:100%;max-width:720px">${[
    field("プロフィール名", profile?.name), field("学年", profile?.grade ? `${profile.grade}年` : ""), field("学群・学部", profile?.faculty), field("学類・研究群", profile?.major), field("カテゴリ", profile?.category), field("大学", university?.name ?? profile?.university_id ?? application.university_id),
  ].join("")}</table><p style="margin-top:20px;color:#526581">このメールに返信すると応募者のメールアドレスへ返信できます。応募日時：${htmlEscape(new Date(application.created_at).toLocaleString("ja-JP"))}</p></div>`;
  const text = `インターン応募のお知らせ\n\n${textValue(internship?.company_name)}「${textValue(internship?.title)}」\n\n応募フォームの入力内容\n氏名: ${textValue(application.applicant_name)}\nメールアドレス: ${textValue(application.email)}\n所属学群・学類: ${textValue(application.faculty)}\n卒業予定年: ${textValue(application.graduation_year)}年\n志望理由: ${textValue(application.motivation)}\n経験・スキル: ${textValue(application.skills)}\nポートフォリオURL: ${textValue(application.portfolio_url) || "未入力"}\n補足事項: ${textValue(application.additional_notes) || "未入力"}\n\nプロフィール情報\nプロフィール名: ${textValue(profile?.name) || "未入力"}\n学年: ${profile?.grade ? `${profile.grade}年` : "未入力"}\n学群・学部: ${textValue(profile?.faculty) || "未入力"}\n学類・研究群: ${textValue(profile?.major) || "未入力"}\nカテゴリ: ${textValue(profile?.category) || "未入力"}\n大学: ${textValue(university?.name ?? profile?.university_id ?? application.university_id)}\n\n応募日時: ${new Date(application.created_at).toLocaleString("ja-JP")}`;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
      "User-Agent": "TsukuHub application notification",
      "Idempotency-Key": `application-${application.id}-submitted`,
    },
    body: JSON.stringify({ from: resendFrom, to: [recipient], reply_to: application.email, subject, html, text }),
  });
  if (!resendResponse.ok) {
    console.error("resend_request_failed", resendResponse.status);
    return response({ error: "notification_delivery_failed" }, 502);
  }
  return response({ notification_sent: true });
});
