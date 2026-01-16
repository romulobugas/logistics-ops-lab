import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { api } from '../../services/api';

interface FormValues {
  code: string;
  description: string;
  productGroupId: string | null;
  storageGroupId: string | null;
}

interface ProductGroup {
  id: string;
  name: string;
}

interface StorageGroup {
  id: string;
  name: string;
}

const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [storageGroups, setStorageGroups] = useState<StorageGroup[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [pgData, sgData] = await Promise.all([
        api.get<ProductGroup[]>('/product-groups'),
        api.get<StorageGroup[]>('/storage-groups'),
      ]);
      setProductGroups(pgData);
      setStorageGroups(sgData);

      if (isEditing) {
        const productData = await api.get<FormValues>(`/products/${id}`);
        setValue('code', productData.code);
        setValue('description', productData.description);
        setValue('productGroupId', productData.productGroupId);
        setValue('storageGroupId', productData.storageGroupId);
      }
    };
    fetchData();
  }, [id, isEditing, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      if (isEditing) {
        await api.patch(`/products/${id}`, data);
      } else {
        await api.post('/products', data);
      }
      navigate('/products');
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <Link to="/products">Voltar para Produtos</Link>
        <h1>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
      </header>

      <div className="section">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="login-field">
            <label>Código</label>
            <input {...register('code', { required: true })} />
            {errors.code && <span>Este campo é obrigatório</span>}
          </div>
          <div className="login-field">
            <label>Descrição</label>
            <input {...register('description', { required: true })} />
            {errors.description && <span>Este campo é obrigatório</span>}
          </div>
          <div className="login-field">
            <label>Grupo de Produto</label>
            <select {...register('productGroupId')}>
              <option value="">Nenhum</option>
              {productGroups.map(pg => <option key={pg.id} value={pg.id}>{pg.name}</option>)}
            </select>
          </div>
          <div className="login-field">
            <label>Grupo de Armazenagem</label>
            <select {...register('storageGroupId')}>
              <option value="">Nenhum</option>
              {storageGroups.map(sg => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;
