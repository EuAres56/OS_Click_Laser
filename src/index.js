export default {
    async fetch(request, env, ctx) {
        try {
            if (request.method !== "POST") {
                return new Response("Método não permitido", { status: 405 });
            }

            const contentType = request.headers.get("content-type") || "";

            if (!contentType.includes("multipart/form-data")) {
                return new Response("Formato inválido", { status: 400 });
            }

            const formData = await request.formData();
            const file = formData.get("file");

            if (!(file instanceof File)) {
                return new Response("Arquivo inválido ou não enviado", { status: 400 });
            }

            const fileName = file.name;

            await env.R2_OS.put(fileName, file.stream(), {
                httpMetadata: {
                    contentType: file.type || "application/octet-stream",
                },
            });

            return new Response(
                JSON.stringify({
                    status: "ok",
                    arquivo: fileName,
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (err) {
            return new Response(
                JSON.stringify({
                    error: "Erro interno",
                    message: err.message,
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    },
};
