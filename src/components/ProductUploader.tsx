import { useState, useEffect } from 'react';
import { Upload, X, Save, Barcode, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { useProducts } from '../contexts/ProductContext';
import { useSettings } from '../contexts/SettingsContext';
import { compressImage } from '../utils/imageCompression';

interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export function ProductUploader() {
  const { addProduct, refreshProducts } = useProducts();
  const { settings } = useSettings();

  // Use sizes and colors from settings, fallback to defaults if not available
  const sizes = settings.sizes && settings.sizes.length > 0 ? settings.sizes : ['XS', 'S', 'M', 'L', 'XL'];
  const colors = settings.colors && settings.colors.length > 0 ? settings.colors : ['Black', 'White', 'Blue', 'Red'];

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [itemName, setItemName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Initialize variants when sizes or colors change from settings
  useEffect(() => {
    const initialVariants: ProductVariant[] = [];
    sizes.forEach(size => {
      colors.forEach(color => {
        initialVariants.push({ size, color, stock: 0 });
      });
    });
    setVariants(initialVariants);
  }, [sizes.join(','), colors.join(',')]); // Only re-initialize when sizes or colors actually change

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 2 images total for optimal transmission (2 × 80KB = 160KB max)
    const filesToProcess = Array.from(files).slice(0, 2 - uploadedImages.length);
    
    for (const file of filesToProcess) {
      try {
        // Compress image to max 80KB for reliable transmission
        const compressedUrl = await compressImage(file, 80);
        
        const newImage: UploadedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: compressedUrl,
          file
        };
        
        setUploadedImages(prev => [...prev, newImage]);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Failed to compress image. Please try a different image.');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    // Limit to 2 images total for optimal transmission (2 × 80KB = 160KB max)
    const filesToProcess = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 2 - uploadedImages.length);
    
    for (const file of filesToProcess) {
      try {
        // Compress image to max 80KB for reliable transmission
        const compressedUrl = await compressImage(file, 80);
        
        const newImage: UploadedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: compressedUrl,
          file
        };
        
        setUploadedImages(prev => [...prev, newImage]);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Failed to compress image. Please try a different image.');
      }
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
  };

  const generateSKU = () => {
    const generatedSKU = `UWR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setSku(generatedSKU);
  };

  const generateBarcode = () => {
    const generatedBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcode(generatedBarcode);
  };

  const updateVariantStock = (size: string, color: string, stock: number) => {
    setVariants(variants.map(v => 
      v.size === size && v.color === color ? { ...v, stock } : v
    ));
  };

  const handleSaveProduct = async () => {
    if (!itemName || !category || !price || uploadedImages.length === 0) {
      toast.error('Please fill in all required fields and upload at least one image');
      return;
    }
    
    const generatedSKU = sku || `UWR-${Date.now().toString(36).toUpperCase()}`;
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    
    // Get unique sizes and colors that have stock
    const availableSizes = [...new Set(variants.filter(v => v.stock > 0).map(v => v.size))];
    const availableColors = [...new Set(variants.filter(v => v.stock > 0).map(v => v.color))];
    
    // Add product to context
    addProduct({
      brand: brand || 'Unknown',
      title: itemName,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category,
      sizes: availableSizes.length > 0 ? availableSizes : ['S', 'M', 'L', 'XL'],
      colors: availableColors.length > 0 ? availableColors : ['Black', 'White'],
      image: uploadedImages[0].url,
      images: uploadedImages.map(img => img.url),
      sku: generatedSKU,
      barcode: barcode || '',
      totalStock,
      createdAt: new Date().toISOString()
    });
    
    toast.success(`Product \"${itemName}\" saved and synced to cloud! ☁️`, {
      description: `SKU: ${generatedSKU} | Total Stock: ${totalStock} units | Visible on all devices`
    });
    
    console.log('Product upload complete, product should be visible immediately');
    
    // Reset form after successful save
    setTimeout(() => {
      setUploadedImages([]);
      setItemName('');
      setBrand('');
      setCategory('');
      setPrice('');
      setOriginalPrice('');
      setSku('');
      setBarcode('');
      setVariants(variants.map(v => ({ ...v, stock: 0 })));
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <h2 className="text-xl mb-6">Add New Product</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Images and Details */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Product Images (up to 2)</Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0056D2] transition-colors cursor-pointer"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-700 mb-1">
                  Drag and drop images or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  {uploadedImages.length} / 2 images uploaded • Auto-compressed to 80KB
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative aspect-square group">
                    <img
                      src={img.url}
                      alt="Product"
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Label>Brand Name</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Nike"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Product Name *</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Classic White T-Shirt"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {settings.categories && settings.categories.length > 0 ? (
                    settings.categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Uncategorized">No categories available - Add in Settings</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sale Price ($) *</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.99"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Original Price ($)</Label>
                <Input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="34.99"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* SKU & Barcode */}
          <div className="space-y-4">
            <div>
              <Label>SKU Number</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Enter or generate SKU"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={generateSKU}
                  className="gap-2"
                >
                  <Package className="w-4 h-4" />
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label>Barcode</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter or generate barcode"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={generateBarcode}
                  className="gap-2"
                >
                  <Barcode className="w-4 h-4" />
                  Generate
                </Button>
              </div>
              {barcode && (
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-center font-mono text-sm">
                  {barcode}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Inventory Matrix */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label>Inventory by Size & Color</Label>
            <Badge variant="outline">
              {variants.reduce((sum, v) => sum + v.stock, 0)} Total Units
            </Badge>
          </div>

          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-2.5 px-3">Size</th>
                    {colors.map(color => (
                      <th key={color} className="text-center py-2.5 px-3">
                        {color}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(size => (
                    <tr key={size} className="border-b border-gray-200">
                      <td className="py-2.5 px-3">
                        {size}
                      </td>
                      {colors.map(color => {
                        const variant = variants.find(v => v.size === size && v.color === color);
                        return (
                          <td key={color} className="py-2.5 px-3">
                            <Input
                              type="number"
                              min="0"
                              value={variant?.stock || 0}
                              onChange={(e) => updateVariantStock(size, color, parseInt(e.target.value) || 0)}
                              className="w-16 text-center mx-auto"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setUploadedImages([]);
                setItemName('');
                setBrand('');
                setCategory('');
                setPrice('');
                setOriginalPrice('');
                setSku('');
                setBarcode('');
                setVariants(variants.map(v => ({ ...v, stock: 0 })));
              }}
            >
              Clear Form
            </Button>
            <Button 
              onClick={handleSaveProduct}
              className="gap-2 bg-[#0056D2] hover:bg-[#003d9a]"
            >
              <Save className="w-4 h-4" />
              Save & Publish Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}