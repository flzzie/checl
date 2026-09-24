function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json" }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const url = body.url;
    const apiKey = body.apiKey;
    if (!url || !apiKey) return jsonResponse({ error: "Missing url or apiKey" }, 400);

    const submitRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "x-apikey": apiKey,
        "content-type": "application/x-www-form-urlencoded"
      },
      body: "url=" + encodeURIComponent(url)
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return jsonResponse({ error: "VirusTotal submit failed", detail: errText }, submitRes.status);
    }

    const submitData = await submitRes.json();
    return jsonResponse({ analysisId: submitData.data.id });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
