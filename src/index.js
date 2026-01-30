export default {
    async fetch(request, env) {

        /* ===== CORS PRE-FLIGHT ===== */
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            });
        }

        /* ===== SOMENTE POST ===== */
        if (request.method !== "POST") {
            return new Response("Método não permitido", {
                status: 405,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        const contentType = request.headers.get("content-type") || "";

        if (!contentType.includes("multipart/form-data")) {
            return new Response("Formato inválido", {
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return new Response("Arquivo não enviado", {
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        const fileName = file.name;
        const buffer = await file.arrayBuffer();

        await env.R2_OS.put(fileName, buffer, {
            httpMetadata: {
                contentType: "application/pdf"
            }
        });

        return new Response(
            JSON.stringify({
                status: "ok",
                arquivo: fileName
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );
    }
};
