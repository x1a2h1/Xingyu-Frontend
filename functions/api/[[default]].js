export async function onRequest({ env, request }) {
  const url = new URL(request.url);
  const fullPath = url.pathname;
  const targetUrl = `${env.base_url}${fullPath}${url.search}`;
  let body;
  if (request.method === "POST") {
    const data = await request.clone().json();
    body = JSON.stringify(data);
  }
  return await fetch(targetUrl, {
    body,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Authorization: request.headers.get("Authorization"),
      "content-type": "application/json; charset=UTF-8",
    },
    method: request.method,
  });
}
