import { Product } from '../types/Product';

export interface ProductFileInfo {
  code: string;
  imageFile?: string;
  descriptionFile?: string;
}

export class ProductFileService {
  static async listImageFiles(): Promise<string[]> {
    const res = await fetch('/api/list-images');
    if (!res.ok) throw new Error('No se pudieron listar las imágenes');
    return await res.json();
  }

  static async listDescriptionFiles(): Promise<string[]> {
    const res = await fetch('/api/list-descriptions');
    if (!res.ok) throw new Error('No se pudieron listar las descripciones');
    return await res.json();
  }

  static async getAvailableProducts(): Promise<ProductFileInfo[]> {
    const [images, descriptions] = await Promise.all([
      this.listImageFiles(),
      this.listDescriptionFiles()
    ]);
    const imageMap = new Map<string, string>();
    images.forEach(img => {
      const code = img.replace(/\.[^.]+$/, '');
      imageMap.set(code, img);
    });
    const descMap = new Map<string, string>();
    descriptions.forEach(desc => {
      const code = desc.replace(/\.[^.]+$/, '');
      descMap.set(code, desc);
    });
    const allCodes = new Set([...imageMap.keys(), ...descMap.keys()]);
    return Array.from(allCodes).map(code => ({
      code,
      imageFile: imageMap.get(code),
      descriptionFile: descMap.get(code)
    }));
  }

  static async validateProductFiles() {
    const files = await this.getAvailableProducts();
    const valid: ProductFileInfo[] = [];
    const invalid: { code: string; issues: string[] }[] = [];
    for (const file of files) {
      const issues: string[] = [];
      if (!file.imageFile) issues.push('Falta imagen');
      if (!file.descriptionFile) issues.push('Falta descripción');
      if (issues.length === 0) valid.push(file);
      else invalid.push({ code: file.code, issues });
    }
    return { valid, invalid };
  }

  static async createProductFromFile(file: ProductFileInfo): Promise<Product | null> {
    if (!file.imageFile || !file.descriptionFile) return null;
    // Parse code: 1-AnilloSolitarioDiamante-3599.0
    const [categoryCode, name, price] = file.code.split('-');
    const categoryMap: { [key: string]: string } = {
      '1': 'Anillos',
      '2': 'Aretes',
      '3': 'Collares',
      '4': 'Pulseras',
      '5': 'Conjuntos'
    };
    const category = categoryMap[categoryCode] || 'Otro';
    const imageUrl = `/public/product-images/${file.imageFile}`;
    const descUrl = `/public/product-descriptions/${file.descriptionFile}`;
    let description = '';
    try {
      const res = await fetch(descUrl);
      description = await res.text();
    } catch {
      description = '';
    }
    return {
      id: file.code,
      name,
      price: parseFloat(price),
      category,
      description,
      mainImage: imageUrl,
      additionalImages: [],
      featured: false,
      inStock: true
    };
  }
} 