// ABRE MODAL DE VISUALIZAÇÃO
function pageView() {
    const pages = document.querySelectorAll('.form-container');

    pages.forEach(page => {
        page.classList.toggle('show');
    });
}

/* TOGGLE */
const toggle = document.getElementById('osToggle');
const tabs = document.querySelectorAll('.tab');

toggle.querySelectorAll('a').forEach(btn => {
    btn.onclick = e => {
        e.preventDefault();
        toggle.querySelectorAll('a').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabs.forEach(t => t.classList.remove('active'));

        if (btn.dataset.tab === 'pack') {
            toggle.classList.add('second-active');
            document.querySelector('.tab-pack').classList.add('active');
        } else {
            toggle.classList.remove('second-active');
            document.querySelector('.tab-single').classList.add('active');
        }
    }
});

// GERADOR DE HTML (monta o html para impressão)
function create_print_html(p_data, p_hora, p_item, p_fig, p_fonte, p_entrega, p_nome, p_obs, p_orig) {

    const print_area = `
            <div class="os-header">
                <h2>ORDEM DE SERVIÇO <br> PARA GRAVAÇÃO</h2>
            </div>
            <div class="linha"></div>

            <div class="detalhes">
            <div class="detalhe">
                <strong class="header_print">DATA:</strong> ${p_data}<br>
            </div>
            <div class="detalhe">
                <strong class="header_print">HORA:</strong> ${p_hora}<br>
            </div>
            <div class="detalhe">
                <strong class="header_print">ORIGEM:</strong> ${p_orig}<br>
            </div>
            <div class="detalhe">
                <strong class="info_print">ENTREGAR:</strong> ${p_entrega}<br>
            </div>
            </div>

            <div class="linha"></div>

            <div class="detalhe">
                <strong class="info_print">ITEM:</strong> ${p_item}<br>
            </div>
            <div class="detalhe">
                <strong class="info_print">FIGURA:</strong> ${p_fig}<br>
            </div>
            <div class="detalhe">
                <strong class="info_print">FONTE:</strong> ${p_fonte}<br>
            </div>
            <div class="linha"></div>

            <p class="nome-header">CONTEUDO DO NOME:</p>
            <h3 class="nome-destaque">${p_nome}</h3>

            <div class="linha"></div>

            <strong>OBSERVAÇÕES:</strong>
            <p class="obs-box">${p_obs}</p>

            <div class="linha"></div>
            <div class="rodape_print">PRODUÇÃO LOCAL</div>

        `;
    return print_area;
}

// IMPRIME OS UNICA
function print_single() {
    const print_area = document.getElementById('printArea');

    const inputNome = document.getElementById('nome');
    const nome = inputNome.value;

    if (!nome.trim()) {
        alert("Por favor, preencha o nome para gravação.");
        inputNome.focus();
        return;
    }

    // Captura data e hora
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-br');
    const hora = agora.toLocaleTimeString('pt-br', { hour: '2-digit', minute: '2-digit' });

    // Alimenta o cupom (Preservando maiúsculas e minúsculas)
    const item = document.getElementById('item').value;
    const fonte = document.getElementById('fonte').value;
    const entrega = (document.getElementById('dataEntrega').value).split('-').reverse().join('/') || data;
    const figura = document.getElementById('figura').value || "NENHUMA";
    const obs = document.getElementById('obs').value || "-";
    const orig = document.getElementById('origem').value;

    // Gera o HTML com os dados capturados
    let html = create_print_html(data, hora, item, figura, fonte, entrega, nome, obs, orig);

    html += `
        <div class="linha"></div>
        <div class="linha"></div>

        <div class="os-footer">
            <canvas id="qrcode"></canvas>
            <p id="linkPDF" style="font-size:10px; word-break: break-all;"></p>
        </div>
    `

    print_area.innerHTML = html;


    // 🔽 AQUI: converte esse HTML pronto em PDF e posta na nuvem
    gerarPDFdoHTML("single", print_area, orig);
}


/* GERAR PACOTE */
function print_pack() {
    const print_area = document.getElementById('printArea');


    // Captura data e hora
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-br');
    const hora = agora.toLocaleTimeString('pt-br', { hour: '2-digit', minute: '2-digit' });

    // Alimenta o cupom (Preservando maiúsculas e minúsculas)
    const item = document.getElementById('itemPack').value;
    const fonte = document.getElementById('fontePack').value;
    const entrega = (document.getElementById('dataEntregaPack').value).split('-').reverse().join('/') || data;
    const figura = document.getElementById('figuraPack').value || "NENHUMA";
    const obs = document.getElementById('obsPack').value || "-";
    const orig = document.getElementById('origemPack').value;

    const nomes = document.getElementById('nomesPack').value;

    const lista_nomes = nomes
        .split(/\r?\n/)      // divide por linha (Windows, Linux, Mac)
        .map(l => l.trim())  // remove espaços extras
        .filter(l => l);     // remove linhas vazias

    let html = '';
    lista_nomes.forEach(nome => {
        if (html != '') {
            html += `
            <div class="linha"></div>
            <p>PRÓXIMA GRAVAÇÃO</p>
            <div class="linha"></div>
            `;
        }
        // Gera o HTML com os dados capturados
        html += create_print_html(data, hora, item, figura, fonte, entrega, nome, obs, orig);
    });
    html += `
        <div class="linha"></div>
        <div class="linha"></div>

        <div class="os-footer">
            <canvas id="qrcode"></canvas>
            <p id="linkPDF" style="font-size:10px; word-break: break-all;"></p>
        </div>
    `
    print_area.innerHTML = html;
    // 🔽 AQUI: converte esse HTML pronto em PDF e imprime

    gerarPDFdoHTML("pack", print_area, orig);


}



// CARREGA EXEMPLO DE FONTE
const fontes = [
    { nome: "NOKA TRIAL", arquivo: "NOKA TRIAL.otf" },
    { nome: "JOSEPH SOPHIA", arquivo: "JOSEPH SOPHIA.ttf" },
    { nome: "ROMANTIC DATES", arquivo: "ROMANTIC DATES.ttf" },
    { nome: "THE KING OF ROMANCE", arquivo: "THE KING OF ROMANCE.ttf" },
    { nome: "CHARLOTTE", arquivo: "CHARLOTTE.otf" }
];

const selectFonte = document.getElementById("fonte");
const selectFonte_pack = document.getElementById("fontePack");
const exemplo = document.querySelector(".exemploFonte");
const exemplo_pack = document.querySelector(".exemploFontePack");


// Registra fontes dinamicamente
function carregarFontes() {
    const style = document.createElement("style");

    fontes.forEach(f => {
        style.innerHTML += `
                @font-face {
                    font-family: '${f.nome}';
                    src: url('./fonts/${f.arquivo}');
                }
            `;

        const option = document.createElement("option");
        option.value = f.nome;
        option.textContent = f.nome;
        selectFonte.appendChild(option);

        const option_pack = document.createElement("option");
        option_pack.value = f.nome;
        option_pack.textContent = f.nome;
        selectFonte_pack.appendChild(option_pack);

    });

    document.head.appendChild(style);
}

// Aplica fonte no exemplo
selectFonte.addEventListener("change", () => {
    exemplo.style.fontFamily = selectFonte.value;
    exemplo.textContent = "Teste de Fonte Click Phone";
});
selectFonte_pack.addEventListener("change", () => {
    exemplo_pack.style.fontFamily = selectFonte_pack.value;
    exemplo_pack.textContent = "Teste de Fonte Click Phone";
});

// Inicializa
window.addEventListener("load", () => {
    carregarFontes();
    // Define fonte inicial
    selectFonte.selectedIndex = 0;
    exemplo.style.fontFamily = selectFonte.value;
    exemplo.textContent = "Teste de Fonte Click Phone";

    selectFonte_pack.selectedIndex = 0;
    exemplo_pack.style.fontFamily = selectFonte_pack.value;
    exemplo_pack.textContent = "Teste de Fonte Click Phone";
});


// ENVIAR OS PARA A NUVEM

async function gerarPDFdoHTML(tipo, print_area, origem) {
    const printArea = document.getElementById("printArea");

    // garante repaint + fontes
    await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(r));

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    const nomeArquivo = `${tipo}_${dd}_${mm}_${yyyy}__${hh}_${min}.pdf`;

    const opt = {
        margin: 8,
        filename: nomeArquivo,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }
    };

    const pdfBlob = await html2pdf()
        .set(opt)
        .from(printArea)
        .outputPdf("blob");

    const linkPDF = await enviarPDFParaNuvem(pdfBlob, nomeArquivo, origem);

    // 3. Gera o QR Code (AQUI 👇)
    const qrCanvas = document.getElementById("qrcode");

    await QRCode.toCanvas(qrCanvas, linkPDF, {
        width: 120,
        margin: 1
    });

    // 4. Escreve o link abaixo do QR
    document.getElementById("linkPDF").textContent = linkPDF;

    // impressão continua normal
    setTimeout(() => window.print(), 200);
    setTimeout(() => print_area.innerHTML = "", 300);

}

async function enviarPDFParaNuvem(pdfBlob, nomeArquivo, origem) {
    const formData = new FormData();
    formData.append("file", pdfBlob, nomeArquivo);

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    const tipo = nomeArquivo.startsWith("pack") ? "pack" : "single";

    formData.append("type", tipo);
    formData.append("date", `${yyyy}-${mm}-${dd}`); // formato DATE válido
    formData.append("hour", `${hh}:${min}`);        // formato TIME válido
    formData.append("origin", origem);

    const res = await fetch(
        "https://os-click-laser.mitosobr.workers.dev/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await res.json();
    return data.url;
}


function create_list_os_html(id, hora, tipo, origem, link) {
    return `
            <div id="${id}" class="os-box horizontal-div" >
                <div>
                    HORA
                    <p>${hora}</p>
                </div>
                <div>
                    TIPO
                    <p>${tipo}</p>
                </div>
                <div>
                    SITUAÇÃO
                    <select class="select-os">
                        <option value="0" class="opt-os-0">Pedido aceito</option>
                        <option value="1" class="opt-os-1">Em produção</option>
                        <option value="2" class="opt-os-2">Finalizado</option>
                        <option value="2" class="opt-os-3">Cancelado</option>
                    </select>
                </div>
                <div>
                    ORIGEM
                    <p>${origem}</p>
                </div>
                <div>
                    <a href="href="${link}"">
                        <i class="bi bi-eye"></i>
                    </a>
                    <a href="href="${link}"">
                        <i class="bi bi-eye"></i>
                    </a>
                </div>
            </div>
    `
}

async function buscarOSPorData() {
    const dataSelecionada = document.getElementById("dataSelecionada").value;
    const os_view = document.getElementById("view-os");

    os_view.innerHTML = "<p>Buscando...</p>";

    const lista = await listarOS(dataSelecionada);

    if (!lista.length) {
        os_view.innerHTML = "<p>Nenhuma OS encontrada para esta data.</p>";
        return;
    }

    let html = "";
    lista.forEach(os => {

        let tipo = ""
        if (os.type == "pack") {
            tipo = "PACOTE"
        } else {
            tipo = "ÚNICO"
        }

        html += create_list_os_html(
            os.uid,
            os.hour,
            tipo,
            os.origin,
            os.link_pdf
        );

        let box_os = document.getElementById(os.uid);
        let select_os = box_os.querySelector(".select-os");

        select_os.value = os.status;
        select_os.addEventListener("change", async () => {
            const novoStatus = Number(select_os.value);

            try {
                const res = await fetch(
                    "https://os-click-laser.mitosobr.workers.dev/update-status",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: os.uid,
                            status: novoStatus
                        })
                    }
                );

                if (!res.ok) {
                    throw new Error("Erro ao atualizar status");
                }

                const data = await res.json();
                console.log("Status atualizado:", data);

            } catch (err) {
                alert("Erro ao atualizar status da OS");
                console.error(err);
            }
        });
    });

    os_view.innerHTML = html;
}

async function listarOS(dataSelecionada) {
    if (!dataSelecionada) {
        alert("Selecione uma data");
        return [];
    }

    try {
        const res = await fetch(
            `https://os-click-laser.mitosobr.workers.dev/list?date=${dataSelecionada}`
        );

        if (!res.ok) {
            throw new Error("Erro ao buscar OS");
        }

        const dados = await res.json();
        return dados; // array de registros do Supabase

    } catch (err) {
        console.error(err);
        alert("Erro ao consultar os serviços");
        return [];
    }
}
