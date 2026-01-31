export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // ===============================
        // CORS (necessário para GitHub Pages)
        // ===============================
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        // Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        // ===============================
        // POST → Upload do PDF
        // ===============================
        if (request.method === "POST" && url.pathname === "/upload") {
            const contentType = request.headers.get("content-type") || "";

            if (!contentType.includes("multipart/form-data")) {
                return new Response("Formato inválido", {
                    status: 400,
                    headers: corsHeaders
                });
            }

            const formData = await request.formData();
            const file = formData.get("file");

            if (!file) {
                return new Response("Arquivo não enviado", {
                    status: 400,
                    headers: corsHeaders
                });
            }

            const fileName = file.name;
            const fileBuffer = await file.arrayBuffer();

            await env.R2_OS.put(fileName, fileBuffer, {
                httpMetadata: {
                    contentType: "application/pdf"
                }
            });

            const fileUrl = `${url.origin}/view/${fileName}`;

            return new Response(
                JSON.stringify({
                    status: "ok",
                    arquivo: fileName,
                    url: fileUrl
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...corsHeaders
                    }
                }
            );
        }

        // ===============================
        // GET → Visualização do PDF
        // ===============================
        if (request.method === "GET" && url.pathname.startsWith("/view/")) {
            const fileName = url.pathname.replace("/view/", "");

            const object = await env.R2_OS.get(fileName);

            if (!object) {
                return new Response("Arquivo não encontrado", {
                    status: 404,
                    headers: corsHeaders
                });
            }

            return new Response(object.body, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Cache-Control": "public, max-age=31536000",
                    ...corsHeaders
                }
            });
        }

        // ===============================
        // Fallback
        // ===============================
        return new Response("Not found", {
            status: 404,
            headers: corsHeaders
        });
    }
};
