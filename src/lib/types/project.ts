export interface Project {
  id: string;
  nom: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  projectKits?: ProjectKit[];
  totalImpact?: EnvironmentalImpact;
  totalPrix?: number;
  totalSurface?: number;
}

export interface ProjectKit {
  id: string;
  projectId: string;
  kitId: string;
  quantite: number;
  kit?: Kit;
  project?: Project;
}

export interface Kit {
  id: string;
  nom: string;
  style: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  updatedById: string;
  updatedBy?: User;
  kitProducts?: KitProduct[];
  projectKits?: ProjectKit[];
}

export interface KitProduct {
  id: string;
  kitId: string;
  productId: string;
  quantite: number;
  kit?: Kit;
  product?: Product;
}

export interface Product {
  id: string;
  nom: string;
  reference: string;
  description?: string;

  // LEGACY FIELDS - Pour compatibilité
  prixAchat1An: number;
  prixAchat2Ans?: number;
  prixAchat3Ans?: number;
  prixAchat?: number; // Alias for prixAchat1An for backward compatibility
  prixUnitaire1An: number;
  prixUnitaire2Ans?: number;
  prixUnitaire3Ans?: number;
  prixVente1An: number;
  prixVente2Ans?: number;
  prixVente3Ans?: number;
  margeCoefficient?: number;
  rechauffementClimatique?: number;
  epuisementRessources?: number;
  acidification?: number;
  eutrophisation?: number;

  // NOUVEAUX CHAMPS - PRIX ACHAT (un seul prix, pas de périodes)
  prixAchatAchat?: number;
  prixUnitaireAchat?: number;
  prixVenteAchat?: number;
  margeCoefficientAchat?: number;

  // DEPRECATED - PRIX ACHAT AVEC PÉRIODES
  prixAchatAchat1An?: number;
  prixAchatAchat2Ans?: number;
  prixAchatAchat3Ans?: number;
  prixUnitaireAchat1An?: number;
  prixUnitaireAchat2Ans?: number;
  prixUnitaireAchat3Ans?: number;
  prixVenteAchat1An?: number;
  prixVenteAchat2Ans?: number;
  prixVenteAchat3Ans?: number;

  // NOUVEAUX CHAMPS - PRIX LOCATION (avec périodes)
  prixAchatLocation1An?: number;
  prixAchatLocation2Ans?: number;
  prixAchatLocation3Ans?: number;
  prixUnitaireLocation1An?: number;
  prixUnitaireLocation2Ans?: number;
  prixUnitaireLocation3Ans?: number;
  prixVenteLocation1An?: number;
  prixVenteLocation2Ans?: number;
  prixVenteLocation3Ans?: number;
  margeCoefficientLocation?: number;

  // NOUVEAUX CHAMPS - IMPACT ENVIRONNEMENTAL ACHAT
  rechauffementClimatiqueAchat?: number;
  epuisementRessourcesAchat?: number;
  acidificationAchat?: number;
  eutrophisationAchat?: number;

  // NOUVEAUX CHAMPS - IMPACT ENVIRONNEMENTAL LOCATION
  rechauffementClimatiqueLocation?: number;
  epuisementRessourcesLocation?: number;
  acidificationLocation?: number;
  eutrophisationLocation?: number;

  // CHAMPS COMMUNS
  surfaceM2?: number;
  quantite?: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  createdBy?: User;
  updatedBy?: User;
  kitProducts?: KitProduct[];
}

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentalImpact {
  rechauffementClimatique: number; // kg eq. CO2
  epuisementRessources: number; // MJ
  acidification: number; // MOL H+
  eutrophisation: number; // kg P eq.
}

export enum ProjectStatus {
  ACTIF = 'ACTIF',
  TERMINE = 'TERMINE',
  EN_PAUSE = 'EN_PAUSE',
  ARCHIVE = 'ARCHIVE',
}

export enum UserRole {
  USER = 'USER',
  DEV = 'DEV',
  ADMIN = 'ADMIN',
}
