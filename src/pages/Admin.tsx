import React, { useEffect, useRef, useState } from 'react';
import { Upload, Plus, Minus, Eye, Trash2, Edit, Save, X, LogOut, ShoppingBag, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, GripVertical, LayoutGrid } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/Product';
import { Order } from '../types/Order';
import { supabase } from '../supabaseClient';
import AdminLogin from '../components/AdminLogin';
import { productDescriptions } from '../data/productDescriptions';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableProductItem = ({ product }: { product: Product }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded border shadow-sm cursor-move hover:shadow-md transition-shadow relative group ${
        isOutOfStock ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
      }`}
    >
      <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2 relative">
        <img 
          src={product.mainImage} 
          alt={product.name} 
          className={`w-full h-full object-cover pointer-events-none ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-gray-800/70 text-white text-[10px] px-2 py-1 rounded-full font-medium">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className={`text-xs font-medium truncate ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
        {product.name}
      </div>
      <div className="text-xs text-gray-500">${product.price}</div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white/80 rounded p-1">
        <GripVertical className="h-3 w-3 text-gray-600" />
      </div>
    </div>
  );
};

type SelectedImage = {
  file: File;
  previewUrl: string;
  filename: string;
};

const Admin: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, updateProductOrder } = useProducts();
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'orders' | 'organize'>('upload');
  
  // Organize State
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setOrderedProducts(products);
  }, [products]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      await updateProductOrder(orderedProducts);
      alert('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar el orden');
    } finally {
      setIsSavingOrder(false);
    }
  };
  
  // Product Form State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Anillos');
  const [productDescription, setProductDescription] = useState(productDescriptions['Anillos'][0]);
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [mainUploadIndex, setMainUploadIndex] = useState(0);

  const selectedImagesRef = useRef<SelectedImage[]>([]);
  
  // Order Management State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Product variants / stock state (must be declared before any early returns)
  const [hasVariants, setHasVariants] = useState(false);
  const [stock, setStock] = useState(1);
  const [variants, setVariants] = useState<{size: string, stock: number}[]>([]);
  const [newVariantSize, setNewVariantSize] = useState('');
  const [newVariantStock, setNewVariantStock] = useState(1);

  const handlePrevDescription = () => {
    const list = productDescriptions[productCategory] || [];
    if (list.length === 0) return;
    const newIndex = (descriptionIndex - 1 + list.length) % list.length;
    setDescriptionIndex(newIndex);
    setProductDescription(list[newIndex]);
  };

  const handleNextDescription = () => {
    const list = productDescriptions[productCategory] || [];
    if (list.length === 0) return;
    const newIndex = (descriptionIndex + 1) % list.length;
    setDescriptionIndex(newIndex);
    setProductDescription(list[newIndex]);
  };

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error al cargar los pedidos');
    } finally {
      setLoadingOrders(false);
    }
  };

  const deleteOrderItem = async (order: Order, itemIndex: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto del pedido? El stock será restaurado.')) {
      return;
    }

    try {
      const item = order.items[itemIndex];
      
      // 1. Restaurar stock del producto
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product.id)
        .single();

      if (productData) {
        let newStock = productData.stock;
        let newVariants = productData.variants;
        const quantityToRestore = item.quantity;
        const sizeToRestore = item.selectedSize;

        if (sizeToRestore && Array.isArray(newVariants)) {
            newVariants = newVariants.map((v: any) => {
              if (v.size === sizeToRestore) {
                return { ...v, stock: (v.stock || 0) + quantityToRestore };
              }
              return v;
            });
            newStock = newVariants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
        } else {
            newStock = (productData.stock || 0) + quantityToRestore;
        }

        await updateProduct(item.product.id, {
          stock: newStock,
          variants: newVariants,
          inStock: newStock > 0
        });
      }

      // 2. Actualizar pedido (remover item y recalcular total)
      const newItems = order.items.filter((_, idx) => idx !== itemIndex);
      
      // Si no quedan items, quizás deberíamos eliminar el pedido completo o dejarlo vacío con total 0
      // Aquí lo dejaremos vacío con total 0
      const newTotal = newItems.reduce((acc, curr) => acc + (curr.quantity * curr.product.price), 0);

      const { error } = await supabase
        .from('orders')
        .update({
          items: newItems,
          total_amount: newTotal
        })
        .eq('id', order.id);

      if (error) throw error;

      // 3. Actualizar estado local
      const updatedOrder = { ...order, items: newItems, total_amount: newTotal };
      setOrders(orders.map(o => o.id === order.id ? updatedOrder : o));
      if (selectedOrder?.id === order.id) setSelectedOrder(updatedOrder);

      alert('Producto eliminado del pedido y stock restaurado.');

    } catch (error) {
      console.error('Error deleting order item:', error);
      alert('Error al eliminar el producto del pedido');
    }
  };

  const deleteOrder = async (order: Order) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido? El stock de los productos será restaurado.')) {
      return;
    }

    try {
      // 1. Restaurar stock
      for (const item of order.items as any[]) {
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product.id)
          .single();

        if (productData) {
          let newStock = productData.stock;
          let newVariants = productData.variants;
          const quantityToRestore = item.quantity;
          const sizeToRestore = item.selectedSize;

          if (sizeToRestore && Array.isArray(newVariants)) {
             newVariants = newVariants.map((v: any) => {
                if (v.size === sizeToRestore) {
                  return { ...v, stock: (v.stock || 0) + quantityToRestore };
                }
                return v;
             });
             newStock = newVariants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
          } else {
             newStock = (productData.stock || 0) + quantityToRestore;
          }

          // Update product
          await updateProduct(item.product.id, {
            stock: newStock,
            variants: newVariants,
            inStock: newStock > 0
          });
        }
      }

      // 2. Eliminar pedido
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (error) throw error;

      // 3. Actualizar lista local
      setOrders(orders.filter(o => o.id !== order.id));
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
      
      alert('Pedido eliminado y stock restaurado correctamente.');

    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error al eliminar el pedido');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
      
      alert('Estado actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Error al actualizar el estado: ${error.message || 'Error desconocido'}`);
    }
  };

  // Si no está autenticado, mostrar el formulario de login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => {}} />;
  }


  const handleAddVariant = () => {
    if (newVariantSize && newVariantStock > 0) {
      setVariants([...variants, { size: newVariantSize, stock: newVariantStock }]);
      setNewVariantSize('');
      setNewVariantStock(1);
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      const target = prev[indexToRemove];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== indexToRemove);
    });
    setMainUploadIndex(prevMain => {
      if (indexToRemove === prevMain) return 0;
      if (indexToRemove < prevMain) return Math.max(0, prevMain - 1);
      return prevMain;
    });
  };

  const handleSelectImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const next: SelectedImage[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        filename: file.name
      }));

    setSelectedImages(prev => {
      // avoid duplicates by name+size+lastModified
      const existingKeys = new Set(prev.map(p => `${p.file.name}:${p.file.size}:${p.file.lastModified}`));
      const merged = [...prev];
      for (const img of next) {
        const key = `${img.file.name}:${img.file.size}:${img.file.lastModified}`;
        if (!existingKeys.has(key)) merged.push(img);
      }
      return merged;
    });
  };

  const handleUploadProduct = async () => {
    if (!productName.trim() || !productPrice || !productDescription.trim()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (selectedImages.length === 0) {
      alert('Por favor, sube al menos una imagen');
      return;
    }

    setIsUploading(true);

    try {
      const totalStock = hasVariants
        ? variants.reduce((acc, curr) => acc + curr.stock, 0)
        : stock;

      // 1) Crear el producto (confirmación) SIN subir imágenes aún.
      //    Luego subimos imágenes y actualizamos el producto.
      const placeholderImage = 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800';

      const newProduct: Product = {
        id: Date.now().toString(),
        name: productName,
        price: parseFloat(productPrice),
        category: productCategory,
        description: productDescription,
        mainImage: placeholderImage,
        additionalImages: [],
        featured: false,
        inStock: totalStock > 0,
        stock: totalStock,
        variants: hasVariants ? variants : undefined
      };

      const created = await addProduct(newProduct);

      // 2) Subir imágenes a Cloudinary (solo después de que el producto ya fue creado)
      const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER;

      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Falta configurar Cloudinary en el .env (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)');
      }

      const orderedSelection = (() => {
        const safeMainIndex = Math.min(Math.max(mainUploadIndex, 0), selectedImages.length - 1);
        const main = selectedImages[safeMainIndex];
        const rest = selectedImages.filter((_, i) => i !== safeMainIndex);
        return [main, ...rest];
      })();

      const uploadOne = async (img: SelectedImage) => {
        const form = new FormData();
        form.append('file', img.file);
        form.append('upload_preset', UPLOAD_PRESET);
        if (CLOUDINARY_FOLDER) form.append('folder', CLOUDINARY_FOLDER);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: form
        });

        const json = await res.json();
        if (!res.ok) {
          const message = json?.error?.message || 'Error subiendo imagen a Cloudinary';
          throw new Error(message);
        }

        return {
          secure_url: json.secure_url as string,
          public_id: json.public_id as string,
          format: json.format as string | undefined,
          bytes: typeof json.bytes === 'number' ? json.bytes : undefined,
          width: typeof json.width === 'number' ? json.width : undefined,
          height: typeof json.height === 'number' ? json.height : undefined
        };
      };

      const uploaded = await Promise.all(orderedSelection.map(uploadOne));
      const urls = uploaded.map(u => u.secure_url);

      // 3) Actualizar producto con URLs reales
      await updateProduct(created.id, {
        mainImage: urls[0] || placeholderImage,
        additionalImages: urls.slice(1)
      });

      // 4) Insertar relación en product_images
      const imagesToPersist = uploaded.map((img, index) => ({
        product_id: created.id,
        public_id: img.public_id,
        secure_url: img.secure_url,
        format: img.format || null,
        bytes: img.bytes ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
        is_main: index === 0,
        sort_order: index
      }));

      if (imagesToPersist.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .insert(imagesToPersist);

        if (error) {
          console.error('Error linking product_images:', error);
        }
      }

      // Reset
      setProductName('');
      setProductPrice('');
      // Reset description to the first one of the current category
      const defaultDesc = productDescriptions[productCategory]?.[0] || '';
      setProductDescription(defaultDesc);
      setDescriptionIndex(0);
      
      setSelectedImages(prev => {
        prev.forEach(img => img.previewUrl && URL.revokeObjectURL(img.previewUrl));
        return [];
      });
      setMainUploadIndex(0);
      setHasVariants(false);
      setStock(1);
      setVariants([]);
      alert('Producto agregado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto. Revisa la consola para más detalles.');
    } finally {
      setIsUploading(false);
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
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'orders'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingBag className="h-4 w-4 inline mr-2" />
                Pedidos
              </button>
              <button
                onClick={() => setActiveTab('organize')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'organize'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LayoutGrid className="h-4 w-4 inline mr-2" />
                Organizar Productos
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
            {/* Selección local (sube a Cloudinary SOLO al guardar producto) */}
            <div className="mb-4">
              <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                Imágenes del producto
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleSelectImages(e.target.files)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cream-100 file:text-gold-800 hover:file:bg-cream-200"
              />
              <p className="mt-2 text-xs text-gray-500">
                Las imágenes se subirán a Cloudinary cuando confirmes “Agregar Producto”.
              </p>
            </div>

            {selectedImages.length > 0 && (
              <div className="mb-6">
                <h3 className="font-inter text-sm font-medium text-gray-700 mb-3">
                  Imágenes seleccionadas ({selectedImages.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedImages.map((img, index) => (
                    <div key={`${img.filename}-${img.file.size}-${img.file.lastModified}-${index}`} className="border border-beige-200 rounded-lg overflow-hidden bg-white">
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img src={img.previewUrl} alt={img.filename} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setMainUploadIndex(index)}
                            className={
                              "text-xs px-2 py-1 rounded-full border transition-colors " +
                              (index === mainUploadIndex
                                ? 'bg-cream-200 text-gold-800 border-beige-300'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')
                            }
                          >
                            {index === mainUploadIndex ? 'Principal' : 'Hacer principal'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(index)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-gray-500 truncate" title={img.filename}>
                          {img.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-6">
              {/* Product Details Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="productCategory" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    id="productCategory"
                    value={productCategory}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setProductCategory(newCategory);
                      setDescriptionIndex(0);
                      const list = productDescriptions[newCategory] || [];
                      setProductDescription(list[0] || '');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="Anillos">Anillos</option>
                    <option value="Aretes">Aretes</option>
                    <option value="Collares">Collares</option>
                    <option value="Pulseras">Pulseras</option>
                    <option value="Conjuntos">Conjuntos</option>
                    <option value="Dijes">Dijes</option>
                    <option value="Cadenas">Cadenas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="productPrice" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                    Precio (USD)
                  </label>
                  <input
                    type="number"
                    id="productPrice"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="productName" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Ej: Anillo Brillante"
                />
              </div>

              {/* Product Description */}
              <div>
                <label htmlFor="productDescription" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                  Descripción del Producto
                </label>
                <div className="relative">
                  <textarea
                    id="productDescription"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={4}
                    placeholder="Descripción detallada del producto..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-vertical"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={handlePrevDescription}
                      className="flex items-center text-sm text-gray-600 hover:text-gold-600 transition-colors"
                      title="Descripción anterior"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </button>
                    <span className="text-xs text-gray-400">
                      Opción {descriptionIndex + 1} de {(productDescriptions[productCategory] || []).length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextDescription}
                      className="flex items-center text-sm text-gray-600 hover:text-gold-600 transition-colors"
                      title="Siguiente descripción"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock and Variants Configuration */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hasVariants"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasVariants" className="ml-2 block text-sm text-gray-900 font-medium">
                    Este producto tiene variantes (tallas/medidas)
                  </label>
                </div>

                {!hasVariants ? (
                  <div>
                    <label htmlFor="stock" className="block font-inter text-sm font-medium text-gray-700 mb-2">
                      Stock Total
                    </label>
                    <input
                      type="number"
                      id="stock"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                          Talla / Medida
                        </label>
                        <input
                          type="text"
                          value={newVariantSize}
                          onChange={(e) => setNewVariantSize(e.target.value)}
                          placeholder="Ej: 45cm, Talla 7, etc."
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block font-inter text-sm font-medium text-gray-700 mb-2">
                          Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newVariantStock}
                          onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>

                    {variants.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Variantes Agregadas:</h4>
                        <div className="bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
                          {variants.map((variant, index) => (
                            <div key={index} className="flex justify-between items-center p-3">
                              <div>
                                <span className="font-medium text-gray-900">{variant.size}</span>
                                <span className="text-gray-500 ml-2">({variant.stock} unidades)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUploadProduct}
                disabled={!productName || !productPrice || !productDescription || isUploading}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Guardando...</span>
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
                          {/* Name */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Nombre</label>
                            <input
                              type="text"
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Precio ($)</label>
                            <input
                              type="number"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Categoría</label>
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
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Descripción</label>
                            <textarea
                              value={editingProduct.description}
                              onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>

                          {/* Main Image */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Imagen Principal (URL)</label>
                            <input
                              type="text"
                              value={editingProduct.mainImage}
                              onChange={(e) => setEditingProduct({...editingProduct, mainImage: e.target.value})}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>

                          {/* Stock / Variants Logic */}
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`hasVariants-${product.id}`}
                                checked={Array.isArray(editingProduct.variants)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // Switch to variants
                                    setEditingProduct({
                                      ...editingProduct, 
                                      variants: [], 
                                      stock: 0,
                                      inStock: false
                                    });
                                  } else {
                                    // Switch to simple stock
                                    setEditingProduct({
                                      ...editingProduct, 
                                      variants: undefined,
                                      stock: 0,
                                      inStock: false
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`hasVariants-${product.id}`} className="ml-2 block text-xs text-gray-900">
                                Tiene Variantes
                              </label>
                            </div>

                            {!Array.isArray(editingProduct.variants) ? (
                                // Simple Stock
                                <div>
                                  <label className="block text-xs font-medium text-gray-700">Stock Total</label>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const newStock = Math.max(0, (editingProduct.stock || 0) - 1);
                                        setEditingProduct({
                                          ...editingProduct,
                                          stock: newStock,
                                          inStock: newStock > 0
                                        });
                                      }}
                                      className="p-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                                      title="Restar stock"
                                    >
                                      <Minus className="h-3 w-3 text-gray-600" />
                                    </button>
                                    <input
                                      type="number"
                                      value={editingProduct.stock || 0}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setEditingProduct({
                                          ...editingProduct, 
                                          stock: val,
                                          inStock: val > 0
                                        });
                                      }}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent text-center"
                                    />
                                    <button
                                      onClick={() => {
                                        const newStock = (editingProduct.stock || 0) + 1;
                                        setEditingProduct({
                                          ...editingProduct,
                                          stock: newStock,
                                          inStock: newStock > 0
                                        });
                                      }}
                                      className="p-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                                      title="Sumar stock"
                                    >
                                      <Plus className="h-3 w-3 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                            ) : (
                                // Variants Editor
                                <div className="space-y-2">
                                  <label className="block text-xs font-medium text-gray-700">Variantes</label>
                                  {editingProduct.variants?.map((variant, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        placeholder="Talla"
                                        value={variant.size}
                                        onChange={(e) => {
                                          const newVariants = [...(editingProduct.variants || [])];
                                          newVariants[idx].size = e.target.value;
                                          setEditingProduct({...editingProduct, variants: newVariants});
                                        }}
                                        className="w-1/3 px-2 py-1 text-xs border border-gray-300 rounded"
                                      />
                                      <div className="flex items-center gap-1 w-1/2">
                                        <button
                                          onClick={() => {
                                            const newVariants = [...(editingProduct.variants || [])];
                                            newVariants[idx].stock = Math.max(0, (newVariants[idx].stock || 0) - 1);
                                            const totalStock = newVariants.reduce((acc, curr) => acc + curr.stock, 0);
                                            setEditingProduct({
                                              ...editingProduct, 
                                              variants: newVariants, 
                                              stock: totalStock,
                                              inStock: totalStock > 0
                                            });
                                          }}
                                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                                        >
                                          <Minus className="h-3 w-3 text-gray-600" />
                                        </button>
                                        <input
                                          type="number"
                                          placeholder="Stock"
                                          value={variant.stock}
                                          onChange={(e) => {
                                            const newVariants = [...(editingProduct.variants || [])];
                                            newVariants[idx].stock = parseInt(e.target.value) || 0;
                                            // Update total stock
                                            const totalStock = newVariants.reduce((acc, curr) => acc + curr.stock, 0);
                                            setEditingProduct({
                                              ...editingProduct, 
                                              variants: newVariants, 
                                              stock: totalStock,
                                              inStock: totalStock > 0
                                            });
                                          }}
                                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                                        />
                                        <button
                                          onClick={() => {
                                            const newVariants = [...(editingProduct.variants || [])];
                                            newVariants[idx].stock = (newVariants[idx].stock || 0) + 1;
                                            const totalStock = newVariants.reduce((acc, curr) => acc + curr.stock, 0);
                                            setEditingProduct({
                                              ...editingProduct, 
                                              variants: newVariants, 
                                              stock: totalStock,
                                              inStock: totalStock > 0
                                            });
                                          }}
                                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                                        >
                                          <Plus className="h-3 w-3 text-gray-600" />
                                        </button>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const newVariants = editingProduct.variants?.filter((_, i) => i !== idx);
                                          const totalStock = newVariants?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
                                          setEditingProduct({
                                            ...editingProduct, 
                                            variants: newVariants, 
                                            stock: totalStock,
                                            inStock: totalStock > 0
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newVariants = [...(editingProduct.variants || []), { size: '', stock: 0 }];
                                      setEditingProduct({...editingProduct, variants: newVariants});
                                    }}
                                    className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center"
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Agregar Variante
                                  </button>
                                </div>
                            )}
                          </div>

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
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-beige-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-gray-300 rounded-md text-sm focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="all">Todos</option>
                  <option value="Recibido">Recibido</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              <button
                onClick={fetchOrders}
                className="text-gold-600 hover:text-gold-700 text-sm font-medium"
              >
                Actualizar lista
              </button>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay pedidos</h3>
                <p className="text-gray-500">Aún no se han registrado pedidos en el sistema.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-beige-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders
                        .filter(order => statusFilter === 'all' || order.status === statusFilter)
                        .map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className={selectedOrder?.id === order.id ? 'bg-cream-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.order_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.customer_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('es-PE')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              $ {order.total_amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 ${
                                  order.status === 'Recibido' ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500' :
                                  order.status === 'Confirmado' ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' :
                                  order.status === 'En proceso' ? 'bg-purple-100 text-purple-800 focus:ring-purple-500' :
                                  'bg-green-100 text-green-800 focus:ring-green-500'
                                }`}
                              >
                                <option value="Recibido">Recibido</option>
                                <option value="Confirmado">Confirmado</option>
                                <option value="En proceso">En proceso</option>
                                <option value="Entregado">Entregado</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                  className="text-gold-600 hover:text-gold-900 font-medium flex items-center"
                                >
                                  {selectedOrder?.id === order.id ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Ocultar
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      Ver
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => deleteOrder(order)}
                                  className="text-red-600 hover:text-red-900 font-medium flex items-center"
                                  title="Eliminar pedido"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {selectedOrder?.id === order.id && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-cream-50 border-b border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Información del Cliente</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><span className="font-medium">DNI:</span> {order.customer_dni}</p>
                                      <p><span className="font-medium">Teléfono:</span> {order.customer_phone}</p>
                                      <p><span className="font-medium">Dirección:</span> {order.shipping_address}</p>
                                      <p><span className="font-medium">Método de Pago:</span> {order.payment_method}</p>
                                      {order.installments && order.installments > 1 && (
                                        <p><span className="font-medium">Cuotas:</span> {order.installments}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Productos ({order.items.length})</h4>
                                    <div className="space-y-2">
                                      {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center space-x-3 text-sm bg-white p-2 rounded border border-gray-200">
                                          <img 
                                            src={item.product.mainImage} 
                                            alt={item.product.name} 
                                            className="w-10 h-10 object-cover rounded"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.product.name}</p>
                                            <p className="text-gray-500">Cant: {item.quantity} x $ {item.product.price}</p>
                                            {item.selectedSize && <p className="text-xs text-gray-400">Talla: {item.selectedSize}</p>}
                                          </div>
                                          <div className="flex flex-col items-end space-y-1">
                                            <p className="font-bold text-gray-900">
                                              $ {(item.quantity * item.product.price).toLocaleString()}
                                            </p>
                                            <button 
                                              onClick={() => deleteOrderItem(order, idx)}
                                              className="text-red-500 hover:text-red-700 p-1"
                                              title="Eliminar producto del pedido"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Organize Tab */}
        {activeTab === 'organize' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-beige-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Organizar Productos</h3>
                <p className="text-sm text-gray-500">Arrastra los productos para cambiar su orden en la tienda.</p>
              </div>
              <button
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {isSavingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar Orden</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-beige-200">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={orderedProducts.map(p => p.id)} 
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {orderedProducts.map((product) => (
                      <SortableProductItem key={product.id} product={product} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
