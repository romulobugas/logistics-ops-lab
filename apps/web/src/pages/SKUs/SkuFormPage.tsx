import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { api } from '../../services/api';

interface FormValues {
  ean: string | null;
  description: string | null;
  unitId: string;
  productId: string;
}

interface Unit {
  id: string;
  name: string;
}

const SkuFormPage = () => {
  const { productId, skuId } = useParams<{ productId: string; skuId: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(skuId);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const unitsData = await api.get<Unit[]>('/units');
      setUnits(unitsData);

      if (isEditing) {
        const skuData = await api.get<FormValues>(`/skus/${skuId}`);
        setValue('ean', skuData.ean);
        setValue('description', skuData.description);
        setValue('unitId', skuData.unitId);
        setValue('productId', skuData.productId);
      }
    };
    fetchData();
  }, [skuId, isEditing, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const payload = { ...data, productId: productId || data.productId };
    try {
      if (isEditing) {
        await api.patch(`/skus/${skuId}`, payload);
      } else {
        await api.post('/skus', payload);
      }
      navigate(productId ? `/products/${productId}` : '/skus');
    } catch (error) {
      console.error('Failed to save SKU', error);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '24px' }}>
        <Link to={productId ? `/products/${productId}` : '/skus'}>Voltar</Link>
        <h1>{isEditing ? 'Editar SKU' : 'Novo SKU'}</h1>
      </header>

      <div className="section">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="login-field">
            <label>EAN</label>
            <input {...register('ean')} />
          </div>
          <div className="login-field">
            <label>Descrição</label>
            <input {...register('description')} />
          </div>
          <div className="login-field">
            <label>Unidade</label>
            <select {...register('unitId', { required: true })}>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {errors.unitId && <span>Este campo é obrigatório</span>}
          </div>
          <button className="btn btn-primary" type="submit">
            {isEditing ? 'Salvar Alterações' : 'Criar SKU'}
          </button>
        </form>
      </div>
    </div>
  );

};

export default SkuFormPage;
