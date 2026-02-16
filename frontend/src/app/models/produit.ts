export interface Categorie {
    _id: string;
    nom: string;
    description?: string;
  }
  
  export interface Produit {
    _id: string;
    nom: string;
    description?: string;
    prix: number;
    stock: number;
    id_categorie?: Categorie | string;
    contrat_id?: string;
    image_url?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
  }