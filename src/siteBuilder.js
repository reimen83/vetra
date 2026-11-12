const esc = (v) => String(v ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const img = (id, w = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const THEMES = [
  {
    id: "barber-retro",
    name: "Navalha Retro",
    desc: "Preto, âmbar e serifa clássica de barbearia.",
    bg: "#100e0c",
    ink: "#f3e6c8",
    muted: "#c4b08a",
    brand: "#1a1612",
    accent: "#c8a24e",
    card: "#1c1814",
    font: "'Libre Baskerville', Georgia, serif",
    display: "'Cinzel', Georgia, serif",
    ctaInk: "#1a1208"
  },
  {
    id: "noir-ouro",
    name: "Noir & Ouro",
    desc: "Preto, dourado e composição cerimoniosa.",
    bg: "#0d0d0d",
    ink: "#f3ead6",
    muted: "#b7aa8e",
    brand: "#111111",
    accent: "#c9a227",
    card: "#1a1a1a",
    font: "Georgia, serif",
    display: "Georgia, serif",
    ctaInk: "#1a1408"
  },
  {
    id: "esmeralda",
    name: "Esmeralda",
    desc: "Sofisticado, verde profundo e serifa alta.",
    bg: "#f4efe6",
    ink: "#12241e",
    muted: "#5c6f67",
    brand: "#0f3d32",
    accent: "#1aa36e",
    card: "#ffffff",
    font: "Georgia, 'Times New Roman', serif",
    display: "Georgia, serif",
    ctaInk: "#ffffff"
  },
  {
    id: "clinica",
    name: "Clínica",
    desc: "Azul elétrico, limpo e confiável.",
    bg: "#f3f7fb",
    ink: "#10233a",
    muted: "#5b738c",
    brand: "#0b3d6e",
    accent: "#1f7ae0",
    card: "#ffffff",
    font: "'DM Sans', Inter, system-ui, sans-serif",
    display: "'Outfit', Inter, sans-serif",
    ctaInk: "#ffffff"
  },
  {
    id: "coral",
    name: "Coral",
    desc: "Quente, gastronômico e convivial.",
    bg: "#fff6ef",
    ink: "#3a2118",
    muted: "#8a6254",
    brand: "#7a2e1f",
    accent: "#e25b3a",
    card: "#fffdf9",
    font: "'Lora', Georgia, serif",
    display: "'Playfair Display', Georgia, serif",
    ctaInk: "#ffffff"
  },
  {
    id: "violeta",
    name: "Violeta",
    desc: "Beleza, spa e estética premium.",
    bg: "#f7f2f8",
    ink: "#2b1833",
    muted: "#7a6682",
    brand: "#4a2158",
    accent: "#a855c8",
    card: "#ffffff",
    font: "Georgia, serif",
    display: "'Playfair Display', Georgia, serif",
    ctaInk: "#ffffff"
  },
  {
    id: "concreto",
    name: "Concreto",
    desc: "Oficina, auto e serviços técnicos.",
    bg: "#eceae6",
    ink: "#1c1c1c",
    muted: "#6b6b6b",
    brand: "#222222",
    accent: "#e08a1e",
    card: "#ffffff",
    font: "Arial, Helvetica, sans-serif",
    display: "Arial Black, Arial, sans-serif",
    ctaInk: "#1c1c1c"
  },
  {
    id: "marfim",
    name: "Marfim",
    desc: "Clássico, sóbrio e editorial.",
    bg: "#faf7f0",
    ink: "#222018",
    muted: "#746f62",
    brand: "#2c2a24",
    accent: "#8a6a32",
    card: "#ffffff",
    font: "Georgia, serif",
    display: "Georgia, serif",
    ctaInk: "#ffffff"
  }
];

export const LAYOUTS = [
  { id: "classico", name: "Hero clássico", desc: "Foto cheia, overlay e cartão de vidro." },
  { id: "split", name: "Split", desc: "Texto à esquerda, dados e foto à direita." },
  { id: "conversao", name: "Conversão", desc: "Títulos enormes sobre imagem cinematográfica." },
  { id: "catalogo", name: "Catálogo", desc: "Serviços em cartões com foto do ofício." },
  { id: "editorial", name: "Editorial", desc: "Composição cerimoniosa sobre textura." }
];

export const SEGMENTS = [
  {
    id: "barbearia",
    label: "Barbearia",
    keywords: ["barbearia", "barber", "barba", "navalha", "hairdresser", "cabelo masculino", "corte masculino", "sr ", "mr "],
    themeId: "barber-retro",
    layoutId: "editorial",
    fonts: "Cinzel:wght@600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400",
    mood: "Retro, masculino e clássico — madeira, navalha e âmbar.",
    headline: "O corte certo. O ritual completo.",
    sub: "Máquina, tesoura e toalha quente. Um espaço feito para o homem que cuida da presença.",
    about: "Tradição de barbearia clássica com acabamento contemporâneo. Aqui o tempo desacelera: conversa, navalha e um visual que chega pronto na rua.",
    ctaLabel: "Agendar horário",
    contactTitle: "Sua cadeira está pronta",
    services: [
      { title: "Corte clássico", text: "Máquina e tesoura com acabamento na navalha." },
      { title: "Barba e toalha quente", text: "Ritual completo, pele hidratada e contorno preciso." },
      { title: "Combo presença", text: "Corte + barba no mesmo horário, sem fila." }
    ],
    hero: img("photo-1503951914875-452162b0f3ea"),
    gallery: [
      img("photo-1621607512214-68297480165e", 900),
      img("photo-1585747860715-2ba37e788b70", 900),
      img("photo-1593702295094-aea22597af65", 900)
    ]
  },
  {
    id: "salao",
    label: "Salão / Beleza",
    keywords: ["salao", "salão", "cabeleireir", "beleza", "hairdresser", "studio hair", "escova", "coloração", "coloracao", "manicure", "unhas", "estetica", "estética", "spa", "makeup"],
    themeId: "violeta",
    layoutId: "classico",
    fonts: "Playfair+Display:wght@600;700&family=Lora:wght@400;500",
    mood: "Delicado, iluminado e premium.",
    headline: "Beleza com presença",
    sub: "Técnica atualizada, produtos de linha e o tempo que você merece.",
    about: "Um espaço pensado para acolher. Da escova ao ritual completo, cada detalhe existe para você sair diferente — e reconhecida.",
    ctaLabel: "Agendar pelo WhatsApp",
    contactTitle: "Reserve seu horário",
    services: [
      { title: "Cabelo", text: "Corte, cor e finalização com diagnóstico prévio." },
      { title: "Estética", text: "Cuidados de pele e acabamento para o dia a dia." },
      { title: "Agenda sem fila", text: "Escolha o melhor horário pelo WhatsApp." }
    ],
    hero: img("photo-1560066984-138dadb4c035"),
    gallery: [
      img("photo-1522337360788-8b13dee7a37e", 900),
      img("photo-1487412947147-5cebf100ffc2", 900),
      img("photo-1519415943484-9fa1872a6c22", 900)
    ]
  },
  {
    id: "restaurante",
    label: "Restaurante",
    keywords: ["restaurante", "rest ", "pizzaria", "pizza", "trattoria", "steak", "churras", "bistro", "bistrô", "cantina"],
    themeId: "coral",
    layoutId: "classico",
    fonts: "Playfair+Display:ital,wght@0,600;0,700;1,600&family=Lora:wght@400;500",
    mood: "Acolhedor, gastronômico, luz baixa.",
    headline: "A mesa que faz voltar",
    sub: "Do almoço rápido ao jantar especial, com atendimento que reconhece o cliente.",
    about: "Cozinha de verdade, ingredientes escolhidos e um salão feito para ficar. Um restaurante de bairro com alma de casa cheia.",
    ctaLabel: "Reservar mesa",
    contactTitle: "Garanta sua mesa",
    services: [
      { title: "Salão", text: "Ambiente para família, amigos e ocasiões." },
      { title: "Cardápio", text: "Clássicos bem feitos e pratos da estação." },
      { title: "Retirada", text: "Peça pelo WhatsApp e retire no horário." }
    ],
    hero: img("photo-1517248135467-4c7edcad34c4"),
    gallery: [
      img("photo-1414235077428-338989a2e8c0", 900),
      img("photo-1559339352-11d035aa65de", 900),
      img("photo-1544025162-d76640381ada", 900)
    ]
  },
  {
    id: "lanchonete",
    label: "Lanchonete",
    keywords: ["lanchonete", "lanches", "hambur", "burger", "hot dog", "pastel", "fast food"],
    themeId: "coral",
    layoutId: "conversao",
    fonts: "Oswald:wght@500;600&family=DM+Sans:wght@400;500",
    mood: "Energia, apetite e cor.",
    headline: "Fome resolvida. Sabor de verdade.",
    sub: "Lanche no ponto, atendimento rápido e aquele molho que vicia.",
    about: "Receita honesta, pão quente e preparo na hora. O ponto de encontro do bairro quando a fome aperta.",
    ctaLabel: "Pedir no WhatsApp",
    contactTitle: "Faça seu pedido",
    services: [
      { title: "Combos", text: "Lanche, acompanhamento e bebida no ritmo certo." },
      { title: "Retirada", text: "Peça agora e passe no balcão." },
      { title: "Delivery", text: "Entrega rápida na região." }
    ],
    hero: img("photo-1550547660-d9450f859349"),
    gallery: [
      img("photo-1568901346375-23c9450c58cd", 900),
      img("photo-1553979459-d2229ba7433b", 900),
      img("photo-1571091718767-18b5b1457add", 900)
    ]
  },
  {
    id: "cafe",
    label: "Cafeteria",
    keywords: ["cafeteria", "cafe", "café", "coffee", "padaria cafe"],
    themeId: "marfim",
    layoutId: "split",
    fonts: "Playfair+Display:wght@600;700&family=Lora:ital,wght@0,400;1,400",
    mood: "Aconchego, grão e luz da manhã.",
    headline: "Pausa com aroma de verdade",
    sub: "Grãos selecionados, pão na chapa e um canto para respirar.",
    about: "Uma cafeteria de bairro com extração cuidadosa e mesa para conversa. Venha pelo café, fique pelo ritmo.",
    ctaLabel: "Falar no WhatsApp",
    contactTitle: "Encomendas e horários",
    services: [
      { title: "Espresso & métodos", text: "Do espresso ao filtrado, extraído na hora." },
      { title: "Mesa da manhã", text: "Pães, bolos e acompanhamento fresco." },
      { title: "Para levar", text: "Peça pelo WhatsApp e retire quente." }
    ],
    hero: img("photo-1495474472287-4d71bcdd2085"),
    gallery: [
      img("photo-1509042239860-f550ce710b93", 900),
      img("photo-1442512595331-e89e7384260c", 900),
      img("photo-1453614512568-7af50e0bc8c0", 900)
    ]
  },
  {
    id: "padaria",
    label: "Padaria",
    keywords: ["padaria", "confeitaria", "panificadora", "pao", "pão"],
    themeId: "coral",
    layoutId: "catalogo",
    fonts: "Playfair+Display:wght@600;700&family=Lora:wght@400;500",
    mood: "Trigo, manteiga e manhã cedo.",
    headline: "Pão quente. Dia começando certo.",
    sub: "Fornos acesos cedo, vitrine cheia e o cheiro que chama o bairro.",
    about: "Padaria de verdade: massa, tempo e gente que conhece o cliente pelo nome. Do pão francês ao bolo de festa.",
    ctaLabel: "Encomendar",
    contactTitle: "Encomendas do dia",
    services: [
      { title: "Pães do dia", text: "Fornos contínuos, crocância no ponto." },
      { title: "Confeitaria", text: "Bolos, doces e encomendas para ocasião." },
      { title: "Café da manhã", text: "Mesa pronta para começar o expediente." }
    ],
    hero: img("photo-1509440159596-0249088772ff"),
    gallery: [
      img("photo-1549931319-a545dcf3d7b9", 900),
      img("photo-1517433670267-08bbd4be890f", 900),
      img("photo-1555507036-ab1f4038808a", 900)
    ]
  },
  {
    id: "clinica",
    label: "Clínica / Saúde",
    keywords: ["clinica", "clínica", "saude", "saúde", "medico", "médico", "consultorio", "consultório", "fisio", "pilates", "psicolog", "terapia"],
    themeId: "clinica",
    layoutId: "split",
    fonts: "Outfit:wght@500;700&family=DM+Sans:wght@400;500",
    mood: "Clareza, confiança e luz natural.",
    headline: "Cuidado com clareza",
    sub: "Avaliação honesta, protocolos seguros e resposta rápida.",
    about: "Um espaço clínico pensado para acolher e explicar. Você entende o caminho antes de qualquer procedimento.",
    ctaLabel: "Agendar avaliação",
    contactTitle: "Marque sua avaliação",
    services: [
      { title: "Avaliação inicial", text: "Diagnóstico claro antes de qualquer conduta." },
      { title: "Acompanhamento", text: "Plano explicado passo a passo." },
      { title: "Agenda", text: "Horários disponíveis pelo WhatsApp." }
    ],
    hero: img("photo-1576091160399-112ba8d25d1d"),
    gallery: [
      img("photo-1519494026892-80bbd2d6fd0d", 900),
      img("photo-1581595220892-b7fdcf318b40", 900),
      img("photo-1666214280557-f1b5022eb634", 900)
    ]
  },
  {
    id: "dentista",
    label: "Odontologia",
    keywords: ["dentist", "odont", "sorriso", "oral", "implante", "orto"],
    themeId: "clinica",
    layoutId: "classico",
    fonts: "Outfit:wght@500;700&family=DM+Sans:wght@400;500",
    mood: "Clínico, luminoso, sorriso em evidência.",
    headline: "Sorriso com segurança",
    sub: "Tecnologia, explicação clara e um plano que cabe na sua rotina.",
    about: "Odontologia humana: a gente mostra o antes, o durante e o depois. Conforto na cadeira e resultado que aparece na foto.",
    ctaLabel: "Agendar consulta",
    contactTitle: "Sua avaliação odontológica",
    services: [
      { title: "Avaliação", text: "Exame completo e plano transparente." },
      { title: "Estética", text: "Clareamento, lentes e harmonia do sorriso." },
      { title: "Saúde bucal", text: "Prevenção e tratamentos com acompanhamento." }
    ],
    hero: img("photo-1606811841689-23dfddce3e95"),
    gallery: [
      img("photo-1598256989800-fe5f95da9787", 900),
      img("photo-1629909613654-28e377c37b09", 900),
      img("photo-1588776814546-1ffcf47267a5", 900)
    ]
  },
  {
    id: "oficina",
    label: "Oficina / Auto",
    keywords: ["oficina", "mecanic", "auto center", "autocenter", "funilaria", "autopec", "autopeç", "eletrica auto", "elétrica auto"],
    themeId: "concreto",
    layoutId: "conversao",
    fonts: "Oswald:wght@500;600&family=DM+Sans:wght@400;500",
    mood: "Técnico, direto, sem enrolação.",
    headline: "Diagnóstico honesto. Serviço no prazo.",
    sub: "Peças certas, mão de obra especializada e orçamento na hora.",
    about: "Oficina de confiança: a gente abre o capô, explica o que precisa e só troca o que faz diferença. Seu carro sai pronto para circular.",
    ctaLabel: "Pedir orçamento",
    contactTitle: "Envie o modelo do veículo",
    services: [
      { title: "Diagnóstico", text: "Avaliação técnica antes de qualquer serviço." },
      { title: "Manutenção", text: "Preventiva e corretiva com garantia." },
      { title: "Orçamento", text: "Resposta rápida pelo WhatsApp." }
    ],
    hero: img("photo-1487754180451-c456f719a1fc"),
    gallery: [
      img("photo-1492144534655-ae79c964c9d7", 900),
      img("photo-1486262715619-67b85e0b08d3", 900),
      img("photo-1619642751034-76589c702cdc", 900)
    ]
  },
  {
    id: "lavacar",
    label: "Lava-car",
    keywords: ["lava", "estetica automotiva", "estética automotiva", "detailing", "higienizacao", "higienização"],
    themeId: "concreto",
    layoutId: "catalogo",
    fonts: "Oswald:wght@500;600&family=DM+Sans:wght@400;500",
    mood: "Brilho, precisão e cuidado com o carro.",
    headline: "Seu carro no padrão showroom",
    sub: "Lavagem técnica, proteção e aquele brilho que dura a semana.",
    about: "Estética automotiva com processo, não com mangueira. Cada etapa existe para proteger pintura, interior e a sua impressão na rua.",
    ctaLabel: "Agendar lavagem",
    contactTitle: "Marque o horário",
    services: [
      { title: "Lavagem técnica", text: "Externa e interna com produtos profissionais." },
      { title: "Proteção", text: "Cera, vitrificação e hidratação de plásticos." },
      { title: "Planos mensais", text: "Seu carro sempre apresentável." }
    ],
    hero: img("photo-1601362840469-51e4d8d58785"),
    gallery: [
      img("photo-1520340356584-c2ba73266660", 900),
      img("photo-1607860108855-64acf2078ed9", 900),
      img("photo-1552519507-da3b142c6e3d", 900)
    ]
  },
  {
    id: "imobiliaria",
    label: "Imobiliária",
    keywords: ["imobili", "imoveis", "imóveis", "corretor"],
    themeId: "marfim",
    layoutId: "editorial",
    fonts: "Playfair+Display:wght@600;700&family=Lora:wght@400;500",
    mood: "Arquitetura, luz e confiança.",
    headline: "Negócio imobiliário sem neblina",
    sub: "Curadoria de imóveis e condução do primeiro contato à chave.",
    about: "A gente seleciona, explica o bairro e acompanha cada etapa. Compra, venda ou locação com o mesmo cuidado de quem vai morar.",
    ctaLabel: "Falar com o corretor",
    contactTitle: "Conte o que você busca",
    services: [
      { title: "Compra e venda", text: "Acompanhamento completo da transação." },
      { title: "Locação", text: "Análise, contrato e vistoria sem dor de cabeça." },
      { title: "Avaliação", text: "Precificação baseada na região." }
    ],
    hero: img("photo-1560518883-ce09059eeffa"),
    gallery: [
      img("photo-1505691938895-1758d7ceb44f", 900),
      img("photo-1600596542815-ffad4c1539a9", 900),
      img("photo-1600585154340-be6161a56a0c", 900)
    ]
  },
  {
    id: "pet",
    label: "Pet / Vet",
    keywords: ["pet", "vet", "veterinar", "banho e tosa", "clinicavet", "animal"],
    themeId: "esmeralda",
    layoutId: "classico",
    fonts: "Outfit:wght@500;700&family=DM+Sans:wght@400;500",
    mood: "Acolhedor, vivo, cuidado com o pet.",
    headline: "Cuidado do tamanho do carinho",
    sub: "Saúde, banho e tosa com equipe que trata seu animal pelo nome.",
    about: "Um espaço pensado para o pet e para quem ama. Protocolos claros, ambiente calmo e retorno rápido quando surge a dúvida.",
    ctaLabel: "Agendar atendimento",
    contactTitle: "Fale sobre o seu pet",
    services: [
      { title: "Consulta", text: "Avaliação veterinária com tempo de escuta." },
      { title: "Banho e tosa", text: "Higiene e acabamento sem estresse." },
      { title: "Acompanhamento", text: "Vacinas, retornos e orientação." }
    ],
    hero: img("photo-1548199973-03cce0bbc87b"),
    gallery: [
      img("photo-1587300003388-59208cc962cb", 900),
      img("photo-1516734212186-a967f81ad0d7", 900),
      img("photo-1450778869180-41d0601e046e", 900)
    ]
  },
  {
    id: "academia",
    label: "Academia",
    keywords: ["academia", "gym", "fitness", "crossfit", "personal", "treino"],
    themeId: "concreto",
    layoutId: "conversao",
    fonts: "Oswald:wght@500;700&family=DM+Sans:wght@400;500",
    mood: "Força, contraste e movimento.",
    headline: "Treino que aparece no corpo",
    sub: "Equipamento, acompanhamento e uma comunidade que puxa você para cima.",
    about: "Academia de verdade: treino guiado, ambiente intenso e resultado medido. Do primeiro dia ao próximo recorde pessoal.",
    ctaLabel: "Quero treinar",
    contactTitle: "Comece esta semana",
    services: [
      { title: "Musculação", text: "Área completa e orientação no aparelho." },
      { title: "Aulas", text: "Coletivas para quem quer ritmo e queima." },
      { title: "Plano", text: "Mensalidade clara, sem letra miúda." }
    ],
    hero: img("photo-1534438327276-14e5300c3a48"),
    gallery: [
      img("photo-1517836357463-d25dfeac3438", 900),
      img("photo-1571902943202-507ec2618e8f", 900),
      img("photo-1540497077202-7c8a3999166f", 900)
    ]
  },
  {
    id: "farmacia",
    label: "Farmácia",
    keywords: ["farmacia", "farmácia", "drogaria", "manipulacao", "manipulação"],
    themeId: "clinica",
    layoutId: "split",
    fonts: "Outfit:wght@500;700&family=DM+Sans:wght@400;500",
    mood: "Acesso, clareza e cuidado cotidiano.",
    headline: "Cuidado perto de casa",
    sub: "Medicamentos, orientação e aquele atendimento que conhece a receita.",
    about: "Farmácia de bairro com estoque em dia e gente que explica o que está escrito no receituário. Perto, rápido e confiável.",
    ctaLabel: "Chamar no WhatsApp",
    contactTitle: "Tire sua dúvida",
    services: [
      { title: "Farmácia", text: "Genéricos, similares e orientação." },
      { title: "Conveniência", text: "Higiene, infantil e o essencial do dia." },
      { title: "Entrega", text: "Peça pelo WhatsApp na região." }
    ],
    hero: img("photo-1587854692152-cbe660dbde88"),
    gallery: [
      img("photo-1576602976047-174e57a64528", 900),
      img("photo-1584308666744-24d5c474f2ae", 900),
      img("photo-1471864190281-a93a3070b6de", 900)
    ]
  },
  {
    id: "hotel",
    label: "Hospedagem",
    keywords: ["hotel", "pousada", "hostel", "pousadas", "inn"],
    themeId: "marfim",
    layoutId: "editorial",
    fonts: "Playfair+Display:wght@600;700&family=Lora:ital,wght@0,400;1,400",
    mood: "Acolhimento, linho e destino.",
    headline: "Chegar e sentir que é lugar",
    sub: "Quartos pensados para descanso real e um café da manhã que segura o dia.",
    about: "Hospedagem com presença: cama boa, silêncio na hora certa e gente que trata hóspede pelo nome.",
    ctaLabel: "Consultar disponibilidade",
    contactTitle: "Reserve sua estadia",
    services: [
      { title: "Quartos", text: "Conforto, limpeza e detalhes que importam." },
      { title: "Café da manhã", text: "Comece o dia sem pressa." },
      { title: "Localização", text: "Base certa para o que você veio fazer." }
    ],
    hero: img("photo-1566073771259-6a8506099945"),
    gallery: [
      img("photo-1618773928121-c32242e63f39", 900),
      img("photo-1582719478250-c89cae4dc85b", 900),
      img("photo-1445019980597-93fa8acb246c", 900)
    ]
  },
  {
    id: "advocacia",
    label: "Advocacia",
    keywords: ["advog", "advocacia", "juridic", "jurídic", "direito"],
    themeId: "noir-ouro",
    layoutId: "editorial",
    fonts: "Cinzel:wght@600;700&family=Libre+Baskerville:wght@400;700",
    mood: "Sóbrio, confiável, institucional.",
    headline: "Direito com linguagem clara",
    sub: "Estratégia jurídica sem juridiquês. Você entende o risco e o caminho.",
    about: "Atuação técnica com conversa humana. Analisamos o caso, explicamos o cenário e conduzimos com método.",
    ctaLabel: "Falar com o escritório",
    contactTitle: "Agende uma conversa",
    services: [
      { title: "Consultoria", text: "Leitura honesta do seu caso." },
      { title: "Contencioso", text: "Condução processual com acompanhamento." },
      { title: "Preventivo", text: "Contratos e orientação antes do problema." }
    ],
    hero: img("photo-1589829545858-0d3369183d2d"),
    gallery: [
      img("photo-1521587760476-6c12a4b040da", 900),
      img("photo-1450101499163-c8848c66ca85", 900),
      img("photo-1436450412740-6b988f486c6b", 900)
    ]
  },
  {
    id: "comercio",
    label: "Comércio",
    keywords: ["loja", "comercio", "comércio", "magazine", "boutique", "otica", "ótica", "joalher", "mercado", "hortifruti"],
    themeId: "esmeralda",
    layoutId: "catalogo",
    fonts: "Outfit:wght@500;700&family=DM+Sans:wght@400;500",
    mood: "Vitrine, convívio e oferta clara.",
    headline: "O que você precisa, perto de você",
    sub: "Mix escolhido, preço justo e atendimento de quem conhece o bairro.",
    about: "Comércio de verdade: estoque que gira, gente no balcão e a facilidade de resolver no mesmo dia.",
    ctaLabel: "Chamar no WhatsApp",
    contactTitle: "Consulte disponibilidade",
    services: [
      { title: "Vitrine", text: "Produtos selecionados para o dia a dia." },
      { title: "Atendimento", text: "Orientação sem pressa no balcão." },
      { title: "Encomenda", text: "Peça pelo WhatsApp e retire." }
    ],
    hero: img("photo-1441986300917-64674bd600d8"),
    gallery: [
      img("photo-1483985988355-763728e1935b", 900),
      img("photo-1472851294608-062f824d70f5", 900),
      img("photo-1555529902-5261145633bf", 900)
    ]
  }
];

const GENERIC = {
  id: "servicos",
  label: "Serviços",
  themeId: "esmeralda",
  layoutId: "classico",
  fonts: "Playfair+Display:wght@600;700&family=Lora:wght@400;500",
  mood: "Sofisticado e versátil.",
  headline: "Presença à altura do seu negócio",
  sub: "Atendimento próximo, serviço bem feito e resposta rápida.",
  about: "Um espaço digital feito para converter: claro, bonito e com o caminho mais curto até o WhatsApp.",
  ctaLabel: "Chamar no WhatsApp",
  contactTitle: "Vamos conversar?",
  services: [
    { title: "Atendimento", text: "Fale direto com quem resolve." },
    { title: "Qualidade", text: "Padrão consistente em cada entrega." },
    { title: "Agilidade", text: "Orçamento e retorno pelo WhatsApp." }
  ],
  hero: img("photo-1497366216548-37526070297c"),
  gallery: [
    img("photo-1521737604893-d14cc237f11d", 900),
    img("photo-1556761175-4b46a572b786", 900),
    img("photo-1522071820081-009f0129c71c", 900)
  ]
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function detectSegment(place = {}) {
  const blob = normalize(`${place.name || ""} ${place.category || ""} ${place.address || ""}`);
  let best = null;
  let bestScore = 0;
  for (const seg of SEGMENTS) {
    let score = 0;
    for (const key of seg.keywords) {
      const k = normalize(key);
      if (!k) continue;
      if (blob.includes(k)) score += k.length >= 6 ? 4 : 3;
    }
    if (score > bestScore) {
      best = seg;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : GENERIC;
}

export function getSegment(id) {
  return SEGMENTS.find((s) => s.id === id) || GENERIC;
}

export function applySegmentPreset(place = {}, segmentId) {
  const seg = segmentId ? getSegment(segmentId) : detectSegment(place);
  return {
    segmentId: seg.id,
    segmentLabel: seg.label,
    mood: seg.mood,
    themeId: seg.themeId,
    layoutId: seg.layoutId,
    fonts: seg.fonts,
    headline: seg.headline,
    subheadline: seg.sub,
    about: seg.about,
    services: seg.services.map((s) => ({ ...s })),
    ctaLabel: seg.ctaLabel,
    contactTitle: seg.contactTitle,
    heroImage: seg.hero,
    gallery: [...seg.gallery],
    footerNote: `© ${new Date().getFullYear()} ${place.name || "Empresa"}. Todos os direitos reservados.`
  };
}

export function defaultConfig(place = {}) {
  return applySegmentPreset(place);
}

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === "esmeralda");
}

export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

function waLink(phone, name) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length < 8) return "";
  const intl = d.length <= 11 ? `55${d}` : d;
  const text = encodeURIComponent(`Olá${name ? `, ${name}` : ""}! Vim pelo site e quero conversar.`);
  return `https://wa.me/${intl}?text=${text}`;
}

function servicesHtml(services, gallery) {
  return `<div class="grid3">${(services || []).map((s, i) => `
    <article class="card photo-card" style="--card-photo:url('${gallery[i % gallery.length]}')">
      <div class="photo-card-body">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </div>
    </article>`).join("")}</div>`;
}

function galleryHtml(gallery) {
  if (!gallery?.length) return "";
  return `<section class="section gallery-wrap">
    <p class="kicker">Atmosfera</p>
    <div class="gallery">${gallery.map((src) => `<figure style="background-image:url('${src}')"></figure>`).join("")}</div>
  </section>`;
}

function infoBlock(place) {
  const ig = place.instagram
    ? `<p><span>Instagram</span><a href="${esc(place.instagram)}" target="_blank" rel="noreferrer">${esc(String(place.instagram).replace(/^https?:\/\/(www\.)?instagram\.com\//, "@"))}</a></p>`
    : "";
  const maps = place.google_maps_url
    ? `<p><span>Mapa</span><a href="${esc(place.google_maps_url)}" target="_blank" rel="noreferrer">Ver localização</a></p>`
    : "";
  return `<aside class="info">
    ${place.phone ? `<p><span>Telefone</span><a href="tel:${esc(place.phone)}">${esc(place.phone)}</a></p>` : ""}
    ${place.address ? `<p><span>Endereço</span>${esc(place.address)}</p>` : ""}
    ${ig}${maps}
  </aside>`;
}

function heroByLayout(layoutId, place, cfg, wa) {
  const cta = wa ? `<a class="cta" href="${esc(wa)}">${esc(cfg.ctaLabel)}</a>` : "";
  const kicker = esc(cfg.segmentLabel || place.category || "Negócio local");
  const name = esc(place.name || "Empresa");
  const head = esc(cfg.headline);
  const sub = esc(cfg.subheadline);
  const addr = esc(place.address || "");
  const photo = `style="--hero:url('${cfg.heroImage}')"`;

  if (layoutId === "split") {
    return `<section class="hero split has-photo" ${photo}>
      <div class="wrap split-grid">
        <div class="hero-copy">
          <p class="kicker">${kicker}</p>
          <h1>${name}</h1>
          <h2>${head}</h2>
          <p class="lead">${sub}</p>
          ${cta}
        </div>
        ${infoBlock(place)}
      </div>
    </section>`;
  }
  if (layoutId === "conversao") {
    return `<section class="hero convert has-photo" ${photo}>
      <div class="wrap hero-copy">
        <p class="kicker">${kicker}</p>
        <h1>${head}</h1>
        <p class="lead huge">${name} · ${sub}</p>
        ${cta}
        <p class="tiny">${addr}</p>
      </div>
    </section>`;
  }
  if (layoutId === "editorial") {
    return `<section class="hero editorial has-photo" ${photo}>
      <div class="wrap hero-copy center">
        <p class="kicker">${kicker}</p>
        <h1>${name}</h1>
        <p class="ornament">—</p>
        <h2>${head}</h2>
        <p class="lead">${sub}</p>
        ${cta}
      </div>
    </section>`;
  }
  if (layoutId === "catalogo") {
    return `<section class="hero catalog has-photo" ${photo}>
      <div class="glass">
        <p class="kicker">${kicker}</p>
        <h1>${name}</h1>
        <p class="lead">${sub}</p>
        ${cta}
      </div>
    </section>`;
  }
  return `<section class="hero classic has-photo" ${photo}>
    <div class="glass">
      <p class="kicker">${kicker}</p>
      <h1>${name}</h1>
      <h2>${head}</h2>
      <p class="lead">${sub}</p>
      ${cta}
    </div>
  </section>`;
}

export function buildSiteHtml(place = {}, config = {}) {
  const base = defaultConfig(place);
  const cfg = {
    ...base,
    ...config,
    services: config.services?.length ? config.services : base.services,
    gallery: config.gallery?.length ? config.gallery : base.gallery,
    heroImage: config.heroImage || base.heroImage
  };
  const t = getTheme(cfg.themeId);
  const layoutId = cfg.layoutId || "classico";
  const wa = waLink(place.phone, place.name);
  const year = new Date().getFullYear();
  const fonts = cfg.fonts || "Playfair+Display:wght@600;700&family=Lora:wght@400;500";
  const gallery = cfg.gallery || [];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(place.name || "Site")} | ${esc(cfg.segmentLabel || place.category || "Presença digital")}</title>
<meta name="description" content="${esc(cfg.subheadline)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=${fonts}&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: ${t.bg}; --ink: ${t.ink}; --muted: ${t.muted}; --brand: ${t.brand};
    --accent: ${t.accent}; --card: ${t.card}; --font: ${t.font}; --display: ${t.display};
    --cta-ink: ${t.ctaInk || "#fff"};
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font); }
  a { color: inherit; }
  img { max-width: 100%; }
  .wrap { width: min(1100px, calc(100% - 40px)); margin: 0 auto; }
  .kicker { letter-spacing: .28em; text-transform: uppercase; font-size: 11px; color: var(--accent); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); line-height: 1.08; margin: 0 0 12px; }
  h1 { font-size: clamp(36px, 6vw, 72px); }
  h2 { font-size: clamp(22px, 3vw, 34px); font-weight: 600; }
  .lead { color: var(--muted); font-size: 18px; max-width: 640px; }
  .cta {
    display: inline-block; margin-top: 22px; background: var(--accent); color: var(--cta-ink);
    text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 700; letter-spacing: .02em;
  }
  .has-photo {
    position: relative; background-image: linear-gradient(180deg, rgba(8,6,4,.55), rgba(8,6,4,.72)), var(--hero);
    background-size: cover; background-position: center; color: #f7f1e4;
  }
  .has-photo .kicker { color: var(--accent); }
  .has-photo .lead, .has-photo .tiny { color: rgba(247,241,228,.86); }
  .hero { padding: 72px 0 48px; }
  .hero.classic, .hero.catalog {
    min-height: 86vh; display: grid; place-items: center; padding: 80px 20px;
  }
  .glass {
    width: min(780px, 100%); background: rgba(12,10,8,.42);
    backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.16);
    border-radius: 28px; padding: 42px;
  }
  .split-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 28px; align-items: center; padding: 88px 0; }
  .hero.convert { min-height: 88vh; display: grid; align-items: end; padding: 90px 0 56px; }
  .hero.convert h1 { font-size: clamp(44px, 8vw, 96px); max-width: 14ch; }
  .hero.editorial { min-height: 88vh; display: grid; place-items: center; text-align: center; }
  .hero.editorial h1 { font-size: clamp(48px, 8vw, 104px); }
  .center { text-align: center; }
  .center .lead { margin: 0 auto; }
  .ornament { font-size: 28px; color: var(--accent); margin: 8px 0 18px; }
  .info {
    background: color-mix(in srgb, var(--card) 92%, transparent);
    color: var(--ink);
    border-radius: 22px; padding: 22px; box-shadow: 0 16px 40px rgba(0,0,0,.18);
    backdrop-filter: blur(10px);
  }
  .info p { margin: 0 0 12px; }
  .info span { display: block; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
  .section { padding: 36px 0 28px; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .card { background: var(--card); border-radius: 20px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
  .photo-card {
    min-height: 280px; padding: 0; overflow: hidden; position: relative;
    background-image: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.72)), var(--card-photo);
    background-size: cover; background-position: center; color: #fff;
  }
  .photo-card-body { position: absolute; inset: auto 0 0 0; padding: 22px; }
  .photo-card h3 { color: #fff; }
  .photo-card p { color: rgba(255,255,255,.86); }
  .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .gallery figure { margin: 0; min-height: 220px; border-radius: 18px; background-size: cover; background-position: center; }
  footer { border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent); padding: 28px 0 40px; color: var(--muted); font-size: 14px; }
  .tiny { opacity: .8; font-size: 14px; }
  @media (max-width: 800px) {
    .split-grid, .grid3, .gallery { grid-template-columns: 1fr; }
    .glass { padding: 24px; }
    .hero.classic, .hero.catalog, .hero.editorial, .hero.convert { min-height: 72vh; }
  }
</style>
</head>
<body>
  ${heroByLayout(layoutId, place, cfg, wa)}
  <main class="wrap">
    <section class="section">
      <p class="kicker">Sobre</p>
      <h2>${esc(cfg.about)}</h2>
    </section>
    ${galleryHtml(gallery)}
    <section class="section">
      <p class="kicker">Serviços</p>
      ${servicesHtml(cfg.services, gallery)}
    </section>
    <section class="section">
      <p class="kicker">Contato</p>
      <h2>${esc(cfg.contactTitle)}</h2>
      <p>${esc(place.phone ? "Resposta rápida pelo WhatsApp, sem compromisso." : "Entre em contato e conheça nossos serviços.")}</p>
      ${wa ? `<a class="cta" href="${esc(wa)}">${esc(cfg.ctaLabel)}</a>` : ""}
      <div style="margin-top:24px">${infoBlock(place)}</div>
    </section>
  </main>
  <footer><div class="wrap">${esc(cfg.footerNote || `© ${year} ${place.name || ""}`)}</div></footer>
</body>
</html>`;
}
