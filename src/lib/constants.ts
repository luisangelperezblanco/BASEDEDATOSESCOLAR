export const SEXOS = ["V", "H"] as const;
export const SEXO_LABELS: Record<(typeof SEXOS)[number], string> = { V: "Varón", H: "Hembra" };

export const CONDICIONES = ["REGULAR", "REPITIENTE", "EXTRANJERO", "NEE", "OTRO"] as const;
export const CONDICION_LABELS: Record<(typeof CONDICIONES)[number], string> = {
  REGULAR: "Regular",
  REPITIENTE: "Repitiente",
  EXTRANJERO: "Extranjero",
  NEE: "NEE",
  OTRO: "Otro",
};

export const ASISTENCIA = ["AS", "IA"] as const;
export type EstadoAsistencia = (typeof ASISTENCIA)[number];

export const MOMENTOS = ["I", "II", "III"] as const;
export const MOMENTO_LABELS: Record<(typeof MOMENTOS)[number], string> = {
  I: "I Momento",
  II: "II Momento",
  III: "III Momento",
};

export const AREAS = [
  "Lenguaje y Comunicación",
  "Matemática",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Educación Física",
  "Educación Estética",
  "Otra",
] as const;

export const LITERALES = ["L", "NL", "I", "C", "RR", "N", "SN"] as const;
export const LITERAL_LABELS: Record<(typeof LITERALES)[number], string> = {
  L: "Logrado",
  NL: "No logrado",
  I: "Iniciado",
  C: "Consolidado",
  RR: "Requiere refuerzo",
  N: "Nunca",
  SN: "Sin nota",
};

export const NIVELES_DIAGNOSTICO = ["I", "C", "RR"] as const;
export const NIVEL_LABELS: Record<(typeof NIVELES_DIAGNOSTICO)[number], string> = {
  I: "Iniciado",
  C: "Consolidado",
  RR: "Requiere refuerzo",
};

export const ESTILOS_ESCRITURA = ["CORREDIZA", "SCRIPT", "AGLUTINA", "NO_APLICA"] as const;
export const ESTILO_LABELS: Record<(typeof ESTILOS_ESCRITURA)[number], string> = {
  CORREDIZA: "C",
  SCRIPT: "S",
  AGLUTINA: "AG",
  NO_APLICA: "N/A",
};

export const MATERIALES = [
  "ESPONJA",
  "LAVA_PLATOS",
  "CLOROX",
  "LAVANSAN",
  "CERA",
  "VASOS",
  "PAPEL_HIGIENICO",
  "SERVILLETAS",
  "OTRO",
] as const;
export const MATERIAL_LABELS: Record<(typeof MATERIALES)[number], string> = {
  ESPONJA: "Esponja",
  LAVA_PLATOS: "Lava platos",
  CLOROX: "Clorox",
  LAVANSAN: "Lavansan",
  CERA: "Cera",
  VASOS: "Vasos",
  PAPEL_HIGIENICO: "Papel higiénico",
  SERVILLETAS: "Servilletas",
  OTRO: "Otro",
};

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
