import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ToastContext } from '../contexts/ToastContext';
import { validateProduct, hasErrors } from '../utils/validators';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '../utils/constants';
import Button, { ButtonGroup } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './ProductFormPage.module.css';

const emptyForm = {
  name: '',
  description: '',
  category_id: '',
  buying_price: 0,
  selling_price: 0,
  quantity: 0,
  low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
  brand_name: '',
  image_url: '',
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createProduct, updateProduct, getProduct } = useProducts();
  const { categories } = useCategories();
  const { addToast } = useContext(ToastContext);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await getProduct(id);
      if (error || !data) {
        addToast('Product not found', 'error');
        navigate('/products');
        return;
      }
      setForm({
        name: data.name,
        description: data.description || '',
        category_id: data.category_id || '',
        buying_price: Number(data.buying_price),
        selling_price: Number(data.selling_price),
        quantity: data.quantity,
        low_stock_threshold: data.low_stock_threshold,
        brand_name: data.brand_name || '',
        image_url: data.image_url || '',
      });
      setLoadingProduct(false);
    })();
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateProduct(form);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category_id: form.category_id || null,
      buying_price: form.buying_price,
      selling_price: form.selling_price,
      quantity: Math.floor(form.quantity),
      low_stock_threshold: Math.floor(form.low_stock_threshold),
      brand_name: form.brand_name.trim(),
      image_url: form.image_url.trim() || null,
    };

    setSubmitting(true);
    let result;
    if (isEdit) {
      result = await updateProduct(id, payload);
    } else {
      result = await createProduct(payload);
    }
    setSubmitting(false);

    if (result.error) {
      addToast(result.error.message, 'error');
    } else {
      addToast(isEdit ? 'Product updated' : 'Product created', 'success');
      navigate('/products');
    }
  }

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

  if (loadingProduct) return <PageSpinner />;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <Input
            label="Product Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            autoFocus
          />
          <Input
            label="Brand Name"
            name="brand_name"
            value={form.brand_name}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Description"
          name="description"
          type="textarea"
          value={form.description}
          onChange={handleChange}
        />

        <div className={styles.grid}>
          <Select
            label="Category"
            name="category_id"
            options={categoryOptions}
            placeholder="No Category"
            value={form.category_id}
            onChange={handleChange}
          />
        </div>

        <div className={styles.grid}>
          <Input
            label="Buying Price (₹)"
            name="buying_price"
            type="number"
            min="0"
            step="0.01"
            value={form.buying_price}
            onChange={handleChange}
            error={errors.buying_price}
          />
          <Input
            label="Selling Price (₹)"
            name="selling_price"
            type="number"
            min="0"
            step="0.01"
            value={form.selling_price}
            onChange={handleChange}
            error={errors.selling_price}
          />
        </div>

        <div className={styles.grid}>
          <Input
            label="Current Quantity"
            name="quantity"
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={handleChange}
            error={errors.quantity}
          />
          <Input
            label="Low Stock Threshold"
            name="low_stock_threshold"
            type="number"
            min="0"
            step="1"
            value={form.low_stock_threshold}
            onChange={handleChange}
            error={errors.low_stock_threshold}
          />
        </div>

        <Input
          label="Image URL (optional)"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />

        {form.image_url && (
          <div className={styles.preview}>
            <img
              src={form.image_url}
              alt="Preview"
              className={styles.previewImg}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <ButtonGroup>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </div>
  );
}
