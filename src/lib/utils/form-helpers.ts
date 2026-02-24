// Fonction pour parser les valeurs numériques depuis les inputs
export function parseNumberValue(value: unknown): number | undefined {
  // Si la valeur est vide, undefined ou null
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  
  // Si c'est déjà un nombre
  if (typeof value === "number") {
    return isNaN(value) ? undefined : value;
  }
  
  // Si c'est une string, essayer de la parser
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    
    // Remplacer la virgule par un point pour les nombres décimaux français
    const normalized = trimmed.replace(",", ".");
    const parsed = parseFloat(normalized);
    
    return isNaN(parsed) ? undefined : parsed;
  }
  
  return undefined;
}

// Fonction pour formater les nombres pour l'affichage
export function formatNumberForInput(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "";
  }
  return value.toString();
}