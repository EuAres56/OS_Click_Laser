export default {
    async fetch(request, env) {

        if (request.method !== "POST") {
            return new Response("Método não permitido", { status: 405 });
        }

        const contentType = request.headers.get("content-type") || "";

        if (!contentType.includes("multipart/form-data")) {
            return new Response("Formato inválido", { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return new Response("Arquivo não enviado", { status: 400 });
        }

        const fileName = file.name;
        const fileBuffer = await file.arrayBuffer();

        await env.R2_OS.put(fileName, fileBuffer, {
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
                headers: { "Content-Type": "application/json" }
            }
        );
    }
};
