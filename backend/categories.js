export const CATEGORY_MAP = [
  { keys: ["restaurante", "restaurantes", "comida", "food"], tags: ["amenity=restaurant", "amenity=fast_food", "amenity=cafe"], label: "Alimentação" },
  { keys: ["pizzaria", "pizza"], tags: ["amenity=restaurant", "amenity=fast_food", "cuisine=pizza"], label: "Pizzaria" },
  { keys: ["lanchonete", "hamburguer", "hamburger", "burger"], tags: ["amenity=fast_food", "amenity=restaurant"], label: "Lanchonete" },
  { keys: ["padaria", "padarias", "confeitaria"], tags: ["shop=bakery", "amenity=cafe"], label: "Padaria" },
  { keys: ["bar", "bares", "boteco", "pub"], tags: ["amenity=bar", "amenity=pub", "amenity=biergarten"], label: "Bar" },
  { keys: ["cafeteria", "cafe", "café", "coffee"], tags: ["amenity=cafe"], label: "Cafeteria" },
  { keys: ["mercado", "mercados", "supermercado", "hortifruti"], tags: ["shop=supermarket", "shop=convenience", "shop=greengrocer"], label: "Mercado" },
  { keys: ["farmacia", "farmácia", "farmacias", "drogaria"], tags: ["amenity=pharmacy", "healthcare=pharmacy"], label: "Farmácia" },
  { keys: ["dentista", "dentistas", "odonto", "odontologia"], tags: ["amenity=dentist", "healthcare=dentist"], label: "Dentista" },
  { keys: ["clinica", "clínica", "clinicas", "consultorio", "consultório"], tags: ["amenity=clinic", "amenity=doctors", "healthcare=clinic"], label: "Clínica" },
  { keys: ["medico", "médico", "medicos", "doutor"], tags: ["amenity=doctors", "healthcare=doctor"], label: "Médico" },
  { keys: ["veterinario", "veterinário", "pet", "petshop", "pet shop"], tags: ["amenity=veterinary", "shop=pet"], label: "Pet / Vet" },
  { keys: ["academia", "academias", "gym", "fitness", "crossfit"], tags: ["leisure=fitness_centre", "leisure=sports_centre", "sport=fitness"], label: "Academia" },
  { keys: ["salao", "salão", "cabeleireiro", "cabeleireira", "beleza", "estetica", "estética"], tags: ["shop=hairdresser", "shop=beauty", "shop=cosmetics"], label: "Beleza" },
  { keys: ["barbearia", "barbearias", "barber"], tags: ["shop=hairdresser", "shop=barber"], label: "Barbearia" },
  { keys: ["manicure", "unhas", "nail"], tags: ["shop=beauty", "craft=beauty"], label: "Manicure" },
  { keys: ["oficina", "mecanica", "mecânica", "auto center", "autocenter"], tags: ["shop=car_repair", "shop=car"], label: "Oficina" },
  { keys: ["lava jato", "lava-jato", "lavagem", "estetica automotiva"], tags: ["amenity=car_wash"], label: "Lava-car" },
  { keys: ["autopecas", "autopeças", "pecas auto"], tags: ["shop=car_parts"], label: "Autopeças" },
  { keys: ["imobiliaria", "imobiliária", "imoveis", "imóveis"], tags: ["office=estate_agent"], label: "Imobiliária" },
  { keys: ["advogado", "advogados", "advocacia", "juridico"], tags: ["office=lawyer"], label: "Advocacia" },
  { keys: ["contador", "contabilidade", "contabil"], tags: ["office=accountant"], label: "Contabilidade" },
  { keys: ["hotel", "hoteis", "hotéis", "pousada", "hostel"], tags: ["tourism=hotel", "tourism=guest_house", "tourism=hostel"], label: "Hospedagem" },
  { keys: ["escola", "escolas", "colegio", "colégio"], tags: ["amenity=school", "amenity=kindergarten"], label: "Escola" },
  { keys: ["curso", "idiomas", "autoescola", "cfc"], tags: ["amenity=driving_school", "amenity=language_school", "amenity=college"], label: "Cursos" },
  { keys: ["loja", "lojas", "comercio", "comércio", "varejo"], tags: ["shop=yes", "shop=clothes", "shop=gift"], label: "Comércio" },
  { keys: ["roupa", "roupas", "moda", "boutique"], tags: ["shop=clothes", "shop=fashion", "shop=boutique"], label: "Moda" },
  { keys: ["otica", "ótica", "oculos", "óculos"], tags: ["shop=optician"], label: "Ótica" },
  { keys: ["joalheria", "semijoias", "relojoaria"], tags: ["shop=jewelry", "shop=watches"], label: "Joalheria" },
  { keys: ["lavanderia", "lavanderias"], tags: ["shop=laundry", "shop=dry_cleaning"], label: "Lavanderia" },
  { keys: ["floricultura", "flores"], tags: ["shop=florist"], label: "Floricultura" },
  { keys: ["padaria", "confeitaria"], tags: ["shop=bakery"], label: "Padaria" },
  { keys: ["construcao", "construção", "material de construcao", "madeireira"], tags: ["shop=doityourself", "shop=hardware", "shop=trade"], label: "Construção" },
  { keys: ["eletrica", "elétrica", "eletricista"], tags: ["craft=electrician", "shop=electronics"], label: "Elétrica" },
  { keys: ["funeraria", "funerária"], tags: ["shop=funeral_directors"], label: "Funerária" },
  { keys: ["igreja", "templo"], tags: ["amenity=place_of_worship"], label: "Templo" },
  { keys: ["posto", "combustivel", "combustível", "gasolina"], tags: ["amenity=fuel"], label: "Posto" },
  { keys: ["banco", "financeira"], tags: ["amenity=bank", "amenity=atm"], label: "Banco" },
  { keys: ["cartorio", "cartório", "notario"], tags: ["office=notary", "office=government"], label: "Cartório" },
  { keys: ["grafica", "gráfica", "impressao"], tags: ["shop=copyshop", "craft=printer"], label: "Gráfica" },
  { keys: ["estudio", "estúdio", "fotografo", "fotógrafo"], tags: ["shop=photo", "craft=photographer"], label: "Estúdio" },
  { keys: ["spa", "massagem", "massagista"], tags: ["shop=beauty", "leisure=spa"], label: "Spa" },
  { keys: ["fisioterapia", "fisio", "pilates", "rpg"], tags: ["amenity=clinic", "healthcare=physiotherapist"], label: "Fisioterapia" },
  { keys: ["psicologo", "psicólogo", "terapia"], tags: ["healthcare=psychotherapist", "office=therapist"], label: "Psicologia" },
  { keys: ["laboratorio", "laboratório", "exames"], tags: ["amenity=laboratory", "healthcare=laboratory"], label: "Laboratório" }
];

export function matchCategories(query) {
  const q = normalize(query);
  const hits = CATEGORY_MAP.filter((item) => item.keys.some((k) => q.includes(normalize(k)) || normalize(k).includes(q)));
  if (hits.length) return hits;
  return [{ keys: [query], tags: [], label: query }];
}

export function expandQueries(query, location) {
  const q = query.trim();
  const loc = (location || "").trim();
  const cats = matchCategories(q);
  const variants = new Set([q]);
  cats.forEach((c) => c.keys.slice(0, 3).forEach((k) => variants.add(k)));
  const list = [...variants].slice(0, 4);
  return list.map((term) => (loc ? `${term} ${loc}` : term));
}

export function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
