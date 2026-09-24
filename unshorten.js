function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json" }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    let current = (body.url || "").trim();
    if (!current) return jsonResponse({ error: "Missing url" }, 400);
    if (!/^https?:\/\//i.test(current)) current = "https://" + current;

    const chain = [current];
    for (let i = 0; i < 10; i++) {
      let res;
      try {
        res = await fetch(current, { method: "GET", redirect: "manual" });
      } catch (fetchErr) {
        return jsonResponse({ error: "Could not reach " + current, detail: fetchErr.message }, 502);
      }
      if (res.status < 300 || res.status >= 400) break;
      const location = res.headers.get("location");
      if (!location) break;
      current = new URL(location, current).toString();
      chain.push(current);
    }

    return jsonResponse({ final: current, chain: chain, hops: chain.length - 1 });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
