export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        // ===============================
        // POST → Upload PDF + Supabase
        // ===============================
        if (request.method === "POST" && url.pathname === "/upload") {

            const contentType = request.headers.get("content-type") || "";
            if (!contentType.includes("multipart/form-data")) {
                return new Response("Formato inválido", { status: 400, headers: corsHeaders });
            }

            const formData = await request.formData();

            const file = formData.get("file");
            const tipo = formData.get("tipe");
            const date = formData.get("date");
            const hour = formData.get("hour");
            const origin = formData.get("origin");

            if (!file || !tipo || !date || !hour || !origin) {
                return new Response("Dados incompletos", {
                    status: 400,
                    headers: corsHeaders
                });
            }

            const fileName = file.name;
            const fileBuffer = await file.arrayBuffer();

            // 🔹 salva no R2
            await env.R2_OS.put(fileName, fileBuffer, {
                httpMetadata: { contentType: "application/pdf" }
            });

            const fileUrl = `${url.origin}/view/${fileName}`;

            // 🔹 grava no Supabase
            const supabaseRes = await fetch(
                `${env.SUPABASE_URL}/rest/v1/history_services_click_laser`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": env.SUPABASE_SERVICE_KEY,
                        "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({
                        type: tipo,
                        date,
                        hour,
                        origin,
                        link_pdf: fileUrl,
                        status: 1
                    })
                }
            );

            if (!supabaseRes.ok) {
                return new Response("Erro ao salvar no Supabase", {
                    status: 500,
                    headers: corsHeaders
                });
            }

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
        // GET → Visualização PDF
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

        return new Response("Not found", {
            status: 404,
            headers: corsHeaders
        });
    }
};
