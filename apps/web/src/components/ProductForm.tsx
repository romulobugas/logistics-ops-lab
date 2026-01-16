import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

interface Product {
  id?: string;
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
  productGroupId?: string;
  storageGroupId?: string;
  baseUnitId?: string;
  entryUnitId?: string;
  storageUnitId?: string;
  pickingUnitId?: string;
  altPickingUnitId?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    depositor: '',
    supplier: '',
    productType: '',
    sanitaryClassification: '',
    shelfLifeDays: 0,
    usefulLifeDays: 0,
    quarantineDays: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    isActive: true,
    controlsExpiry: false,
    closedPanel: false,
    showOnEntryNote: false,
    makesOrder: false,
    controlsBatch: false,
    gridSewing: false,
    quarantine: false,
    dynamicPicking: false,
    separationMagnitude: false,
    informExpiryOnCheck: false,
    isProductKit: false,
    specialComposition: false,
  });

  const [units, setUnits] = useState<Unit[]>([]);
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [storageGroups, setStorageGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load reference data
    const loadReferenceData = async () => {
      try {
        const [unitsData, productGroupsData, storageGroupsData] = await Promise.all([
          api.get<Unit[]>('/units'),
          api.get<any[]>('/product-groups'),
          api.get<any[]>('/storage-groups'),
        ]);
        setUnits(unitsData);
        setProductGroups(productGroupsData);
        setStorageGroups(storageGroupsData);
      } catch (error) {
        console.error('Failed to load reference data:', error);
      }
    };

    loadReferenceData();

    // If editing, populate form with product data
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product?.id) {
        await api.patch(`/products/${product.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Erro ao salvar produto. Verifique o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="code">Código *</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code || ''}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Nome *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="depositor">Depositante</label>
          <input
            type="text"
            id="depositor"
            name="depositor"
            value={formData.depositor || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="supplier">Fornecedor</label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="productType">Tipo de Produto</label>
          <input
            type="text"
            id="productType"
            name="productType"
            value={formData.productType || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sanitaryClassification">Classificação Sanitária</label>
          <input
            type="text"
            id="sanitaryClassification"
            name="sanitaryClassification"
            value={formData.sanitaryClassification || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="shelfLifeDays">Shelf Life (dias)</label>
          <input
            type="number"
            id="shelfLifeDays"
            name="shelfLifeDays"
            value={formData.shelfLifeDays || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="usefulLifeDays">Vida Útil (dias)</label>
          <input
            type="number"
            id="usefulLifeDays"
            name="usefulLifeDays"
            value={formData.usefulLifeDays || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="quarantineDays">Dias de Quarentena</label>
          <input
            type="number"
            id="quarantineDays"
            name="quarantineDays"
            value={formData.quarantineDays || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="minStockLevel">Estoque Mínimo</label>
          <input
            type="number"
            id="minStockLevel"
            name="minStockLevel"
            value={formData.minStockLevel || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxStockLevel">Estoque Máximo</label>
          <input
            type="number"
            id="maxStockLevel"
            name="maxStockLevel"
            value={formData.maxStockLevel || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="productGroupId">Grupo de Produtos</label>
          <select
            id="productGroupId"
            name="productGroupId"
            value={formData.productGroupId || ''}
            onChange={handleInputChange}
          >
            <option value="">Selecione...</option>
            {productGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="storageGroupId">Grupo de Armazenamento</label>
          <select
            id="storageGroupId"
            name="storageGroupId"
            value={formData.storageGroupId || ''}
            onChange={handleInputChange}
          >
            <option value="">Selecione...</option>
            {storageGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="baseUnitId">Unidade Base</label>
          <select
            id="baseUnitId"
            name="baseUnitId"
            value={formData.baseUnitId || ''}
            onChange={handleInputChange}
          >
            <option value="">Selecione...</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="entryUnitId">Unidade de Entrada</label>
          <select
            id="entryUnitId"
            name="entryUnitId"
            value={formData.entryUnitId || ''}
            onChange={handleInputChange}
          >
            <option value="">Selecione...</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <h3>Configurações Adicionais</h3>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleInputChange}
              />
              <label htmlFor="isActive">Ativo</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="controlsExpiry"
                name="controlsExpiry"
                checked={formData.controlsExpiry || false}
                onChange={handleInputChange}
              />
              <label htmlFor="controlsExpiry">Controla Validade</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="closedPanel"
                name="closedPanel"
                checked={formData.closedPanel || false}
                onChange={handleInputChange}
              />
              <label htmlFor="closedPanel">Painel Fechado</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="showOnEntryNote"
                name="showOnEntryNote"
                checked={formData.showOnEntryNote || false}
                onChange={handleInputChange}
              />
              <label htmlFor="showOnEntryNote">Exibir na Nota de Entrada</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="makesOrder"
                name="makesOrder"
                checked={formData.makesOrder || false}
                onChange={handleInputChange}
              />
              <label htmlFor="makesOrder">Faz Pedido</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="controlsBatch"
                name="controlsBatch"
                checked={formData.controlsBatch || false}
                onChange={handleInputChange}
              />
              <label htmlFor="controlsBatch">Controla Lote</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="gridSewing"
                name="gridSewing"
                checked={formData.gridSewing || false}
                onChange={handleInputChange}
              />
              <label htmlFor="gridSewing">Costura Grade</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="quarantine"
                name="quarantine"
                checked={formData.quarantine || false}
                onChange={handleInputChange}
              />
              <label htmlFor="quarantine">Quarentena</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="dynamicPicking"
                name="dynamicPicking"
                checked={formData.dynamicPicking || false}
                onChange={handleInputChange}
              />
              <label htmlFor="dynamicPicking">Picking Dinâmico</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="separationMagnitude"
                name="separationMagnitude"
                checked={formData.separationMagnitude || false}
                onChange={handleInputChange}
              />
              <label htmlFor="separationMagnitude">Grandeza na Separação</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="informExpiryOnCheck"
                name="informExpiryOnCheck"
                checked={formData.informExpiryOnCheck || false}
                onChange={handleInputChange}
              />
              <label htmlFor="informExpiryOnCheck">Informar Validade na Conferência</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="isProductKit"
                name="isProductKit"
                checked={formData.isProductKit || false}
                onChange={handleInputChange}
              />
              <label htmlFor="isProductKit">Kit de Produto</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="specialComposition"
                name="specialComposition"
                checked={formData.specialComposition || false}
                onChange={handleInputChange}
              />
              <label htmlFor="specialComposition">Composição Especial</label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
