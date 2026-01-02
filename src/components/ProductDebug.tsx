import { useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';

export function ProductDebug() {
  const { products, loading } = useProducts();

  useEffect(() => {
    console.log('=== PRODUCT DEBUG ===');
    console.log('Loading:', loading);
    console.log('Products count:', products.length);
    console.log('Products:', products);
    
    if (products.length > 0) {
      console.log('First product:', products[0]);
      console.log('First product has image?', !!products[0].image);
      console.log('First product image length:', products[0].image?.length || 0);
    }
  }, [products, loading]);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Product Debug</h3>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Products: {products.length}</div>
      {products.length > 0 && (
        <>
          <div>Has Images: {products.filter(p => p.image).length}</div>
          <div className="mt-2 text-[10px] opacity-70">Check console for details</div>
        </>
      )}
    </div>
  );
}
