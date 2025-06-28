import React, { useState, useEffect } from 'react';
import { Upload, Plus, Eye, Trash2, Edit, Save, X, LogOut, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product, ProductCode } from '../types/Product';
import { ProductFileInfo } from '../services/ProductFileService';
import AdminLogin from '../components/AdminLogin';

const Admin: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    registerProductsFromFiles, 
    getPendingProducts, 
    validateProductFiles 
  } = useProducts();
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'files'>('upload');
  const [productCode, setProductCode] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<ProductFileInfo[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: ProductFileInfo[];
    invalid: { code: string; issues: string[] }[];
  } | null>(null);
  const [registrationResults, setRegistrationResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  // Load pending products on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadPendingProducts();
      loadValidationResults();
    }
  }, [isAuthenticated]);

  const loadPendingProducts = async () => {
    const pending = await getPendingProducts();
    setPendingProducts(pending);
  };

  const loadValidationResults = async () => {
    const validation = await validateProductFiles();
    setValidationResults(validation);
  };

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

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: parsedCode.name,
        price: parsedCode.price,
        category: parsedCode.category,
        description: productDescription,
        mainImage: `https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800`,
        additionalImages: [
          'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        featured: false,
        inStock: true
      };

      addProduct(newProduct);
      setProductCode('');
      setProductDescription('');
      setIsUploading(false);
      alert('Producto agregado exitosamente');
    }, 2000);
  };

  const handleRegisterProducts = async () => {
    setIsRegistering(true);
    try {
      const results = await registerProductsFromFiles();
      setRegistrationResults(results);
      
      // Reload data
      await loadPendingProducts();
      await loadValidationResults();
      
      if (results.success > 0) {
        alert(`Se registraron ${results.success} productos exitosamente`);
      }
    } catch (error) {
      console.error('Error registering products:', error);
      alert('Error al registrar productos');
    } finally {
      setIsRegistering(false);
    }
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
                onClick={() => setActiveTab('files')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'files'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Archivos ({pendingProducts.length})
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

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Registration Results */}
            {registrationResults && (
              <div className={`p-4 rounded-lg border ${
                registrationResults.success > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {registrationResults.success > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h3 className="font-semibold text-gray-900">
                    Resultado del Registro
                  </h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Se registraron {registrationResults.success} productos exitosamente.
                </p>
                {registrationResults.errors.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Errores:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {registrationResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Register Products Button */}
            <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-playfair text-2xl font-bold text-gray-900">
                  Registrar Productos desde Archivos
                </h2>
                <button
                  onClick={handleRegisterProducts}
                  disabled={isRegistering || pendingProducts.length === 0}
                  className="bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Registrar Productos Pendientes</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Sube archivos .txt a la carpeta /public/product-descriptions y las imágenes correspondientes a /public/product-images, 
                luego haz clic en "Registrar Productos Pendientes" para agregarlos automáticamente al catálogo.
              </p>

              {/* Pending Products List */}
              {pendingProducts.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Productos Pendientes:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingProducts.map((product, index) => (
                      <div key={index} className="bg-cream-50 border border-beige-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{product.code}</span>
                          <div className="flex space-x-1">
                            {product.hasDescription && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {product.hasImages && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {!product.hasDescription && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            {!product.hasImages && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No hay productos pendientes de registro</p>
                </div>
              )}
            </div>

            {/* Validation Results */}
            {validationResults && (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-6">
                <h3 className="font-playfair text-xl font-bold text-gray-900 mb-4">
                  Estado de Archivos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valid Files */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Archivos Válidos ({validationResults.valid.length})
                    </h4>
                    {validationResults.valid.length > 0 ? (
                      <div className="space-y-2">
                        {validationResults.valid.map((product, index) => (
                          <div key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                            {product.code}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay archivos válidos</p>
                    )}
                  </div>

                  {/* Invalid Files */}
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Archivos con Problemas ({validationResults.invalid.length})
                    </h4>
                    {validationResults.invalid.length > 0 ? (
                      <div className="space-y-2">
                        {validationResults.invalid.map((product, index) => (
                          <div key={index} className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                            <div className="font-medium">{product.code}</div>
                            <div className="text-red-600 text-xs">
                              {product.issues.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay archivos con problemas</p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                    Comienza agregando tu primer producto usando la pestaña "Subir Producto" o "Archivos"
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Subir Producto
                    </button>
                    <button
                      onClick={() => setActiveTab('files')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Ver Archivos
                    </button>
                  </div>
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