//#region manejo de fechas
// Suma días a una fecha en formato YYYY-MM-DD y devuelve la nueva fecha en el mismo formato
function sumarDiasYYYYMMDD(fechaStr, dias = 1) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split('-').map(Number);

  // Crear fecha en UTC para evitar desfases por zona horaria
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + dias);

  const yy = fecha.getUTCFullYear();
  const mm = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getUTCDate()).padStart(2, '0');

  return `${yy}-${mm}-${dd}`;
}

function obtenerAnteriorDiaSemana(dia_objetivo = 4, fecha = new Date()) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dia = d.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb

  if (dia === dia_objetivo) {
    return d;
  }

  const diferencia = (dia - dia_objetivo + 7) % 7;
  d.setUTCDate(d.getUTCDate() - diferencia);

  return d;
}
//#endregion

//#region colores
const PILL_COLORS = [
  "#e57373", "#f06292", "#ba68c8", "#9575cd", "#7986cb",
  "#64b5f6", "#4fc3f7", "#4dd0e1", "#4db6ac", "#81c784",
  "#aed581", "#dce775", "#fff176", "#ffd54f", "#ffb74d",
  "#ff8a65", "#d32f2f", "#c2185b", "#7b1fa2", "#512da8",
  "#303f9f", "#1976d2", "#0288d1", "#0097a7", "#00796b",
  "#388e3c", "#689f38", "#afb42b", "#fbc02d", "#ffa000",
  "#f57c00", "#e64a19", "#5d4037", "#455a64", "#8d6e63",
  "#90a4ae", "#c0ca33", "#00acc1", "#00897b"
];

function getPillColorByIndex(i) {
  const color_fondo = PILL_COLORS[i % PILL_COLORS.length];
  const color_texto = getContrastTextColor(color_fondo);
  //return { background: color_fondo, color: color_texto };
  return `background: ${color_fondo}; color: ${color_texto};`;
}

// Devuelve el color  del texto en funcion del color de fondo para asegurar contraste
function getContrastTextColor(hexColor) {
  // hexColor tipo "#rrggbb"
  const hex = hexColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // YIQ: percepción humana de brillo
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // si es claro → texto negro, si es oscuro → texto blanco
  return yiq >= 128 ? "#000000" : "#ffffff";
}
//#endregion

function buscar_usuario_por_id(id) {
  return DATOS.maestros.usuarios[id];
}