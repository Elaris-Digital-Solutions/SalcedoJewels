import { Product, ProductCode } from '../types/Product';

export interface ProductFileInfo {
  code: string;
  description: string;
  images: string[];
  hasDescription: boolean;
  hasImages: boolean;
}

export class ProductFileService {
  private static readonly IMAGES_PATH = '/product-images/';
  private static readonly DESCRIPTIONS_PATH = '/product-descriptions/';

  // Parse product code from filename
  static parseProductCode(filename: string): ProductCode | null {
    try {
      // Remove .txt extension if present
      const code = filename.replace('.txt', '');
      const parts = code.split('-');
      
      if (parts.length < 3) return null;

      const category = parts[0];
      const name = parts[1];
      const price = parseFloat(parts[2]);
      const images = parts.slice(3).filter(part => part.includes('.'));

      // Map category numbers to names
      const categoryMap: { [key: string]: string } = {
        '1': 'Anillos',
        '2': 'Aretes',
        '3': 'Collares',
        '4': 'Pulseras',
        '5': 'Conjuntos'
      };

      return {
        category: categoryMap[category] || 'Otros',
        name: name.replace(/([A-Z])/g, ' $1').trim(),
        price,
        images
      };
    } catch (error) {
      console.error('Error parsing product code:', error);
      return null;
    }
  }

  // Check if image exists
  static async checkImageExists(imageName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.IMAGES_PATH}${imageName}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Check if description file exists
  static async checkDescriptionExists(code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.DESCRIPTIONS_PATH}${code}.txt`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Read description from file
  static async readDescription(code: string): Promise<string> {
    try {
      const response = await fetch(`${this.DESCRIPTIONS_PATH}${code}.txt`);
      if (!response.ok) {
        throw new Error('Description file not found');
      }
      return await response.text();
    } catch (error) {
      console.error('Error reading description:', error);
      return 'Descripción no disponible';
    }
  }

  // Get all available product files
  static async getAvailableProducts(): Promise<ProductFileInfo[]> {
    try {
      // In a real implementation, you would fetch the list of files from the server
      // For now, we'll return a mock list based on the files we know exist
      const mockFiles = [
        '2-AretesMariposaConBrillantes-1449.9.txt',
        '3-CollarCorazonEterno-2299.0.txt'
      ];

      const products: ProductFileInfo[] = [];

      for (const filename of mockFiles) {
        const code = filename.replace('.txt', '');
        const parsedCode = this.parseProductCode(code);
        
        if (parsedCode) {
          const description = await this.readDescription(code);
          const hasDescription = await this.checkDescriptionExists(code);
          const hasImages = parsedCode.images.length > 0 && 
            await Promise.all(parsedCode.images.map(img => this.checkImageExists(img)))
              .then(results => results.some(exists => exists));

          products.push({
            code,
            description,
            images: parsedCode.images,
            hasDescription,
            hasImages
          });
        }
      }

      return products;
    } catch (error) {
      console.error('Error getting available products:', error);
      return [];
    }
  }

  // Create product from file info
  static async createProductFromFile(fileInfo: ProductFileInfo): Promise<Product | null> {
    try {
      const parsedCode = this.parseProductCode(fileInfo.code);
      if (!parsedCode) return null;

      // Check if images exist and get their paths
      const imagePaths = await Promise.all(
        parsedCode.images.map(async (imageName) => {
          const exists = await this.checkImageExists(imageName);
          return exists ? `${this.IMAGES_PATH}${imageName}` : null;
        })
      );

      const validImages = imagePaths.filter(path => path !== null) as string[];

      return {
        id: Date.now().toString(),
        name: parsedCode.name,
        price: parsedCode.price,
        category: parsedCode.category,
        description: fileInfo.description,
        mainImage: validImages[0] || 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800',
        additionalImages: validImages.slice(1),
        featured: false,
        inStock: true
      };
    } catch (error) {
      console.error('Error creating product from file:', error);
      return null;
    }
  }

  // Validate product files
  static async validateProductFiles(): Promise<{
    valid: ProductFileInfo[];
    invalid: { code: string; issues: string[] }[];
  }> {
    const products = await this.getAvailableProducts();
    const valid: ProductFileInfo[] = [];
    const invalid: { code: string; issues: string[] }[] = [];

    for (const product of products) {
      const issues: string[] = [];
      
      if (!product.hasDescription) {
        issues.push('Falta archivo de descripción');
      }
      
      if (!product.hasImages) {
        issues.push('Faltan imágenes del producto');
      }

      if (issues.length === 0) {
        valid.push(product);
      } else {
        invalid.push({ code: product.code, issues });
      }
    }

    return { valid, invalid };
  }
} 