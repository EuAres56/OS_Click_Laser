export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        // ===============================
        // CORS preflight
        // ===============================
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // ===============================
        // POST → Upload PDF + Supabase
        // ===============================
        if (request.method === "POST" && url.pathname === "/upload") {

            const contentType = request.headers.get("content-type") || "";
            if (!contentType.includes("multipart/form-data")) {
                return new Response(
                    JSON.stringify({ error: "Formato inválido" }),
                    { status: 400, headers: corsHeaders }
                );
            }

            const formData = await request.formData();

            const file = formData.get("file");
            const type = formData.get("type");
            const date = formData.get("date");
            const hour = formData.get("hour");
            const origin = formData.get("origin");

            if (!file || !type || !date || !hour || !origin) {
                return new Response(
                    JSON.stringify({ error: "Dados incompletos" }),
                    { status: 400, headers: corsHeaders }
                );
            }

            const fileName = file.name;
            const fileBuffer = await file.arrayBuffer();

            // 🔹 Salva no R2
            await env.R2_OS.put(fileName, fileBuffer, {
                httpMetadata: { contentType: "application/pdf" }
            });

            const fileUrl = `${url.origin}/view/${fileName}`;

            // 🔹 Salva no Supabase
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
                        type,
                        date,
                        hour,
                        origin,
                        link_pdf: fileUrl,
                        status: 0
                    })
                }
            );

            if (!supabaseRes.ok) {
                const err = await supabaseRes.text();
                return new Response(
                    JSON.stringify({ error: "Erro Supabase", details: err }),
                    { status: 500, headers: corsHeaders }
                );
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
        // GET → Listar OS por data
        // ===============================
        if (request.method === "GET" && url.pathname === "/list") {

            const date = url.searchParams.get("date");

            if (!date) {
                return new Response(
                    JSON.stringify({ error: "Data não informada" }),
                    { status: 400, headers: corsHeaders }
                );
            }

            const supabaseRes = await fetch(
                `${env.SUPABASE_URL}/rest/v1/history_services_click_laser?date=eq.${date}&order=hour.asc`,
                {
                    headers: {
                        "apikey": env.SUPABASE_SERVICE_KEY,
                        "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
                        "Accept": "application/json"
                    }
                }
            );

            if (!supabaseRes.ok) {
                const err = await supabaseRes.text();
                return new Response(
                    JSON.stringify({ error: "Erro ao buscar dados", details: err }),
                    { status: 500, headers: corsHeaders }
                );
            }

            const data = await supabaseRes.json();

            return new Response(
                JSON.stringify(data),
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
        // POST → Atualizar STATUS da OS
        // ===============================
        if (request.method === "POST" && url.pathname === "/update-status") {

            const body = await request.json();
            const { uid, status } = body;

            const statusNumber = Number(status);

            const statusPermitidos = [0, 1, 2, 3];
            if (!Number.isInteger(statusNumber) || !statusPermitidos.includes(statusNumber)) {
                return new Response(
                    JSON.stringify({ error: "Status inválido" }),
                    { status: 400, headers: corsHeaders }
                );
            }

            const supabaseRes = await fetch(
                `${env.SUPABASE_URL}/rest/v1/history_services_click_laser?uid=eq.${uid}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": env.SUPABASE_SERVICE_KEY,
                        "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({ status: statusNumber })
                }
            );

            if (!supabaseRes.ok) {
                const err = await supabaseRes.text();
                return new Response(
                    JSON.stringify({ error: "Erro ao atualizar status", details: err }),
                    { status: 500, headers: corsHeaders }
                );
            }

            return new Response(
                JSON.stringify({ status: "ok", uid, new_status: status }),
                { headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
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
