function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json" }
  });
}

// Proxies to breach.vip's search API. Its exact response schema isn't
// publicly documented in a way we could verify, so this passes the raw
// result straight through - the frontend renders it defensively.
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const term = (body.term || "").trim();
    if (!term) return jsonResponse({ error: "Missing search term" }, 400);

    const fields = body.fields || "email,password,domain,source";
    const params = new URLSearchParams({ term, fields });

    const res = await fetch("https://breach.vip/api/search?" + params.toString(), {
      headers: { "accept": "application/json" }
    });

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: "breach.vip request failed", status: res.status, detail: errText.slice(0, 500) }, res.status);
    }

    const data = await res.json();
    return jsonResponse({ raw: data });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
