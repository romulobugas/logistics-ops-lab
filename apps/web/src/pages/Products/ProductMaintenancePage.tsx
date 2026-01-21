import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';
import '../../styles/product-maintenance.css';

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
    <div className="product-maintenance">
      <header className="product-maintenance-header">
        <div>
          <h1>Manutenção de Produtos</h1>
          <p style={{ color: '#64748b', marginTop: 6 }}>
            Cadastre produtos, gerencie SKUs e acompanhe as unidades associadas.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateProduct}>
          Novo Produto
        </button>
      </header>

      <div className="section table-container">
        <table className="table">
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
            {!products.length ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  Nenhum produto cadastrado ainda. Clique em “Novo Produto” para começar.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <React.Fragment key={product.id}>
                  <tr>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{product.depositor || '-'}</td>
                    <td>{product.supplier || '-'}</td>
                    <td>{product.productType || '-'}</td>
                    <td>
                      <span className="sku-count">{product.skus.length}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="table-action" onClick={() => handleEditProduct(product)}>
                          Editar
                        </button>
                        <button className="table-action secondary" onClick={() => handleCreateSku(product.id)}>
                          Novo SKU
                        </button>
                      </div>
                    </td>
                  </tr>
                  {product.skus.map((sku) => (
                    <tr key={sku.id} className="sku-row">
                      <td>
                        <span className="sku-label">SKU</span> {sku.ean || '-'}
                      </td>
                      <td colSpan={3}>
                        {[sku.brand, sku.color, sku.size].filter(Boolean).join(' ') || 'Sem descrição'}
                      </td>
                      <td>{sku.unit.abbreviation}</td>
                      <td>{sku.conversionFactor}</td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action" onClick={() => handleEditSku(sku, product)}>
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
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
