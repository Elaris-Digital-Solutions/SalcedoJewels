import React, { useState } from 'react';
import { Upload, Plus, Eye, Trash2, Edit, Save, X, LogOut } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, ProductCode } from '../types/Product';
import AdminLogin from '../components/AdminLogin';

// Agregar declaración global para window.cloudinary
// @ts-ignore
declare global {
  interface Window {
    cloudinary?: any;
  }
}

const Admin: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [productCode, setProductCode] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ filename: string, url: string }[]>([]);

  // Si no está autenticado, mostrar el formulario de login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => {}} />;
  }

  // Parse product code
  const parseProductCode = (code: string): ProductCode | null => {
    try {
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
      return null;
    }
  };

  const handleUploadProduct = () => {
    if (!productCode.trim() || !productDescription.trim()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const parsedCode = parseProductCode(productCode);
    if (!parsedCode) {
      alert('Código de producto inválido');
      return;
    }

    // Buscar las URLs de las imágenes subidas que coincidan con los nombres en el código
    const imageUrls = parsedCode.images.map(imgName => {
      const found = uploadedImages.find(img => img.filename === imgName);
      return found ? found.url : '';
    }).filter(Boolean);

    setIsUploading(true);

    setTimeout(() => {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: parsedCode.name,
        price: parsedCode.price,
        category: parsedCode.category,
        description: productDescription,
        mainImage: imageUrls[0] || 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800',
        additionalImages: imageUrls.slice(1),
        featured: false,
        inStock: true
      };

      addProduct(newProduct);
      setProductCode('');
      setProductDescription('');
      setUploadedImages([]);
      setIsUploading(false);
      alert('Producto agregado exitosamente');
    }, 2000);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  const parsedCode = productCode ? parseProductCode(productCode) : null;

  // Cloudinary Upload Widget
  const CLOUD_NAME = 'dkxks0g3o';
  const UPLOAD_PRESET = 'salcedo-jewels-direct'; // <-- nombre actualizado del preset

  const CloudinaryUploadWidget: React.FC<{ onUpload: (url: string, info: any) => void }> = ({ onUpload }) => {
    React.useEffect(() => {
      if (!window.cloudinary) {
        const script = document.createElement('script');
        script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }, []);

    const openWidget = () => {
      if (!window.cloudinary) return;
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          folder: 'salcedo-jewels/products',
          multiple: true,
          sources: ['local', 'url', 'camera'],
          cropping: false,
          maxFileSize: 8 * 1024 * 1024, // 8 MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxFiles: 50
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            onUpload(result.info.secure_url, result.info);
          }
        }
      );
      widget.open();
    };

    return (
      <button
        type="button"
        onClick={openWidget}
        className="bg-gold-500 text-white px-4 py-2 rounded mb-4"
      >
        Subir imágenes a Cloudinary
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-cream-25 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
              Panel de Administración
            </h1>
            <p className="font-inter text-gray-600">
              Gestiona el catálogo de productos de Salcedo Jewels
            </p>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-beige-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'upload'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Subir Producto
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'manage'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Gestionar Productos ({products.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Upload Product Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
              Subir Nuevo Producto
            </h2>
            {/* Cloudinary Widget solo en la pestaña de subida */}
            <CloudinaryUploadWidget
              onUpload={(url, info) => {
                setUploadedImages((prev) => [
                  ...prev,
                  { filename: info.original_filename + '.' + info.format, url }
                ]);
              }}
            />
            <div className="space-y-6">
              {/* Product Code Input */}
              <div>
                <label htmlFor="productCode" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                  Código del Producto
                </label>
                <input
                  type="text"
                  id="productCode"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="2-AretesMariposaConBrillantes-1449.9-111.png-112.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Formato: [categoría]-[nombre]-[precio]-[imagen1.png]-[imagen2.png]
                </p>
              </div>

              {/* Parsed Information Preview */}
              {parsedCode && (
                <div className="bg-cream-100 border border-beige-300 rounded-lg p-4">
                  <h3 className="font-inter font-semibold text-gray-900 mb-3">
                    Vista Previa del Producto:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Categoría:</span> {parsedCode.category}</p>
                    <p><span className="font-medium">Nombre:</span> {parsedCode.name}</p>
                    <p><span className="font-medium">Precio:</span> ${parsedCode.price.toLocaleString()}</p>
                    <p><span className="font-medium">Imágenes:</span> {parsedCode.images.length} archivo(s)</p>
                  </div>
                </div>
              )}

              {/* Product Description */}
              <div>
                <label htmlFor="productDescription" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                  Descripción del Producto
                </label>
                <textarea
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                  placeholder="Descripción detallada del producto..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-vertical"
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUploadProduct}
                disabled={!productCode || !productDescription || isUploading}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Agregar Producto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Manage Products Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Eye className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">
                    No hay productos
                  </h3>
                  <p className="font-inter text-gray-600 mb-6">
                    Comienza agregando tu primer producto usando la pestaña "Subir Producto"
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Subir Primer Producto
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border border-beige-200 overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      {editingProduct?.id === product.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                          <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          >
                            <option value="Anillos">Anillos</option>
                            <option value="Aretes">Aretes</option>
                            <option value="Collares">Collares</option>
                            <option value="Pulseras">Pulseras</option>
                            <option value="Conjuntos">Conjuntos</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                            >
                              <Save className="h-4 w-4" />
                              <span>Guardar</span>
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancelar</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="mb-2">
                            <span className="text-xs text-gold-600 uppercase tracking-wide">
                              {product.category}
                            </span>
                          </div>
                          <h3 className="font-playfair text-lg font-semibold text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <p className="font-playfair text-lg font-bold text-gold-600 mb-4">
                            ${product.price.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'En stock' : 'Agotado'}
                            </span>
                            {product.featured && (
                              <span className="text-xs px-2 py-1 rounded-full bg-cream-200 text-gold-800">
                                Destacado
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;