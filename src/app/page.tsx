import ProductList from '@/components/products/ProductList';

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">
          Browse our collection of premium tech products
        </p>
      </div>
      <ProductList />
    </div>
  );
}
