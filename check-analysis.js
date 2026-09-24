function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json" }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const analysisId = body.analysisId;
    const apiKey = body.apiKey;
    if (!analysisId || !apiKey) return jsonResponse({ error: "Missing analysisId or apiKey" }, 400);

    const res = await fetch("https://www.virustotal.com/api/v3/analyses/" + encodeURIComponent(analysisId), {
      headers: { "x-apikey": apiKey }
    });

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: "VirusTotal check failed", detail: errText }, res.status);
    }

    const data = await res.json();
    const attrs = data.data.attributes;
    if (attrs.status === "completed") {
      return jsonResponse({ status: "completed", stats: attrs.stats });
    }
    return jsonResponse({ status: attrs.status });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
