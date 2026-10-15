import { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ToastContext } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/formatters';
import Button, { ButtonGroup } from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import StockBadge from '../components/products/StockBadge';
import QuantityAdjuster from '../components/products/QuantityAdjuster';
import styles from './ProductsPage.module.css';

export default function ProductsPage() {
  const { products, loading, deleteProduct, adjustQuantity } = useProducts();
  const { categories } = useCategories();
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const categoryOptions = useMemo(() =>
    categories.map(c => ({ value: c.id, label: c.name })),
    [categories]
  );

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || (p.brand_name && p.brand_name.toLowerCase().includes(q))
      );
    }
    if (categoryFilter) {
      result = result.filter(p => p.category_id === categoryFilter);
    }
    return result;
  }, [products, search, categoryFilter]);

  async function handleDelete() {
    if (!deleteConfirm) return;
    const { error } = await deleteProduct(deleteConfirm.id);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast(`"${deleteConfirm.name}" deleted`, 'success');
    }
    setDeleteConfirm(null);
  }

  async function handleQuantityAdjust(product, newQty) {
    const { error } = await adjustQuantity(product.id, newQty);
    if (error) addToast(error.message, 'error');
  }

  if (loading) return <PageSpinner />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Products</h1>
        <Button onClick={() => navigate('/products/new')}>+ Add Product</Button>
      </div>

      <div className={styles.filters}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or brand..."
        />
        <Select
          options={categoryOptions}
          placeholder="All Categories"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="&#x1F4E6;"
          title={products.length === 0 ? 'No products yet' : 'No products found'}
          message={products.length === 0
            ? 'Add your first product to get started.'
            : 'Try adjusting your search or filter.'
          }
        >
          {products.length === 0 && (
            <Button onClick={() => navigate('/products/new')}>Add First Product</Button>
          )}
        </EmptyState>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Buying</th>
                <th>Selling</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const margin = Number(p.selling_price) > 0
                  ? (((Number(p.selling_price) - Number(p.buying_price)) / Number(p.selling_price)) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={p.id}>
                    <td className={styles.productName}>
                      <Link to={`/products/${p.id}/edit`}>{p.name}</Link>
                    </td>
                    <td className={styles.brand}>{p.brand_name || '-'}</td>
                    <td className={styles.category}>{p.categories?.name || '-'}</td>
                    <td className={styles.price}>{formatCurrency(p.buying_price)}</td>
                    <td className={styles.price}>{formatCurrency(p.selling_price)}</td>
                    <td className={styles.margin}>{margin}%</td>
                    <td>
                      <StockBadge quantity={p.quantity} threshold={p.low_stock_threshold} />
                    </td>
                    <td>
                      <QuantityAdjuster
                        quantity={p.quantity}
                        onAdjust={(qty) => handleQuantityAdjust(p, qty)}
                      />
                    </td>
                    <td>
                      <ButtonGroup>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${p.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p)}>
                          Delete
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
      >
        <p className={styles.confirmText}>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          This cannot be undone.
        </p>
        <ButtonGroup>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </ButtonGroup>
      </Modal>
    </div>
  );
}
