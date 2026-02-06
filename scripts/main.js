const URL_BASE = "https://os-click-laser.mitosobr.workers.dev";
// ABRE MODAL DE VISUALIZAÇÃO
function pageView() {
    const pages = document.querySelectorAll('.form-container');

    pages.forEach(page => {
        page.classList.toggle('show');
    });
}

// PACOTE DE GARRAFAS SEM NOME
const packSemNome = document.getElementById("packSemNome");
const qtdPack = document.getElementById("qtdPack");
const qtdPackLabel = document.getElementById("qtdPackLabel");
const nomesPack = document.getElementById("nomesPack");

packSemNome.addEventListener("change", () => {
    const ativo = packSemNome.checked;

    qtdPack.style.display = ativo ? "block" : "none";
    qtdPackLabel.style.display = ativo ? "block" : "none";

    nomesPack.disabled = ativo;
    if (ativo) nomesPack.value = "";
});

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
    hideLoader();
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

    // Alimenta o cupom
    const item = document.getElementById('item').value;
    const fonte = document.getElementById('fonte').value;
    const entrega = (document.getElementById('dataEntrega').value).split('-').reverse().join('/') || data;
    const figura = document.getElementById('figura').value || "NENHUMA";
    const obs = document.getElementById('obs').value || "-";
    const orig = document.getElementById('origem').value;

    // --- NOVA LÓGICA DE DICIONÁRIO ---
    let dados = {};
    let conteudo = {
        "date": data,
        "time": hora,
        "item": item,
        "figure": figura,
        "font": fonte,
        "delivery": entrega,
        "name": nome,
        "obs": obs,
        "origin": orig
    };

    console.log(conteudo);
    // Adiciona como o primeiro item (índice 0)
    dados[0] = conteudo;
    console.log(dados);
    // ---------------------------------

    // Gera o HTML com os dados capturados
    let html = create_print_html(data, hora, item, figura, fonte, entrega, nome, obs, orig);

    html += `
        <div class="linha"></div>
        <div class="linha"></div>

        <div class="os-footer">
            <canvas id="qrcode"></canvas>
            <p id="linkPDF" style="font-size:10px; word-break: break-all;"></p>
        </div>
    `;

    print_area.innerHTML = html;

    console.log("Dados de OS:", dados);
    // Agora enviamos o objeto 'dados' como quarto parâmetro
    gerarPDFdoHTML("single", print_area, orig, dados);
    hideLoader();
}


/* GERAR PACOTE */
function print_pack() {
    hideLoader();

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

    const semNome = packSemNome.checked;
    let html = '';
    let dados = {};
    let conteudo = {}
    let proximoId = 0;

    // Função para adicionar
    function adicionarItem(conteudo) {
        dados[proximoId] = conteudo;
        proximoId++;
    }


    if (semNome) {
        const num_garrafas = document.getElementById('qtdPack').value;
        if (!num_garrafas || num_garrafas <= 0) {
            alert("Informe a quantidade de garrafas.");
            return;
        }

        const s_nome = "Gravações sem nome";
        let obsv = `${num_garrafas} unidades sem nome`
        if (obs != "-") {
            obsv += "\n"
            obsv += obs
        }
        html = create_print_html(data, hora, item, figura, fonte, entrega, s_nome, obsv, orig);
        conteudo = { "date": data, "time": hora, "item": item, "figure": figura, "font": fonte, "delivery": entrega, "name": s_nome, "obs": obsv, "origin": orig };
        adicionarItem(conteudo);
    } else {
        const nomes = document.getElementById('nomesPack').value;

        let lista_nomes = nomes
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l);

        lista_nomes.forEach(nome => {
            if (html != '') {
                html += `
                    <div class="linha"></div>
                    <p>PRÓXIMA GRAVAÇÃO</p>
                    <div class="linha"></div>
                `;
            }

            // 1. Gera o HTML
            html += create_print_html(data, hora, item, figura, fonte, entrega, nome, obs, orig);

            // 2. Cria o objeto com os dados CORRETOS (usando 'nome' e 'obs')
            let conteudo = {
                "date": data,
                "time": hora,
                "item": item,
                "figure": figura,
                "font": fonte,
                "delivery": entrega,
                "name": nome, // <--- Aqui usamos a variável 'nome' do loop
                "obs": obs,   // <--- Aqui usamos a 'obs' capturada no início
                "origin": orig
            };

            // 3. Adiciona ao dicionário 'dados'
            adicionarItem(conteudo);
        });
    }

    // ... (resto do código: innerHTML, gerarPDFdoHTML, etc)

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

    gerarPDFdoHTML("pack", print_area, orig, dados);

    hideLoader();
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

async function gerarPDFdoHTML(tipo, print_area, origem, dados) {
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

    console.log(dados);
    const linkPDF = await enviarPDFParaNuvem(pdfBlob, nomeArquivo, origem, dados);

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

async function enviarPDFParaNuvem(pdfBlob, nomeArquivo, origem, data) {
    const formData = new FormData();
    formData.append("file", pdfBlob, nomeArquivo);

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    const tipo = nomeArquivo.startsWith("pack") ? "pack" : "single";

    console.log("revisão de dados:", JSON.stringify(data));
    formData.append("type", tipo);
    formData.append("date", `${yyyy}-${mm}-${dd}`); // formato DATE válido
    formData.append("hour", `${hh}:${min}`);        // formato TIME válido
    formData.append("origin", origem);
    formData.append("data_json", JSON.stringify(data));

    const res = await fetch(
        `${URL_BASE}/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data_pack = await res.json();
    return data_pack.url;
}


function create_list_os_html(hora, tipo, origem, link, uid, data_json) {
    return `
                <div>
                    <h3>HORA</h3>
                    <p>${hora}</p>
                </div>
                <div>
                    TIPO
                    <p>${tipo}</p>
                </div>
                <div>
                    <h3>SITUAÇÃO</h3>
                    <select name="status" class="select-os">
                        <option value="0" class="opt-os-0">Pedido aceito</option>
                        <option value="1" class="opt-os-1">Em produção</option>
                        <option value="2" class="opt-os-2">Finalizado</option>
                        <option value="3" class="opt-os-3">Cancelado</option>
                    </select>
                </div>
                <div class="box_origem">
                    <h3>ORIGEM</h3>
                    <p>${origem}</p>
                </div>
                <div class="box_btn_os horizontal-div">
                    <button class="fake-btn" onclick='visualizarDetalhes("${uid}", ${JSON.stringify(data_json)})'>
                        <i class="bi bi-eye" style="color: white;"></i>
                    </button>
                    <a class="fake-btn" href="${link}" target="_blank">
                        <i class="bi bi-filetype-pdf" style="color: white;"></i>
                    </a>
                </div>
    `
}

function visualizarDetalhes(uid, dados_os) {
    if (!uid || !dados_os) {
        alert("Dados da OS não encontrados.");
        return;
    }

    // 1. Tenta converter para objeto se for uma string
    let dadosItens;
    try {
        dadosItens = typeof dados_os === 'string' ? JSON.parse(dados_os) : dados_os;
    } catch (e) {
        console.error("Erro ao processar JSON:", e);
        alert("Erro ao ler os detalhes da OS.");
        return;
    }

    // 2. Cria uma nova janela
    const novaJanela = window.open('', '_blank');

    // 3. Monta o HTML
    let conteudoHtml = `
        <html>
        <head>
            <title>Visualizar OS - ${uid}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #f0f0f0; display: flex; flex-direction: column; align-items: center; }
                .cupom { background: white; width: 350px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px; }
                .linha { border-bottom: 1px dashed #ccc; margin: 15px 0; }
                .divisor-item { text-align: center; font-weight: bold; margin: 20px 0; border: 1px solid #000; padding: 5px; background: #eee; }
                .item-bloco p { margin: 8px 0; font-size: 14px; line-height: 1.4; }
                strong { color: #333; }
                .btn-print { margin-top: 20px; padding: 10px 20px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 5px; }
                @media print { .btn-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="cupom">
                <h2 style="text-align:center; margin-bottom:0;">DETALHES DA OS</h2>
                <p style="text-align:center; font-size:11px; color: #666;">ID: ${uid}</p>
                <div class="linha"></div>
    `;

    // 4. Itera sobre o dicionário (0, 1, 2...)
    // Usamos Object.values para pegar os objetos dentro de "0", "1", etc.
    const listaItens = Object.values(dadosItens);

    listaItens.forEach((item, index) => {
        if (index > 0) {
            conteudoHtml += `<div class="divisor-item">PRÓXIMA GRAVAÇÃO</div>`;
        }

        conteudoHtml += `
            <div class="item-bloco">
                <p><strong>DATA/HORA:</strong> ${item.date} às ${item.time}</p>
                <p><strong>ORIGEM:</strong> ${item.origin}</p>
                <p><strong>ENTREGA:</strong> ${item.delivery}</p>
                <div class="linha"></div>
                <p><strong>ITEM:</strong> ${item.item}</p>
                <p><strong>NOME:</strong> <span style="font-size:18px; font-weight:bold;">${item.name}</span></p>
                <p><strong>FONTE:</strong> ${item.font}</p>
                <p><strong>FIGURA:</strong> ${item.figure}</p>
                <p><strong>OBS:</strong> ${item.obs}</p>
            </div>
        `;
    });

    conteudoHtml += `
                <div class="linha"></div>
                <p style="text-align:center; font-size:10px;">OS Click Laser - Produção</p>
            </div>
            <button class="btn-print" onclick="window.print()">Imprimir Via de Produção</button>
        </body>
        </html>
    `;

    novaJanela.document.write(conteudoHtml);
    novaJanela.document.close();
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

    os_view.innerHTML = "";

    lista.forEach(os => {
        let tipo = ""
        if (os.type == "pack") {
            tipo = "PACOTE"
        } else {
            tipo = "ÚNICO"
        }

        const box_os = document.createElement("div");

        box_os.classList.add("box-os");
        box_os.classList.add("horizontal-div");
        box_os.setAttribute("id", os.uid);

        const html = create_list_os_html(
            os.hour,
            tipo,
            os.origin,
            os.link_pdf,
            os.uid,
            os.data_json
        );

        box_os.innerHTML = html;

        os_view.appendChild(box_os);

        const select_os = box_os.querySelector(".select-os");

        select_os.value = os.status;

        select_os.addEventListener("change", async () => {
            const novoStatus = Number(select_os.value);
            console.log(novoStatus)

            try {
                const res = await fetch(
                    `${URL_BASE}/update-status`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            uid: os.uid,
                            status: novoStatus
                        })
                    }
                );

                if (!res.ok) {
                    throw new Error("Erro ao atualizar status");
                }

                const data = await res.json();

            } catch (err) {
                alert("Erro ao atualizar status da OS");
                console.log(err);
            }
        });
    });

}

async function listarOS(dataSelecionada) {
    if (!dataSelecionada) {
        alert("Selecione uma data");
        return [];
    }

    try {
        const res = await fetch(
            `${URL_BASE}/list?date=${dataSelecionada}`
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


function hideLoader() {
    const loader = document.getElementById('page_loader');
    if (loader) {
        loader.classList.toggle('hidden');
    }
}
