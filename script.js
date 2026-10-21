
const paisesIniciais = [
    { id: "brasil", nome: "Brasil", continente: "América", bandeira: "🇧🇷" },
    { id: "canada", nome: "Canadá", continente: "América", bandeira: "🇨🇦" },
    { id: "alemanha", nome: "Alemanha", continente: "Europa", bandeira: "🇩🇪" },
    { id: "italia", nome: "Itália", continente: "Europa", bandeira: "🇮🇹" },
    { id: "egito", nome: "Egito", continente: "África", bandeira: "🇪🇬" },
    { id: "quenia", nome: "Quênia", continente: "África", bandeira: "🇰🇪" },
    { id: "japao", nome: "Japão", continente: "Ásia", bandeira: "🇯🇵" },
    { id: "india", nome: "Índia", continente: "Ásia", bandeira: "🇮🇳" },
    { id: "australia", nome: "Austrália", continente: "Oceania", bandeira: "🇦🇺" },
    { id: "fiji", nome: "Fiji", continente: "Oceania", bandeira: "🇫🇯" }
];

const listaPaises = document.getElementById("countries");
const pontuacaoElemento = document.getElementById("score");
const progressoElemento = document.getElementById("progress");
const mensagem = document.getElementById("message");
const resultado = document.getElementById("result");
const pontuacaoFinal = document.getElementById("finalScore");

const continentes = document.querySelectorAll(".continente");

let paises = [];
let pontuacao = 0;
let acertos = 0;
let paisArrastado = null;

function embaralhar(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function iniciarJogo() {
    paises = embaralhar(paisesIniciais).map(pais => ({
        ...pais,
        concluido: false
    }));

    pontuacao = 0;
    acertos = 0;
    paisArrastado = null;

    listaPaises.replaceChildren();

    document.querySelectorAll(".dropped-countries")
        .forEach(area => area.replaceChildren());

    continentes.forEach(continente => {
        continente.classList.remove("destino", "acertado");
    });

    resultado.hidden = true;

    mostrarMensagem(
        "💡 Arraste cada país para o continente correto!",
        ""
    );

    atualizarPlacar();

    paises.forEach(pais => {
        listaPaises.appendChild(criarCartao(pais));
    });
}

function criarCartao(pais) {
    const cartao = document.createElement("div");

    cartao.className = "pais";
    cartao.draggable = true;
    cartao.dataset.id = pais.id;

    const bandeira = document.createElement("span");
    bandeira.className = "bandeira";
    bandeira.textContent = pais.bandeira;

    const nome = document.createElement("span");
    nome.textContent = pais.nome;

    cartao.append(bandeira, nome);

    cartao.addEventListener("dragstart", evento => {
        if (pais.concluido) {
            evento.preventDefault();
            return;
        }

        paisArrastado = pais.id;
        cartao.classList.add("arrastando");

        evento.dataTransfer.setData("text/plain", pais.id);
        evento.dataTransfer.effectAllowed = "move";
    });

    cartao.addEventListener("dragend", () => {
        cartao.classList.remove("arrastando");
        paisArrastado = null;

        continentes.forEach(continente => {
            continente.classList.remove("destino");
        });
    });

    return cartao;
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = "mensagem";

    if (tipo) {
        mensagem.classList.add(tipo);
    }
}

function atualizarPlacar() {
    pontuacaoElemento.textContent = pontuacao;
    progressoElemento.textContent = acertos + "/" + paises.length;
}

function verificarResposta(continenteAlvo) {
    if (!paisArrastado) {
        return;
    }

    const pais = paises.find(item => item.id === paisArrastado);

    if (!pais || pais.concluido) {
        return;
    }

    const nomeContinente = continenteAlvo.dataset.continent;

    if (pais.continente === nomeContinente) {
        pais.concluido = true;
        pontuacao += 10;
        acertos++;

        const cartao = document.querySelector(
            '.pais[data-id="' + pais.id + '"]'
        );

        cartao.classList.remove("arrastando");
        cartao.classList.add("correto");
        cartao.draggable = false;

        continenteAlvo.querySelector(".dropped-countries")
            .appendChild(cartao);

        continenteAlvo.classList.add("acertado");

        mostrarMensagem(
            "✅ Correto! " + pais.nome +
            " pertence à " + pais.continente + ". +10 pontos!",
            "sucesso"
        );

        paisArrastado = null;
        atualizarPlacar();

        if (acertos === paises.length) {
            resultado.hidden = false;

            pontuacaoFinal.textContent =
                "Sua pontuação foi " + pontuacao +
                " de " + (paises.length * 10) + " pontos!";

            mostrarMensagem(
                "🎉 Você classificou todos os países corretamente!",
                "sucesso"
            );
        }
    } else {
        pontuacao = Math.max(0, pontuacao - 2);

        mostrarMensagem(
            "❌ Não é esse continente. Tente novamente!",
            "erro"
        );

        atualizarPlacar();
    }
}

continentes.forEach(continente => {

    continente.addEventListener("dragover", evento => {
        evento.preventDefault();

        evento.dataTransfer.dropEffect = "move";
        continente.classList.add("destino");
    });

    continente.addEventListener("dragleave", evento => {
        if (!continente.contains(evento.relatedTarget)) {
            continente.classList.remove("destino");
        }
    });

    continente.addEventListener("drop", evento => {
        evento.preventDefault();

        continente.classList.remove("destino");

        const id = evento.dataTransfer.getData("text/plain");

        if (id) {
            paisArrastado = id;
        }

        verificarResposta(continente);
    });
});

document.getElementById("restartButton")
    .addEventListener("click", iniciarJogo);

document.getElementById("playAgainButton")
    .addEventListener("click", iniciarJogo);

iniciarJogo();