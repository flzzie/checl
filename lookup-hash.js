function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json" }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const hash = (body.hash || "").trim();
    const apiKey = body.apiKey;
    if (!hash || !apiKey) return jsonResponse({ error: "Missing hash or apiKey" }, 400);

    const res = await fetch("https://www.virustotal.com/api/v3/files/" + encodeURIComponent(hash), {
      headers: { "x-apikey": apiKey }
    });

    if (res.status === 404) return jsonResponse({ notFound: true });
    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: "VirusTotal lookup failed", detail: errText }, res.status);
    }

    const data = await res.json();
    const attrs = data.data.attributes;
    return jsonResponse({
      stats: attrs.last_analysis_stats,
      name: attrs.meaningful_name || (attrs.names && attrs.names[0]) || null,
      type: attrs.type_description || null,
      size: attrs.size || null,
      firstSeen: attrs.first_submission_date || null
    });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
