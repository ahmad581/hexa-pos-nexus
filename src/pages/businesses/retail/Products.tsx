
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, DollarSign } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  inStock: boolean;
}

const initialProducts: Product[] = [
  { id: "1", name: "Wireless Headphones", description: "High-quality bluetooth headphones", price: 99.99, category: "Electronics", stock: 15, sku: "WH001", inStock: true },
  { id: "2", name: "Cotton T-Shirt", description: "100% cotton comfortable t-shirt", price: 19.99, category: "Clothing", stock: 0, sku: "CT001", inStock: false },
  { id: "3", name: "Water Bottle", description: "Stainless steel insulated bottle", price: 24.99, category: "Accessories", stock: 8, sku: "WB001", inStock: true },
];

export const Products = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400">Manage store inventory</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          Add Product
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-700 border-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{product.name}</h3>
              <Badge className={product.inStock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-gray-400 text-sm">{product.description}</p>
              <div className="flex items-center text-gray-300">
                <Package size={16} className="mr-2" />
                <span className="text-sm">SKU: {product.sku}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-sm">Stock: {product.stock} units</span>
              </div>
              <div className="flex items-center text-green-400">
                <DollarSign size={16} className="mr-1" />
                <span className="font-bold text-lg">{product.price}</span>
              </div>
              <div className="text-xs text-gray-400">
                Category: {product.category}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
