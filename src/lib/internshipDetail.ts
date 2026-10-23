export const splitSelectionSteps = (value: string) =>
  value
    .split(/\s*(?:→|➡|＞|>|／|\/|、|,)+\s*/)
    .map((step) => step.trim())
    .filter(Boolean);

export const companyMapSearchUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;

export const companyMapEmbedUrl = (query: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&hl=ja&z=16&output=embed`;

const isGoogleMapsEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "google.com" && host !== "google.co.jp" && host !== "maps.google.com") {
      return false;
    }
    return url.pathname.includes("/maps/embed") || url.searchParams.get("output") === "embed";
  } catch {
    return false;
  }
};

const queryFromGoogleMapsUrl = (value: string) => {
  try {
    const url = new URL(value);
    const query = url.searchParams.get("query") || url.searchParams.get("q");
    if (query?.trim()) return query.trim();
    const place = url.pathname.match(/\/maps\/place\/([^/]+)/);
    if (!place?.[1]) return "";
    return decodeURIComponent(place[1].replace(/\+/g, " "));
  } catch {
    return "";
  }
};

export const companyLocation = (company: {
  company_address?: string | null;
  company_map_url?: string | null;
}) => {
  const address = company.company_address?.trim() ?? "";
  const rawMapUrl = company.company_map_url?.trim() ?? "";
  const mapUrl = rawMapUrl || (address ? companyMapSearchUrl(address) : "");
  const embedQuery = address || queryFromGoogleMapsUrl(rawMapUrl);
  const embedUrl = isGoogleMapsEmbedUrl(rawMapUrl)
    ? rawMapUrl
    : embedQuery
      ? companyMapEmbedUrl(embedQuery)
      : "";
  return { address, mapUrl, embedUrl };
};

export const hasCompanyProfile = (company: {
  company_mission?: string | null;
  company_business?: string | null;
  company_message_to_students?: string | null;
  company_description?: string | null;
  company_address?: string | null;
  company_map_url?: string | null;
}) => {
  const location = companyLocation(company);
  return companyProfileSections(company).length > 0 || Boolean(location.address || location.mapUrl);
};

export const companyProfileSections = (company: {
  company_mission?: string | null;
  company_business?: string | null;
  company_message_to_students?: string | null;
  company_description?: string | null;
}) => {
  const mission = company.company_mission?.trim() ?? "";
  const message = company.company_message_to_students?.trim() ?? "";
  const business =
    company.company_business?.trim() ||
    (!mission && !message ? company.company_description?.trim() ?? "" : "");
  return (
    [
      ["ミッション", mission],
      ["事業内容", business],
      ["学生に一言", message],
    ] as const
  ).filter(([, value]) => value);
};
