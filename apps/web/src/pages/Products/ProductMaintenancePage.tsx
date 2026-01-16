import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';

// Define types based on the updated Prisma schema
interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  depositor?: string;
  supplier?: string;
  productType?: string;
  sanitaryClassification?: string;
  shelfLifeDays?: number;
  usefulLifeDays?: number;
  quarantineDays?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  isActive: boolean;
  controlsExpiry: boolean;
  closedPanel: boolean;
  showOnEntryNote: boolean;
  makesOrder: boolean;
  controlsBatch: boolean;
  gridSewing: boolean;
  quarantine: boolean;
  dynamicPicking: boolean;
  separationMagnitude: boolean;
  informExpiryOnCheck: boolean;
  isProductKit: boolean;
  specialComposition: boolean;
  createdAt: string;
  updatedAt: string;
  skus: SKU[];
  baseUnit?: Unit;
  entryUnit?: Unit;
  storageUnit?: Unit;
  pickingUnit?: Unit;
  altPickingUnit?: Unit;
}

interface SKU {
  id: string;
  ean?: string;
  unitId: string;
  conversionFactor: number;
  brand?: string;
  color?: string;
  size?: string;
  weightKg?: number;
  volumeM3?: number;
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
  standardPallet?: string;
  standardBox?: string;
  maxHeightCm?: number;
  palletizing?: number;
  lastro?: number;
  recipientType?: string;
  allowBarcodeZero: boolean;
  allowConsignated: boolean;
  allowOverlap: boolean;
  allowTumble: boolean;
  createdAt: string;
  updatedAt: string;
  unit: Unit;
}

const ProductMaintenancePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSku, setEditingSku] = useState<SKU | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.get<Product[]>('/products');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCreateSku = (_productId: string) => {
    setEditingSku(null);
    setIsSkuModalOpen(true);
  };

  const handleEditSku = (sku: SKU, _product: Product) => {
    setEditingSku(sku);
    setIsSkuModalOpen(true);
  };

  const handleProductModalClose = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh list
  };

  const handleSkuModalClose = () => {
    setIsSkuModalOpen(false);
    setEditingSku(null);
    fetchProducts(); // Refresh list
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Manutenção de Produtos</h1>
        <button className="btn btn-primary" onClick={handleCreateProduct}>
          Novo Produto
        </button>
      </header>

      <div className="section">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Depositante</th>
              <th>Fornecedor</th>
              <th>Tipo</th>
              <th>SKUs</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <React.Fragment key={product.id}>
                <tr>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.depositor || '-'}</td>
                  <td>{product.supplier || '-'}</td>
                  <td>{product.productType || '-'}</td>
                  <td>{product.skus.length}</td>
                  <td>
                    <button onClick={() => handleEditProduct(product)}>Editar</button>
                    <button onClick={() => handleCreateSku(product.id)}>Novo SKU</button>
                  </td>
                </tr>
                {product.skus.map((sku) => (
                  <tr key={sku.id} style={{ backgroundColor: '#f5f5f5' }}>
                    <td style={{ paddingLeft: '24px' }}>- SKU: {sku.ean || '-'}</td>
                    <td colSpan={3}>
                      {sku.brand} {sku.color} {sku.size}
                    </td>
                    <td>{sku.unit.abbreviation}</td>
                    <td>{sku.conversionFactor}</td>
                    <td>
                      <button onClick={() => handleEditSku(sku, product)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isProductModalOpen}
        onClose={handleProductModalClose}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        <ProductForm
          product={editingProduct}
          onSave={handleProductModalClose}
          onCancel={handleProductModalClose}
        />
      </Modal>

      <Modal
        isOpen={isSkuModalOpen}
        onClose={handleSkuModalClose}
        title={editingSku ? 'Editar SKU' : 'Novo SKU'}
      >
        <div>
          <p>Formulário de SKU será implementado em seguida...</p>
          <button onClick={handleSkuModalClose}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductMaintenancePage;
