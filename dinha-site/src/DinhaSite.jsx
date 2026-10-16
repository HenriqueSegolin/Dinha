import { useState, useEffect, useRef } from "react";

/* ==========================================================================
   DINHA – RECEITAS AFETIVAS · landing page
   Direção criativa: "Caderno de receitas da vó"

   Implementação
   - Layout com utilitários do Tailwind. Tokens da marca e movimento ficam no
     bloco ESTILOS (fim do arquivo), porque o Tailwind sem compilador não aceita
     cores customizadas. Num projeto com Tailwind compilado, os tokens podem ir
     para o tailwind.config.
   - Movimento em CSS puro, sem dependências; respeita prefers-reduced-motion.
     Pode ser trocado por Framer Motion se o projeto já usar.
   - Todo o conteúdo vem das informações fornecidas pela Dinha. O que depende
     de material real está marcado com PENDENTE.
   - Os vídeos ficam em public/videos e só carregam quando aparecem na tela.
   ========================================================================== */

/* ---------- Dados reais ---------- */

const WHATSAPP_URL = "https://wa.me/5511976758386";
const CARDAPIO_URL = "https://bolodadinha.menudino.com";
const INSTAGRAM_URL = "https://www.instagram.com/bolodadinha";
const TELEFONE = "(11) 97675-8386";
const TELEFONE_LINK = "tel:+5511976758386";
const ENDERECO_COMPLETO =
  "Av. Dr. Martin Luther King, 2635 - Cidade São Francisco, Osasco - SP, 06030-016";
const ROTA_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(ENDERECO_COMPLETO);
const GOOGLE_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Dinha Receitas Afetivas, " + ENDERECO_COMPLETO);

// 0 = domingo … 6 = sábado. [abre, fecha] em horas; null = fechado.
const HORARIOS = { 0: null, 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 17] };
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const TABELA_HORARIOS = [
  { rotulo: "Terça a sexta", dias: [2, 3, 4, 5], horario: "9h às 18h" },
  { rotulo: "Sábado", dias: [6], horario: "9h às 17h" },
  { rotulo: "Domingo e segunda", dias: [0, 1], horario: "Fechado" },
];

const LINKS = [
  ["inicio", "Início"],
  ["sobre", "Sobre nós"],
  ["cardapio", "Cardápio"],
  ["encomendas", "Encomendas"],
  ["avaliacoes", "Avaliações"],
  ["contato", "Contato"],
];

const TIPOS_ENCOMENDA = [
  "Bolo tradicional",
  "Bolo especial / comemoração",
  "Bolo de Natal ou data especial",
  "Torta",
  "Outro",
];

const MENU = [
  {
    id: "tradicionais",
    aba: "Bolos tradicionais",
    titulo: "Bolos tradicionais",
    nota: "os clássicos de toda tarde",
    ilustracao: "fatia",
    itens: [
      { nome: "Bolo de laranja" },
      { nome: "Bolo de limão" },
      { nome: "Bolo de banana" },
      { nome: "Bolo de coco gelado" },
      { nome: "Bolo de limão siciliano", detalhe: "com cobertura" },
    ],
  },
  {
    id: "especiais",
    aba: "Especiais e datas",
    titulo: "Bolos especiais e comemorações",
    nota: "pra festejar junto",
    ilustracao: "confeitos",
    itens: [
      { nome: "Bolo de confeitos com Fini" },
      { nome: "Bolos de Natal", detalhe: "e de outras datas comemorativas" },
      { nome: "Bolos para festas", detalhe: "sabor e tamanho a combinar" },
    ],
    encomenda: "Bolo especial / comemoração",
  },
  {
    id: "comidinhas",
    aba: "Comidinhas",
    titulo: "Comidinhas e salgados",
    nota: "pro almoço rápido ou o lanche",
    ilustracao: "torta",
    itens: [
      { nome: "Torta de frango com salada", detalhe: "boa pedida pro almoço" },
      { nome: "Tortas recheadas" },
      { nome: "Porções generosas", detalhe: "de bolos e tortas, servidas no salão" },
    ],
  },
  {
    id: "cafes",
    aba: "Cafés e doces",
    titulo: "Cafés e sobremesas",
    nota: "coado na hora, servido na mesa",
    ilustracao: "xicara",
    itens: [{ nome: "Café coado na mesa" }, { nome: "Arroz doce caseiro" }],
  },
];

// Vídeos da Dinha (arquivos em public/videos)
const VIDEOS = [
  { id: "bolo", src: "/videos/bolo-com-cobertura.mp4", capa: "/videos/bolo-com-cobertura.jpg", legenda: "bolo caseiro com cobertura" },
  { id: "brownie", src: "/videos/brownie.mp4", capa: "/videos/brownie.jpg", legenda: "brownie" },
  { id: "copos", src: "/videos/copos-de-sobremesa.mp4", capa: "/videos/copos-de-sobremesa.jpg", legenda: "copos de sobremesa" },
];

const AVALIACOES = [
  "Lugar tranquilo, decoração maravilhosa, café coado na mesa, uma delícia!",
  "A torta de frango com a salada é excelente para um almoço rápido.",
  "Possui salão onde são servidas porções generosas de bolos e tortas.",
];

// Cores usadas dentro das ilustrações SVG (espelham os tokens do CSS)
const COR = {
  papel: "#FFF9EC",
  tinta: "#3B3423",
  oliva: "#7A8A62",
  olivaEscuro: "#4A5636",
  olivaClaro: "#DCE3C8",
  canela: "#8A5A34",
  grifo: "#F2C94C",
  massa: "#EBCB8B",
  massaEscura: "#DDAF68",
  cobertura: "#FBEFC8",
  cafe: "#6B4A33",
  chocolate: "#5A3A2A",
  recheio: "#C0643E",
  rosa: "#D98AA0",
  azul: "#6F94BF",
  crosta: "#D9A95B",
  crostaClara: "#E8BE72",
  frango: "#F3E3B5",
};

/* ---------- Horário em São Paulo ---------- */

function agoraEmSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const v = Object.fromEntries(partes.map((p) => [p.type, p.value]));
  const indice = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dia: indice[v.weekday], minutos: Number(v.hour) * 60 + Number(v.minute) };
}

function calcularStatus() {
  const { dia, minutos } = agoraEmSaoPaulo();
  const hoje = HORARIOS[dia];
  if (hoje && minutos >= hoje[0] * 60 && minutos < hoje[1] * 60) {
    return { dia, aberto: true, texto: `Aberto agora, até as ${hoje[1]}h` };
  }
  for (let i = 0; i < 7; i++) {
    const d = (dia + i) % 7;
    const h = HORARIOS[d];
    if (!h) continue;
    if (i === 0) {
      if (minutos < h[0] * 60) return { dia, aberto: false, texto: `Fechado agora. Abre hoje às ${h[0]}h` };
      continue;
    }
    const quando = i === 1 ? "amanhã" : `${d === 6 || d === 0 ? "no" : "na"} ${DIAS[d]}`;
    return { dia, aberto: false, texto: `Fechado agora. Abre ${quando} às ${h[0]}h` };
  }
  return { dia, aberto: false, texto: "Fechado agora" };
}

function hojeISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatarData(iso) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function prefereMenosMovimento() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- Hooks ---------- */

function useStatus() {
  const [status, setStatus] = useState(calcularStatus);
  useEffect(() => {
    const t = setInterval(() => setStatus(calcularStatus()), 60000);
    return () => clearInterval(t);
  }, []);
  return status;
}

function useSecaoAtiva(ids) {
  const [ativa, setAtiva] = useState(ids[0]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtiva(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return ativa;
}

/* ---------- Ícones (traço, herdam a cor do texto) ---------- */

function Icone({ children, className = "icone" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
const IconeConversa = () => (
  <Icone>
    <path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8a1.5 1.5 0 0 1-1.5 1.5h-9l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" />
  </Icone>
);
const IconeRota = () => (
  <Icone>
    <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </Icone>
);
const IconeTelefone = () => (
  <Icone>
    <path d="M6.5 3.5h3L11 8l-2 1.3a11 11 0 0 0 5.7 5.7L16 13l4.5 1.5v3a2 2 0 0 1-2 2C10.6 19.5 4.5 13.4 4.5 5.5a2 2 0 0 1 2-2z" />
  </Icone>
);
const IconeAlerta = () => (
  <Icone className="icone icone-p">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.8v5M12 16.2v.01" />
  </Icone>
);
const IconePausa = () => (
  <svg viewBox="0 0 24 24" className="icone" fill="currentColor" aria-hidden="true" focusable="false">
    <rect x="6.5" y="5.5" width="3.6" height="13" rx="1" />
    <rect x="13.9" y="5.5" width="3.6" height="13" rx="1" />
  </svg>
);
const IconePlay = () => (
  <svg viewBox="0 0 24 24" className="icone" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z" />
  </svg>
);
const NovaAba = () => <span className="sr-only"> (abre em nova aba)</span>;

/* ---------- Ilustrações (provisórias; PENDENTE trocar pelas da marca) ---------- */

function Xicara({ className = "", animada = false }) {
  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden="true" focusable="false">
      {animada && (
        <g className="vapor" fill="none" stroke={COR.tinta} strokeWidth="2.5" strokeLinecap="round" opacity=".5">
          <path d="M46 42c-7-7 7-11 0-19" />
          <path d="M60 40c-7-8 7-12 0-21" />
          <path d="M74 42c-7-7 7-11 0-19" />
        </g>
      )}
      <ellipse cx="60" cy="116" rx="46" ry="8" fill={COR.papel} stroke={COR.tinta} strokeWidth="3" />
      <path d="M90 66c16-2 18 22 0 22" fill="none" stroke={COR.tinta} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M28 56h64v18c0 19-14 34-32 34S28 93 28 74z" fill={COR.papel} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M31 72c9 4 19 4 29 0s20-4 29 0" fill="none" stroke={COR.oliva} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="56" rx="32" ry="5" fill={COR.cafe} stroke={COR.tinta} strokeWidth="3" />
      <path d="M60 95c-3-2-6-4-6-7a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 3-3 5-6 7z" fill={COR.recheio} />
    </svg>
  );
}

function FatiaBolo({ className = "" }) {
  return (
    <svg viewBox="0 28 150 92" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="75" cy="106" rx="64" ry="10" fill={COR.papel} stroke={COR.tinta} strokeWidth="3" />
      {/* lateral esquerda e direita da cunha */}
      <path d="M18 48 66 76v28L18 76z" fill={COR.massaEscura} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M66 76 132 42v28L66 104z" fill={COR.massa} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      {/* recheio */}
      <path d="M18 62 66 90 132 56" fill="none" stroke={COR.recheio} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* cobertura no topo e escorrendo pelas bordas */}
      <path d="M18 48 132 42 66 76z" fill={COR.cobertura} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M34 57.3c0 7 6 8 6 3.5M50 66.7c0 6 6 7 6 3.5M86 65.7c0 7 6 5 6-3.1M110 53.3c0 6 6 4 6-3.1" fill={COR.cobertura}
        stroke={COR.tinta} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function BoloConfeitos({ className = "" }) {
  const confeitos = [
    [48, 46, COR.recheio, 20], [62, 40, COR.oliva, -30], [78, 44, COR.grifo, 60], [92, 50, COR.rosa, 10],
    [70, 55, COR.azul, -50], [55, 56, COR.grifo, 35], [86, 38, COR.rosa, -15], [101, 44, COR.oliva, 45],
    [40, 52, COR.azul, 70], [34, 74, COR.recheio, 0], [56, 84, COR.grifo, 0], [84, 84, COR.oliva, 0],
    [106, 76, COR.rosa, 0],
  ];
  return (
    <svg viewBox="0 0 140 125" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="70" cy="110" rx="62" ry="9" fill={COR.papel} stroke={COR.tinta} strokeWidth="3" />
      <path d="M20 48v42c0 10 22 17 50 17s50-7 50-17V48" fill={COR.massa} stroke={COR.tinta} strokeWidth="3" />
      <ellipse cx="70" cy="48" rx="50" ry="15" fill={COR.chocolate} stroke={COR.tinta} strokeWidth="3" />
      {confeitos.map(([x, y, c, r], i) => (
        <rect key={i} x={x - 4.5} y={y - 2} width="9" height="4" rx="2" fill={c} transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}

function TortaFrango({ className = "" }) {
  return (
    <svg viewBox="0 0 150 120" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="78" cy="104" rx="66" ry="10" fill={COR.papel} stroke={COR.tinta} strokeWidth="3" />
      <path d="M112 88c6-14 22-12 24 0-8 6-18 6-24 0z" fill={COR.oliva} stroke={COR.tinta} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M116 96c10-10 24-4 22 6-8 3-16 1-22-6z" fill={COR.olivaClaro} stroke={COR.tinta} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 52 42 70v28L18 82z" fill={COR.crosta} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M42 70 120 50v28L42 98z" fill={COR.frango} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M43.5 90.5 118.5 71v6L43.5 96.5z" fill={COR.crosta} />
      <circle cx="62" cy="80" r="3" fill={COR.massaEscura} />
      <circle cx="84" cy="73" r="3.4" fill={COR.massaEscura} />
      <circle cx="104" cy="68" r="2.8" fill={COR.massaEscura} />
      <path d="M18 52 98 32l22 18-78 20z" fill={COR.crostaClara} stroke={COR.tinta} strokeWidth="3" strokeLinejoin="round" />
      <path d="M33 52 101 35M40 58l66-17M46 64l64-16" stroke={COR.canela} strokeWidth="2" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

function Raminho({ className = "" }) {
  const folhas = [[130, -1], [112, 1], [92, -1], [72, 1], [52, -1], [32, 1]];
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden="true" focusable="false">
      <path d="M58 156C57 110 62 60 76 8" fill="none" stroke={COR.olivaEscuro} strokeWidth="3" strokeLinecap="round" />
      {folhas.map(([y, lado], i) => {
        const x = 58 + ((156 - y) / 148) * 16;
        const cx = x + lado * 15;
        return (
          <ellipse key={i} cx={cx} cy={y} rx="16" ry="6.5" transform={`rotate(${lado * -32} ${cx} ${y})`}
            fill={COR.olivaClaro} stroke={COR.olivaEscuro} strokeWidth="2.5" />
        );
      })}
    </svg>
  );
}

function PataFormas() {
  return (
    <>
      <ellipse cx="20" cy="26" rx="8.5" ry="7.5" />
      <ellipse cx="9.5" cy="15.5" rx="3.4" ry="4.4" transform="rotate(-20 9.5 15.5)" />
      <ellipse cx="16" cy="9" rx="3.4" ry="4.6" />
      <ellipse cx="24" cy="9" rx="3.4" ry="4.6" />
      <ellipse cx="30.5" cy="15.5" rx="3.4" ry="4.4" transform="rotate(20 30.5 15.5)" />
    </>
  );
}

function Pegadas({ className = "" }) {
  const passos = [[24, 92, 70], [76, 66, 62], [128, 86, 74], [180, 56, 64], [232, 76, 76], [286, 44, 66]];
  return (
    <svg viewBox="0 0 320 120" className={className} aria-hidden="true" focusable="false" fill="currentColor">
      {passos.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(1.05) translate(-20 -20)`}>
          <PataFormas />
        </g>
      ))}
    </svg>
  );
}

function Estrelas({ valor, className = "" }) {
  const forma = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z";
  const cheias = Math.floor(valor);
  const parcial = Math.round((valor - cheias) * 100);
  return (
    <svg viewBox="0 0 130 24" className={`estrelas ${className}`} role="img"
      aria-label={`${String(valor).replace(".", ",")} de 5 estrelas`}>
      <defs>
        <linearGradient id="estrela-parcial">
          <stop offset={`${parcial}%`} stopColor={COR.grifo} />
          <stop offset={`${parcial}%`} stopColor={COR.grifo} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={forma} transform={`translate(${i * 26.5} 0)`}
          fill={i < cheias ? COR.grifo : i === cheias ? "url(#estrela-parcial)" : "none"}
          stroke={COR.tinta} strokeWidth="1.4" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

const ILUSTRACOES_MENU = { fatia: FatiaBolo, confeitos: BoloConfeitos, torta: TortaFrango, xicara: Xicara };

/* ---------- Peças de interface ---------- */

function Logo() {
  // PENDENTE: substituir pelo logotipo oficial da Dinha
  return (
    <span className="logo">
      <span className="logo-nome">Dinha</span>
      <span className="logo-sub mao">receitas afetivas</span>
    </span>
  );
}

function StatusAberto({ status, escuro = false, className = "" }) {
  return (
    <p className={`status ${status.aberto ? "is-aberto" : ""} ${escuro ? "status--escuro" : ""} ${className}`}>
      <span className="status-ponto" aria-hidden="true" />
      {status.texto}
    </p>
  );
}

// Vídeo curto em moldura de foto: toca sem som quando aparece na tela, pausa ao sair,
// tem botão de pausar/reproduzir e não toca sozinho para quem prefere menos movimento.
function VideoFoto({ src, capa, legenda, className = "" }) {
  const video = useRef(null);
  const pausadoPelaPessoa = useRef(prefereMenosMovimento());
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !pausadoPelaPessoa.current) v.play().catch(() => {});
        if (!entrada.isIntersecting) v.pause();
      },
      { threshold: 0.3 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  function alternar() {
    const v = video.current;
    if (v.paused) {
      pausadoPelaPessoa.current = false;
      v.play().catch(() => {});
    } else {
      pausadoPelaPessoa.current = true;
      v.pause();
    }
  }

  return (
    <figure className={`foto ${className}`}>
      <div className="foto-quadro">
        <video ref={video} src={src} poster={capa} muted loop playsInline preload="none" aria-hidden="true"
          onPlaying={() => setTocando(true)} onPause={() => setTocando(false)} />
        <button type="button" className="foto-botao" onClick={alternar}
          aria-label={`${tocando ? "Pausar" : "Reproduzir"} vídeo: ${legenda}`}>
          {tocando ? <IconePausa /> : <IconePlay />}
        </button>
      </div>
      <figcaption className="mao">{legenda}</figcaption>
    </figure>
  );
}

/* ---------- Seções ---------- */

function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const ativa = useSecaoAtiva(LINKS.map(([id]) => id));

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <header className={`topo ${rolou ? "topo--rolou" : ""}`}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        <a href="#inicio" className="logo-link" aria-label="Dinha – Receitas Afetivas, voltar ao início">
          <Logo />
        </a>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {LINKS.map(([id, rotulo]) => (
              <li key={id}>
                <a href={`#${id}`} className={`nav-link ${ativa === id ? "is-ativo" : ""}`}
                  aria-current={ativa === id ? "location" : undefined}>
                  {rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          {/* o span controla a visibilidade; a classe .btn define display e venceria o "hidden" */}
          <span className="hidden md:block">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primario">
              <IconeConversa /> Faça seu pedido<span className="sr-only"> pelo WhatsApp</span>
              <NovaAba />
            </a>
          </span>
          <button type="button" className="btn-menu lg:hidden" aria-expanded={aberto} aria-controls="menu-movel"
            onClick={() => setAberto((v) => !v)}>
            {aberto ? "Fechar" : "Menu"}
          </button>
        </div>
      </div>
      <nav id="menu-movel" aria-label="Principal (celular)" className="menu-movel lg:hidden" hidden={!aberto}>
        <ul>
          {LINKS.map(([id, rotulo]) => (
            <li key={id}>
              <a href={`#${id}`} className="mm-link" onClick={() => setAberto(false)}>{rotulo}</a>
            </li>
          ))}
        </ul>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primario btn-grande mt-6 w-full justify-center">
          <IconeConversa /> Faça seu pedido pelo WhatsApp
          <NovaAba />
        </a>
      </nav>
    </header>
  );
}

function Hero({ status }) {
  return (
    <section id="inicio" className="hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 md:pt-14 pb-24 md:pb-28">
        <div className="folha-wrap">
          <Raminho className="hero-raminho" />
          <article className="folha" aria-labelledby="titulo-hero">
            <span className="fita fita-esq" aria-hidden="true" />
            <span className="fita fita-dir" aria-hidden="true" />
            <p className="mao folha-sobrescrito">receita da casa</p>
            <hr className="regua-dupla" />
            <h1 id="titulo-hero" className="t-hero">O aconchego e o sabor da casa da vó em Osasco</h1>

            <div className="grid md:grid-cols-12 gap-10 md:gap-10 mt-10 md:mt-14">
              <div className="md:col-span-5">
                <h2 className="rotulo-receita">Ingredientes</h2>
                <ul className="ingredientes">
                  <li>Café coado na hora</li>
                  <li>Bolo caseiro fresquinho</li>
                  <li>Arroz doce e outras receitas afetivas</li>
                  <li>Um cantinho tranquilo, onde o pet também entra</li>
                </ul>
              </div>
              <div className="md:col-span-7">
                <h2 className="rotulo-receita">Modo de fazer</h2>
                <ol className="modo">
                  <li>
                    Venha de terça a sexta, das 9h às 18h, ou no sábado, das 9h às 17h.
                    <StatusAberto status={status} className="mt-3" />
                  </li>
                  <li>Peça um café coado na mesa e escolha o seu bolo.</li>
                  <li>Para levar pra casa ou pra festa, faça uma encomenda.</li>
                </ol>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="btn btn-primario btn-grande" href={CARDAPIO_URL} target="_blank" rel="noopener noreferrer">
                    Ver cardápio digital
                    <NovaAba />
                  </a>
                  <a className="btn btn-contorno btn-grande" href="#encomendas">Fazer encomenda</a>
                </div>
              </div>
            </div>
          </article>
          <FatiaBolo className="hero-fatia" />
          <Xicara className="hero-xicara" animada />
        </div>
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <section id="sobre" className="secao">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-12 gap-14 md:gap-10 items-center">
        <div className="md:col-span-5">
          <h2 className="t-secao">A casa da Dinha</h2>
          <div className="texto mt-6">
            <p>
              Na Dinha, a receita é caseira e o carinho vem junto. O bolo chega em fatia generosa, o café é
              coado ali na mesa e o salão é tranquilo, daqueles que convidam a ficar mais um pouco.
            </p>
            <p>
              É lugar de reunir a família, de almoçar rapidinho uma torta de frango com salada, de encomendar o
              bolo da festa e de trazer o pet junto.
            </p>
          </div>
          {/* PENDENTE: história real da Dinha (quem é, como começou). Não foi inventada aqui. */}
        </div>
        <div className="md:col-span-7">
          <div className="galeria">
            {VIDEOS.map((v, i) => (
              <VideoFoto key={v.id} src={v.src} capa={v.capa} legenda={v.legenda}
                className={["gal-grande", "gal-a", "gal-b"][i]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Cardapio({ onEncomendar }) {
  const [ativa, setAtiva] = useState(0);
  const abas = useRef([]);
  const categoria = MENU[ativa];
  const Ilustracao = ILUSTRACOES_MENU[categoria.ilustracao];

  function aoTeclar(e, i) {
    const mapa = { ArrowRight: (i + 1) % MENU.length, ArrowLeft: (i - 1 + MENU.length) % MENU.length, Home: 0, End: MENU.length - 1 };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    setAtiva(mapa[e.key]);
    abas.current[mapa[e.key]]?.focus();
  }

  return (
    <section id="cardapio" className="secao">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-8">
        <div className="md:flex md:items-end md:justify-between gap-8 px-1">
          <h2 className="t-secao">O que sai da nossa cozinha</h2>
          <p className="texto mt-4 md:mt-0 md:text-right" style={{ maxWidth: "30ch" }}>
            Preços e cardápio completo ficam no cardápio digital.
          </p>
        </div>

        <div className="caderno-wrap">
          <div role="tablist" aria-label="Categorias do cardápio" className="abas">
            {MENU.map((c, i) => (
              <button key={c.id} ref={(el) => (abas.current[i] = el)} type="button" role="tab" id={`aba-${c.id}`}
                aria-selected={i === ativa} aria-controls={`painel-${c.id}`} tabIndex={i === ativa ? 0 : -1}
                className={`aba aba-${i} ${i === ativa ? "is-ativa" : ""}`}
                onClick={() => setAtiva(i)} onKeyDown={(e) => aoTeclar(e, i)}>
                {c.aba}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`painel-${categoria.id}`} aria-labelledby={`aba-${categoria.id}`} tabIndex={0} className="caderno">
            <div key={categoria.id} className="pagina grid md:grid-cols-12 gap-x-6">
              <div className="md:col-span-8">
                <h3 className="pagina-titulo">{categoria.titulo}</h3>
                <p className="pagina-nota mao">{categoria.nota}</p>
                <ul className="itens">
                  {categoria.itens.map((item) => (
                    <li key={item.nome} className="item">
                      <span className="item-nome"><span className="grifo">{item.nome}</span></span>
                      {item.detalhe && <span className="item-detalhe mao">{item.detalhe}</span>}
                    </li>
                  ))}
                </ul>
                <div className="pagina-acoes">
                  <a className="btn btn-primario" href={CARDAPIO_URL} target="_blank" rel="noopener noreferrer">
                    Ver preços no cardápio digital
                    <NovaAba />
                  </a>
                  {categoria.encomenda && (
                    <button type="button" className="btn btn-contorno" onClick={() => onEncomendar(categoria.encomenda)}>
                      Encomendar um bolo especial
                    </button>
                  )}
                </div>
              </div>
              <div className="md:col-span-4 pagina-ilustra" aria-hidden="true">
                <Ilustracao className="pagina-desenho" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Diferenciais({ onEncomendar }) {
  return (
    <section className="secao secao-faixa" aria-labelledby="titulo-dif">
      <h2 id="titulo-dif" className="sr-only">Do nosso jeito</h2>
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="dif-linha">
          <div className="dif-texto">
            <h3 className="t-dif">Seu pet entra junto.</h3>
            <p>Somos pet friendly: seu pet é muito bem-vindo no nosso espaço.</p>
          </div>
          <Pegadas className="dif-ilustra dif-pegadas" />
        </div>
        <div className="dif-linha dif-linha--inversa">
          <div className="dif-texto">
            <h3 className="t-dif">O café é coado na sua mesa.</h3>
            <p>Quentinho, feito na hora, pra tomar sem pressa.</p>
          </div>
          <Xicara className="dif-ilustra dif-xicara" />
        </div>
        <div className="dif-linha">
          <div className="dif-texto">
            <h3 className="t-dif">O bolo da festa pode sair daqui.</h3>
            <p>Fazemos encomendas personalizadas de bolos para festas e datas especiais.</p>
            <button type="button" className="link-sublinhado mt-5" onClick={() => onEncomendar("Bolo especial / comemoração")}>
              Fazer uma encomenda
            </button>
          </div>
          <BoloConfeitos className="dif-ilustra dif-bolo" />
        </div>
      </div>
    </section>
  );
}

function Campo({ id, rotulo, opcional, erro, children }) {
  return (
    <div className="campo">
      <label htmlFor={id} className="campo-rotulo">
        {rotulo}
        {opcional && <span className="campo-opcional"> (opcional)</span>}
      </label>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="erro">
          <IconeAlerta /> {erro}
        </p>
      )}
    </div>
  );
}

function Encomendas({ tipo, setTipo }) {
  const [dados, setDados] = useState({ nome: "", data: "", detalhes: "" });
  const [erros, setErros] = useState({});
  const [linkPronto, setLinkPronto] = useState("");
  const confirmacao = useRef(null);
  const hoje = hojeISO();

  useEffect(() => {
    if (linkPronto) confirmacao.current?.focus();
  }, [linkPronto]);

  function mudar(campo, valor) {
    if (campo === "tipo") setTipo(valor);
    else setDados((d) => ({ ...d, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function validar() {
    const e = {};
    if (dados.nome.trim().length < 2) e.nome = "Escreva o seu nome.";
    if (!tipo) e.tipo = "Escolha o que você quer encomendar.";
    if (!dados.data) e.data = "Escolha a data em que você precisa da encomenda.";
    else if (dados.data < hoje) e.data = "Essa data já passou. Escolha hoje ou uma data futura.";
    return e;
  }

  function enviar() {
    const encontrados = validar();
    setErros(encontrados);
    const primeiro = ["nome", "tipo", "data"].find((c) => encontrados[c]);
    if (primeiro) {
      document.getElementById(`enc-${primeiro}`)?.focus();
      return;
    }
    const linhas = [
      "Olá, Dinha! Quero fazer uma encomenda.",
      "",
      `Nome: ${dados.nome.trim()}`,
      `Encomenda: ${tipo}`,
      `Para o dia: ${formatarData(dados.data)}`,
    ];
    if (dados.detalhes.trim()) linhas.push(`Detalhes: ${dados.detalhes.trim()}`);
    const url = `${WHATSAPP_URL}?text=${encodeURIComponent(linhas.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setLinkPronto(url);
  }

  function recomecar() {
    setDados({ nome: "", data: "", detalhes: "" });
    setTipo("");
    setErros({});
    setLinkPronto("");
    setTimeout(() => document.getElementById("enc-nome")?.focus(), 0);
  }

  // Sem <form>: o preview de artefatos bloqueia envio de formulário.
  // Em produção, pode virar <form onSubmit> e dispensar este atalho do Enter.
  function aoTeclar(e) {
    if (e.key === "Enter" && !["TEXTAREA", "BUTTON", "SELECT", "A"].includes(e.target.tagName)) {
      e.preventDefault();
      enviar();
    }
  }

  const descricao = (campo) => (erros[campo] ? `enc-${campo}-erro` : undefined);

  return (
    <section id="encomendas" className="secao">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-12 gap-12 md:gap-10 items-start">
        <div className="md:col-span-5 md:sticky md:top-28">
          <h2 className="t-secao">Encomende seu bolo</h2>
          <p className="texto mt-5">
            Para aniversário, Natal, um café da tarde especial ou qualquer data que mereça bolo. Conte o que você
            quer e a conversa continua no WhatsApp.
          </p>
          <ol className="passos mt-8">
            <li>Preencha o pedido.</li>
            <li>O WhatsApp abre com a sua mensagem pronta.</li>
            <li>Lá a gente combina sabor, tamanho, prazo e valor.</li>
          </ol>
        </div>

        <div className="md:col-span-7">
          <div className="pedido" role="form" aria-labelledby="titulo-pedido" onKeyDown={aoTeclar}>
            <div className="pedido-cabeca">
              <h3 id="titulo-pedido" className="pedido-titulo">Pedido de encomenda</h3>
              <span className="mao pedido-marca" aria-hidden="true">Dinha</span>
            </div>

            {linkPronto ? (
              <div className="pedido-ok" role="status" tabIndex={-1} ref={confirmacao}>
                <p className="pedido-ok-titulo">Sua mensagem está pronta no WhatsApp.</p>
                <p className="texto mt-3">
                  É só enviar por lá. Se o WhatsApp não abriu, use o botão abaixo.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a className="btn btn-primario" href={linkPronto} target="_blank" rel="noopener noreferrer">
                    <IconeConversa /> Abrir o WhatsApp
                    <NovaAba />
                  </a>
                  <button type="button" className="btn btn-contorno" onClick={recomecar}>
                    Fazer outra encomenda
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <Campo id="enc-nome" rotulo="Seu nome" erro={erros.nome}>
                    <input id="enc-nome" className="entrada" type="text" autoComplete="name" value={dados.nome}
                      onChange={(e) => mudar("nome", e.target.value)} aria-invalid={!!erros.nome}
                      aria-describedby={descricao("nome")} />
                  </Campo>
                  <Campo id="enc-data" rotulo="Para quando" erro={erros.data}>
                    <input id="enc-data" className="entrada" type="date" min={hoje} value={dados.data}
                      onChange={(e) => mudar("data", e.target.value)} aria-invalid={!!erros.data}
                      aria-describedby={descricao("data")} />
                  </Campo>
                </div>
                <Campo id="enc-tipo" rotulo="O que você quer encomendar" erro={erros.tipo}>
                  <select id="enc-tipo" className="entrada" value={tipo} onChange={(e) => mudar("tipo", e.target.value)}
                    aria-invalid={!!erros.tipo} aria-describedby={descricao("tipo")}>
                    <option value="">Escolha uma opção</option>
                    {TIPOS_ENCOMENDA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Campo>
                <Campo id="enc-detalhes" rotulo="Detalhes" opcional>
                  <textarea id="enc-detalhes" className="entrada" rows={3} value={dados.detalhes}
                    placeholder="Sabor, tamanho, quantas pessoas, alguma ideia de decoração…"
                    onChange={(e) => mudar("detalhes", e.target.value)} />
                </Campo>
                <button type="button" className="btn btn-primario btn-grande w-full sm:w-auto justify-center" onClick={enviar}>
                  <IconeConversa /> Enviar pelo WhatsApp
                </button>
                <p className="pedido-nota">Nada é cobrado aqui. A encomenda só fica confirmada depois da conversa no WhatsApp.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Avaliacoes() {
  return (
    <section id="avaliacoes" className="secao secao-faixa">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <h2 className="t-secao">Nota 4,8 no Google e no Facebook</h2>
            <Estrelas valor={4.8} className="mt-5" />
          </div>
          <a href={GOOGLE_URL} target="_blank" rel="noopener noreferrer" className="link-sublinhado">
            Ler as avaliações no Google
            <NovaAba />
          </a>
        </div>
        <ul className="bilhetes">
          {AVALIACOES.map((texto, i) => (
            <li key={i} className={`bilhete bilhete-${i + 1}`}>
              <blockquote><p>{texto}</p></blockquote>
            </li>
          ))}
        </ul>
        <p className="nota-fonte">Trechos de avaliações de clientes publicadas no Google e no Facebook.</p>
      </div>
    </section>
  );
}

function Contato({ status }) {
  return (
    <section id="contato" className="secao secao-escura">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-12 gap-12 md:gap-8 items-start">
        <div className="md:col-span-7">
          <h2 className="t-secao">Passa aqui pra um café</h2>
          <address className="endereco mt-6">
            Av. Dr. Martin Luther King, 2635<br />
            Cidade São Francisco, Osasco – SP<br />
            CEP 06030-016
          </address>
          <StatusAberto status={status} escuro className="mt-6" />
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-claro btn-grande" href={ROTA_URL} target="_blank" rel="noopener noreferrer">
              <IconeRota /> Traçar rota
              <NovaAba />
            </a>
            <a className="btn btn-grifo btn-grande" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <IconeConversa /> Chamar no WhatsApp
              <NovaAba />
            </a>
          </div>
          <p className="contato-extra mt-8">
            <a href={TELEFONE_LINK} className="link-claro"><IconeTelefone /> {TELEFONE}</a>
          </p>
          <p className="contato-extra">Preço médio por pessoa: R$ 20 a R$ 40</p>
        </div>

        <div className="md:col-span-5">
          <div className="horarios">
            <h3 className="horarios-titulo">Horário de funcionamento</h3>
            <dl>
              {TABELA_HORARIOS.map((linha) => {
                const hoje = linha.dias.includes(status.dia);
                return (
                  <div key={linha.rotulo} className={`hora-linha ${hoje ? "is-hoje" : ""}`}>
                    <dt>
                      <span className={hoje ? "grifo grifo-fixo" : ""}>{linha.rotulo}</span>
                      {hoje && <span className="mao hoje-marca"> hoje</span>}
                    </dt>
                    <dd>{linha.horario}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="horarios-nota">Em feriados, confirme o horário pelo WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="rodape">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <Logo />
          <p className="rodape-texto mt-3">Bolos caseiros, café coado na hora, arroz doce e mais.</p>
        </div>
        <ul className="rodape-links flex flex-wrap gap-x-6 gap-y-2">
          <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram @bolodadinha<NovaAba /></a></li>
          <li><a href={CARDAPIO_URL} target="_blank" rel="noopener noreferrer">Cardápio digital<NovaAba /></a></li>
          <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp<NovaAba /></a></li>
        </ul>
      </div>
      <div className="max-w-6xl mx-auto px-5 md:px-8 pb-8">
        <p className="rodape-copy">© {new Date().getFullYear()} Dinha – Receitas Afetivas</p>
      </div>
    </footer>
  );
}

/* ---------- Página ---------- */

export default function DinhaSite() {
  const status = useStatus();
  const [tipoEncomenda, setTipoEncomenda] = useState("");

  useEffect(() => {
    if (prefereMenosMovimento()) return;
    const raiz = document.documentElement;
    const anterior = raiz.style.scrollBehavior;
    raiz.style.scrollBehavior = "smooth";
    return () => { raiz.style.scrollBehavior = anterior; };
  }, []);

  function irParaEncomenda(tipo) {
    if (tipo) setTipoEncomenda(tipo);
    document.getElementById("encomendas")?.scrollIntoView({ behavior: prefereMenosMovimento() ? "auto" : "smooth" });
    setTimeout(() => document.getElementById("enc-nome")?.focus({ preventScroll: true }), 600);
  }

  return (
    <div className="dinha" lang="pt-BR">
      <style>{ESTILOS}</style>
      <a href="#conteudo" className="pular">Pular para o conteúdo</a>
      <Cabecalho />
      <main id="conteudo">
        <Hero status={status} />
        <Sobre />
        <Cardapio onEncomendar={irParaEncomenda} />
        <Diferenciais onEncomendar={irParaEncomenda} />
        <Encomendas tipo={tipoEncomenda} setTipo={setTipoEncomenda} />
        <Avaliacoes />
        <Contato status={status} />
      </main>
      <Rodape />
    </div>
  );
}

/* ==========================================================================
   ESTILOS · tokens da marca, tipografia, componentes e movimento
   ========================================================================== */

const ESTILOS = `
@import url('https://fonts.googleapis.com/css2?family=Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Kalam:wght@400;700&family=Young+Serif&display=swap');

.dinha{
  --creme:#F7ECD2; --creme-escuro:#F0E2C2; --papel:#FFF9EC;
  --tinta:#3B3423; --tinta-suave:#6A5F45;
  --oliva:#7A8A62; --oliva-escuro:#4A5636; --oliva-noite:#3D4730; --oliva-claro:#DCE3C8;
  --canela:#8A5A34; --grifo:#F2C94C; --grifo-claro:#F7DF8E;
  --linha:#E6D8BA; --linha-escura:#CDBB95;
  --sombra-papel:0 1px 0 rgba(59,52,35,.06), 0 22px 36px -24px rgba(59,52,35,.5);
  font-family:'Alegreya Sans','Trebuchet MS',system-ui,sans-serif;
  font-size:1.0625rem; line-height:1.6;
  color:var(--tinta); background:var(--creme);
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
}
.dinha *,.dinha *::before,.dinha *::after{box-sizing:border-box}
.dinha [id]{scroll-margin-top:84px}
.dinha :focus-visible{outline:3px solid var(--oliva-escuro); outline-offset:3px; border-radius:6px}
.dinha .sr-only{position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0}

/* Tipografia */
.mao{font-family:'Kalam','Segoe Print','Bradley Hand',cursive}
.t-hero,.t-secao,.t-dif,.logo-nome,.rotulo-receita,.pagina-titulo,.item-nome,.pedido-titulo,.horarios-titulo,.pedido-ok-titulo,.endereco,.mm-link{
  font-family:'Young Serif',Georgia,'Times New Roman',serif; font-weight:400;
}
.t-hero{font-size:clamp(2.45rem,6.4vw,5.75rem); line-height:1.02; letter-spacing:-.018em; max-width:13ch; text-wrap:balance}
.t-secao{font-size:clamp(2.05rem,4.4vw,3.4rem); line-height:1.06; letter-spacing:-.012em; text-wrap:balance}
.t-dif{font-size:clamp(2rem,5vw,3.75rem); line-height:1.03; letter-spacing:-.015em; text-wrap:balance}
.texto{font-size:1.15rem; color:var(--tinta-suave); max-width:56ch}
.texto p + p{margin-top:1rem}

/* Botões e links */
.btn{display:inline-flex; align-items:center; gap:.55rem; font-weight:700; font-size:1rem; line-height:1.1;
  padding:.8rem 1.2rem; border-radius:10px; border:2px solid transparent; text-decoration:none; cursor:pointer;
  transition:background-color .2s ease,color .2s ease,border-color .2s ease,transform .12s ease}
.btn:active{transform:scale(.97)}
.btn-grande{padding:1rem 1.45rem; font-size:1.05rem}
.btn-primario{background:var(--oliva-escuro); color:var(--papel)}
.btn-primario:hover{background:var(--oliva-noite)}
.btn-contorno{border-color:var(--tinta); color:var(--tinta); background:transparent}
.btn-contorno:hover{background:var(--tinta); color:var(--papel)}
.btn-claro{background:var(--papel); color:var(--tinta)}
.btn-claro:hover{background:var(--creme-escuro)}
.btn-grifo{background:var(--grifo); color:var(--tinta)}
.btn-grifo:hover{background:var(--grifo-claro)}
.icone{width:1.2em; height:1.2em; flex:none}
.icone-p{width:1.05em; height:1.05em}

.link-sublinhado{position:relative; display:inline-block; font:inherit; font-weight:700; font-size:1.08rem; color:var(--tinta);
  background:none; border:0; padding:.25rem 0 .55rem; cursor:pointer; text-decoration:none}
.link-sublinhado::after{content:""; position:absolute; left:0; right:0; bottom:0; height:9px;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='9' viewBox='0 0 22 9'%3E%3Cpath d='M0 4.5 Q5.5 .5 11 4.5 T22 4.5' fill='none' stroke='%238A5A34' stroke-width='2.2'/%3E%3C/svg%3E") repeat-x left center/22px 9px;
}
.link-sublinhado:hover::after{animation:ondular .9s linear infinite}
@keyframes ondular{to{background-position:22px center}}
.link-sublinhado:hover{color:var(--canela)}

/* Pular para o conteúdo */
.pular{position:absolute; left:-9999px; top:10px; z-index:100; background:var(--tinta); color:var(--papel); padding:.6rem 1rem; border-radius:8px; font-weight:700}
.pular:focus{left:12px}

/* Cabeçalho */
.topo{position:sticky; top:0; z-index:50; background:var(--creme); border-bottom:1px solid transparent; transition:border-color .25s ease,box-shadow .25s ease}
.topo--rolou{border-bottom-color:var(--linha); box-shadow:0 10px 24px -22px rgba(59,52,35,.6)}
.logo-link{text-decoration:none; color:inherit}
.logo{display:inline-flex; flex-direction:column; line-height:1}
.logo-nome{font-size:1.85rem; color:var(--oliva-escuro); letter-spacing:-.01em}
.logo-sub{font-size:.95rem; color:var(--canela); margin-top:.1rem; padding-left:.15rem}
.nav-link{position:relative; isolation:isolate; font-weight:500; font-size:1.02rem; color:var(--tinta-suave); text-decoration:none; padding:.25rem .1rem; transition:color .2s ease}
.nav-link::after{content:""; position:absolute; z-index:-1; left:-.3rem; right:-.3rem; bottom:.2rem; height:.55em; background:var(--grifo-claro);
  border-radius:3px; transform:scaleX(0); transform-origin:left; transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.nav-link:hover,.nav-link.is-ativo{color:var(--tinta)}
.nav-link:hover::after,.nav-link.is-ativo::after{transform:scaleX(1)}
.btn-menu{font:inherit; font-weight:700; color:var(--tinta); background:transparent; border:2px solid var(--tinta); border-radius:10px; padding:.5rem .95rem; cursor:pointer}
.menu-movel{border-top:1px solid var(--linha); background:var(--creme); padding:.75rem 1.25rem 1.5rem; box-shadow:0 18px 30px -24px rgba(59,52,35,.6)}
.menu-movel:not([hidden]){animation:descer .25s ease}
.mm-link{display:block; font-size:1.7rem; color:var(--tinta); text-decoration:none; padding:.55rem 0; border-bottom:1px solid var(--linha)}
@keyframes descer{from{opacity:0; transform:translateY(-6px)} to{opacity:1; transform:none}}

/* Status aberto/fechado */
.status{display:flex; width:max-content; max-width:100%; align-items:center; gap:.55rem; font-weight:700; font-size:.95rem; color:var(--tinta);
  padding:.4rem .85rem .4rem .7rem; border-radius:999px; background:var(--creme); border:1px solid var(--linha)}
.status-ponto{position:relative; width:.6rem; height:.6rem; border-radius:50%; background:var(--tinta-suave)}
.status.is-aberto .status-ponto{background:#4F7A3A}
.status.is-aberto .status-ponto::after{content:""; position:absolute; inset:0; border-radius:50%; background:inherit; animation:pulso 2.4s ease-out infinite}
.status--escuro{background:rgba(255,249,236,.1); border-color:rgba(255,249,236,.28); color:var(--papel)}
.status--escuro .status-ponto{background:rgba(255,249,236,.6)}
.status--escuro.is-aberto .status-ponto{background:#B8D49A}
@keyframes pulso{0%{transform:scale(1); opacity:.6} 100%{transform:scale(2.6); opacity:0}}

/* Hero: a folha de receita */
.folha-wrap{position:relative}
.folha{--giro:-.8deg; position:relative; z-index:1; background:var(--papel); border-radius:4px; box-shadow:var(--sombra-papel);
  padding:clamp(1.75rem,5vw,4rem) clamp(1.25rem,5vw,4.5rem) clamp(2.5rem,5vw,4rem);
  transform:rotate(var(--giro)); animation:assentar .9s cubic-bezier(.2,.8,.25,1) both}
.fita{position:absolute; top:-13px; width:96px; height:28px; background:rgba(242,201,76,.5); z-index:2}
.fita-esq{left:8%; transform:rotate(-4deg)}
.fita-dir{right:8%; transform:rotate(3deg)}
.folha-sobrescrito{font-size:1.2rem; color:var(--canela)}
.regua-dupla{border:0; height:5px; margin:.5rem 0 clamp(1.5rem,3.5vw,2.5rem); border-top:1.5px solid var(--oliva); border-bottom:1.5px solid var(--oliva); opacity:.7}
.rotulo-receita{font-size:1.3rem; color:var(--oliva-escuro); padding-bottom:.55rem; margin-bottom:1rem; border-bottom:1.5px dashed var(--linha-escura)}
.ingredientes{list-style:none; margin:0; padding:0}
.ingredientes li{position:relative; padding-left:1.7rem; margin:.55rem 0; font-size:1.13rem; line-height:1.5}
.ingredientes li::before{content:""; position:absolute; left:.35rem; top:.42em; width:.55rem; height:.9rem; background:var(--oliva);
  border-radius:0 100% 0 100%; transform:rotate(35deg)}
.modo{list-style:none; margin:0; padding:0; counter-reset:passo}
.modo li{position:relative; padding-left:2.4rem; margin:.7rem 0; font-size:1.13rem; line-height:1.5; counter-increment:passo}
.modo li::before{content:counter(passo); position:absolute; left:0; top:-.15rem; font-family:'Young Serif',Georgia,serif; font-size:1.45rem; color:var(--canela)}
.hero-xicara{--giro:0deg; position:absolute; z-index:3; width:clamp(108px,15vw,180px); right:clamp(4px,1vw,12px); bottom:-58px;
  animation:surgir .7s .55s cubic-bezier(.2,.8,.25,1) both}
.hero-fatia{--giro:4deg; position:absolute; z-index:3; display:none; width:clamp(150px,19vw,236px); right:clamp(12px,4vw,56px); top:-34px;
  animation:surgir .7s .4s cubic-bezier(.2,.8,.25,1) both}
.hero-raminho{position:absolute; z-index:0; display:none; width:110px; right:clamp(170px,22vw,280px); top:-62px; transform:rotate(-24deg)}
@media (min-width:768px){ .hero-fatia,.hero-raminho{display:block} }
@media (max-width:640px){ .folha{--giro:-.35deg} }
.vapor path{transform-box:fill-box; transform-origin:center; animation:vapor 3.6s ease-in-out infinite}
.vapor path:nth-child(2){animation-delay:1.2s}
.vapor path:nth-child(3){animation-delay:2.4s}
@keyframes assentar{from{opacity:0; transform:translateY(-18px) rotate(-3deg)} to{opacity:1; transform:rotate(var(--giro))}}
@keyframes surgir{from{opacity:0; transform:translateY(12px) rotate(var(--giro))} to{opacity:1; transform:rotate(var(--giro))}}
@keyframes vapor{0%{opacity:0; transform:translateY(8px)} 35%{opacity:1} 100%{opacity:0; transform:translateY(-10px)}}

/* Seções */
.secao{padding-block:clamp(4.5rem,9vw,7.5rem)}
.secao-faixa{background:var(--creme-escuro)}

/* Sobre: galeria de vídeos em molduras de foto */
.galeria{display:grid; grid-template-columns:1.35fr 1fr; gap:1.5rem 1.25rem; align-items:center}
.gal-grande{grid-row:span 2; transform:rotate(-1.6deg)}
.gal-a{transform:rotate(2deg) translateY(-.4rem)}
.gal-b{transform:rotate(-1.2deg) translateY(.6rem)}
.foto{margin:0; background:#FFFDF7; padding:.65rem .65rem 0; box-shadow:var(--sombra-papel)}
.foto-quadro{position:relative; overflow:hidden; aspect-ratio:4/3; background:#E7DDC6}
.gal-grande .foto-quadro{aspect-ratio:4/5}
.foto-quadro video{display:block; width:100%; height:100%; object-fit:cover}
.foto figcaption{font-size:1.1rem; line-height:1.3; color:var(--canela); text-align:center; padding:.6rem .25rem .75rem}
.foto-botao{position:absolute; right:.55rem; bottom:.55rem; width:2.35rem; height:2.35rem; display:grid; place-items:center;
  border:0; border-radius:50%; background:rgba(59,52,35,.6); color:var(--papel); cursor:pointer; opacity:.8;
  transition:opacity .2s ease,background-color .2s ease}
.foto-botao:hover,.foto-botao:focus-visible{opacity:1; background:rgba(59,52,35,.85)}
.foto-botao .icone{width:1rem; height:1rem}
@media (max-width:767px){
  .galeria{grid-template-columns:1fr 1fr; gap:1.25rem 1rem}
  .gal-grande{grid-column:1 / -1; grid-row:auto}
  .gal-grande .foto-quadro{aspect-ratio:4/3}
}

/* Cardápio: o caderno */
.caderno-wrap{margin-top:clamp(2.25rem,4vw,3rem)}
.abas{display:flex; gap:.35rem; overflow-x:auto; padding:0 .4rem; scrollbar-width:none; position:relative; z-index:2}
.abas::-webkit-scrollbar{display:none}
.aba{flex:0 0 auto; font:inherit; font-weight:700; font-size:.98rem; color:var(--tinta); cursor:pointer;
  padding:.75rem 1.1rem 1rem; border:1.5px solid var(--linha-escura); border-bottom:0; border-radius:12px 12px 0 0;
  transform:translateY(8px); transition:transform .2s ease,background-color .2s ease}
.aba:hover{transform:translateY(3px)}
.aba-0{background:var(--oliva-claro)} .aba-1{background:var(--grifo-claro)} .aba-2{background:#EFD5C4} .aba-3{background:#E6DCC8}
.aba.is-ativa{background:var(--papel); color:var(--oliva-escuro); transform:translateY(1.5px)}
.caderno{--lh:2.5rem; --margem:3.5rem; position:relative; z-index:1; min-height:calc(var(--lh) * 10.5);
  border:1.5px solid var(--linha-escura); border-radius:4px 14px 14px 14px; box-shadow:var(--sombra-papel);
  background-color:var(--papel);
  background-image:
    linear-gradient(90deg,transparent calc(var(--margem) - 1px),rgba(192,100,62,.45) calc(var(--margem) - 1px),rgba(192,100,62,.45) calc(var(--margem) + 1px),transparent calc(var(--margem) + 1px)),
    repeating-linear-gradient(180deg,transparent 0,transparent calc(var(--lh) - 1px),var(--linha) calc(var(--lh) - 1px),var(--linha) var(--lh));
  background-position:0 0,0 -.45rem;
  padding:var(--lh) clamp(1.25rem,4vw,3rem) calc(var(--lh) * 1.5) calc(var(--margem) + clamp(1rem,3vw,2.5rem))}
@media (max-width:640px){ .caderno{--margem:1.5rem} }
.pagina{animation:virar .45s cubic-bezier(.2,.7,.2,1)}
@keyframes virar{from{opacity:0; transform:translateX(12px)} to{opacity:1; transform:none}}
.pagina-titulo{font-size:clamp(1.55rem,3vw,2.1rem); line-height:var(--lh); color:var(--oliva-escuro)}
.pagina-nota{font-size:1.25rem; line-height:var(--lh); color:var(--canela)}
.itens{list-style:none; margin:var(--lh) 0 0; padding:0; display:grid; column-gap:2.5rem}
@media (min-width:768px){ .itens{grid-template-columns:1fr 1fr} }
.item-nome{display:block; font-size:clamp(1.2rem,2vw,1.4rem); line-height:var(--lh)}
.item-detalhe{display:block; font-size:1.12rem; line-height:var(--lh); color:var(--tinta-suave)}
.grifo{padding:0 .12em; background-image:linear-gradient(transparent 58%,var(--grifo) 58%,var(--grifo) 90%,transparent 90%);
  background-repeat:no-repeat; background-size:0% 100%; transition:background-size .5s cubic-bezier(.2,.7,.2,1);
  -webkit-box-decoration-break:clone; box-decoration-break:clone}
.item:hover .grifo,.grifo-fixo{background-size:100% 100%}
.pagina-acoes{display:flex; flex-wrap:wrap; gap:.75rem; margin-top:var(--lh)}
.pagina-ilustra{display:flex; align-items:center; justify-content:center; padding-top:var(--lh)}
.pagina-desenho{width:min(230px,62%); transform:rotate(-5deg)}
@media (min-width:768px){ .pagina-desenho{width:min(250px,92%)} }

/* Diferenciais */
.dif-linha{display:grid; gap:1.75rem; align-items:center; padding-block:clamp(2.5rem,5vw,3.75rem); border-top:1.5px dashed var(--linha-escura)}
.dif-linha:last-child{border-bottom:1.5px dashed var(--linha-escura)}
.dif-texto p{font-size:1.18rem; color:var(--tinta-suave); margin-top:.9rem; max-width:44ch}
.dif-ilustra{justify-self:center; width:min(210px,56%)}
.dif-pegadas{width:min(360px,88%); color:var(--oliva)}
@media (min-width:768px){
  .dif-linha{grid-template-columns:7fr 4fr; gap:3rem}
  .dif-linha--inversa{grid-template-columns:4fr 7fr}
  .dif-linha--inversa .dif-texto{order:2}
}

/* Encomendas */
.passos{list-style:none; margin-left:0; padding:0; counter-reset:passo}
.passos li{position:relative; padding-left:2.6rem; margin:.85rem 0; font-size:1.12rem; counter-increment:passo}
.passos li::before{content:counter(passo); position:absolute; left:0; top:-.2rem; font-family:'Kalam',cursive; font-weight:700; font-size:1.6rem; color:var(--canela)}
.pedido{position:relative; background:var(--papel); border-radius:4px 4px 14px 14px; box-shadow:var(--sombra-papel);
  padding:2.6rem clamp(1.25rem,4vw,2.5rem) 2rem}
.pedido::before{content:""; position:absolute; left:0; right:0; top:0; height:12px;
  background:radial-gradient(circle at 8px 0,var(--creme) 5.5px,transparent 6px) repeat-x; background-size:16px 12px}
.pedido-cabeca{display:flex; align-items:baseline; justify-content:space-between; gap:1rem; padding-bottom:1rem; margin-bottom:1.75rem; border-bottom:2px dashed var(--linha-escura)}
.pedido-titulo{font-size:1.45rem; color:var(--oliva-escuro)}
.pedido-marca{font-size:1.3rem; color:var(--canela)}
.campo{margin-bottom:1.5rem}
.campo-rotulo{display:block; font-weight:700; font-size:1rem; color:var(--tinta); margin-bottom:.3rem}
.campo-opcional{font-weight:400; color:var(--tinta-suave)}
.entrada{display:block; width:100%; font:inherit; font-size:1.08rem; color:var(--tinta); background-color:transparent;
  border:0; border-bottom:2px solid var(--linha-escura); border-radius:4px 4px 0 0; padding:.6rem .35rem; color-scheme:light;
  transition:border-color .2s ease,background-color .2s ease}
.entrada::placeholder{color:#9A8D70}
.entrada:focus{outline:none; border-bottom-color:var(--oliva-escuro); background-color:rgba(220,227,200,.45)}
.entrada:focus-visible{outline:none}
.entrada[aria-invalid="true"]{border-bottom-color:#A3402A}
select.entrada{appearance:none; -webkit-appearance:none; padding-right:2rem; cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233B3423' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right .35rem center; background-size:16px}
textarea.entrada{resize:vertical; min-height:5.5rem; line-height:1.5}
.erro{display:flex; align-items:center; gap:.4rem; margin-top:.45rem; font-size:.95rem; font-weight:500; color:#A3402A}
.pedido-nota{margin-top:1rem; font-size:.95rem; color:var(--tinta-suave)}
.pedido-ok{animation:descer .35s ease; outline:none}
.pedido-ok-titulo{font-size:clamp(1.5rem,3vw,2rem); line-height:1.15; color:var(--oliva-escuro)}

/* Avaliações */
.estrelas{display:block; width:150px; height:auto}
.bilhetes{list-style:none; padding:0; margin:clamp(2.5rem,5vw,3.5rem) 0 0; display:grid; gap:2.25rem; align-items:start}
@media (min-width:768px){ .bilhetes{grid-template-columns:repeat(3,1fr); gap:2rem} .bilhete-2{margin-top:2.25rem} .bilhete-3{margin-top:.75rem} }
.bilhete{position:relative; background:var(--papel); padding:1.9rem 1.5rem 1.6rem; box-shadow:var(--sombra-papel); transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.bilhete::before{content:""; position:absolute; top:-12px; left:50%; width:84px; height:24px; background:rgba(242,201,76,.5); transform:translateX(-50%) rotate(-3deg)}
.bilhete-1{transform:rotate(-1.8deg)}
.bilhete-2{transform:rotate(1.4deg); background:#FDF3D3}
.bilhete-3{transform:rotate(-.8deg); background:#EEF1E2}
.bilhete:hover{transform:translateY(-4px) rotate(0deg)}
.bilhete blockquote{margin:0}
.bilhete p{font-family:'Young Serif',Georgia,serif; font-size:clamp(1.12rem,1.7vw,1.3rem); line-height:1.42}
.nota-fonte{margin-top:2.25rem; font-size:.95rem; color:var(--tinta-suave)}

/* Contato */
.secao-escura{background:var(--oliva-escuro); color:var(--papel)}
.secao-escura :focus-visible{outline-color:var(--grifo)}
.endereco{font-style:normal; font-size:clamp(1.3rem,2.4vw,1.75rem); line-height:1.35}
.contato-extra{font-size:1.08rem; margin-top:.5rem; color:#E9E4CF}
.link-claro{display:inline-flex; align-items:center; gap:.5rem; color:var(--papel); font-weight:700; text-decoration:underline; text-underline-offset:4px; text-decoration-color:rgba(255,249,236,.45)}
.link-claro:hover{text-decoration-color:var(--grifo)}
.horarios{background:var(--papel); color:var(--tinta); border-radius:6px; padding:1.75rem clamp(1.25rem,3vw,2rem); box-shadow:0 26px 40px -26px rgba(0,0,0,.55)}
.horarios-titulo{font-size:1.35rem; color:var(--oliva-escuro); margin-bottom:.5rem}
.hora-linha{display:flex; justify-content:space-between; align-items:baseline; gap:1rem; padding:.85rem 0; border-bottom:1.5px dashed var(--linha-escura); font-size:1.1rem}
.hora-linha dt{font-weight:500}
.hora-linha dd{margin:0; font-weight:700; white-space:nowrap}
.hoje-marca{font-size:1.05rem; color:var(--canela); margin-left:.35rem}
.horarios-nota{margin-top:1rem; font-size:.95rem; color:var(--tinta-suave)}

/* Rodapé */
.rodape{background:var(--creme-escuro); border-top:1.5px dashed var(--linha-escura)}
.rodape-texto{color:var(--tinta-suave)}
.rodape-links a{color:var(--tinta); font-weight:700; text-decoration:underline; text-underline-offset:4px; text-decoration-color:var(--linha-escura)}
.rodape-links a:hover{text-decoration-color:var(--canela)}
.rodape-copy{font-size:.92rem; color:var(--tinta-suave)}

/* Movimento reduzido */
@media (prefers-reduced-motion: reduce){
  .dinha *,.dinha *::before,.dinha *::after{animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important}
  .vapor{display:none}
}
`;
