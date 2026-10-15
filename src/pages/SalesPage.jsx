import { useState, useEffect, useContext } from 'react';
import { useSales } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';
import { ToastContext } from '../contexts/ToastContext';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import SaleModal from '../components/sales/SaleModal';
import styles from './SalesPage.module.css';

export default function SalesPage() {
  const { sales, loading, hasMore, fetchSales, loadMore, logSale } = useSales();
  const { products, fetchProducts } = useProducts();
  const { addToast } = useContext(ToastContext);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productId: '',
  });

  useEffect(() => {
    fetchSales(filters, true);
  }, []);

  const productOptions = products.map(p => ({ value: p.id, label: p.name }));

  function handleFilterChange(e) {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function applyFilters() {
    fetchSales(filters, true);
  }

  function clearFilters() {
    const cleared = { startDate: '', endDate: '', productId: '' };
    setFilters(cleared);
    fetchSales(cleared, true);
  }

  async function handleLogSale(saleData) {
    const { error } = await logSale(saleData);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Sale logged successfully', 'success');
      setSaleModalOpen(false);
      fetchSales(filters, true);
      fetchProducts();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Sales</h1>
        <Button onClick={() => setSaleModalOpen(true)}>+ Log Sale</Button>
      </div>

      <div className={styles.filters}>
        <Input
          label="From"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <Input
          label="To"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <Select
          label="Product"
          name="productId"
          options={productOptions}
          placeholder="All Products"
          value={filters.productId}
          onChange={handleFilterChange}
        />
        <div className={styles.filterActions}>
          <Button size="sm" onClick={applyFilters}>Apply</Button>
          <Button size="sm" variant="secondary" onClick={clearFilters}>Clear</Button>
        </div>
      </div>

      {loading && sales.length === 0 ? (
        <PageSpinner />
      ) : sales.length === 0 ? (
        <EmptyState
          icon="&#x1F4B0;"
          title="No sales yet"
          message="Log your first sale to start tracking revenue."
        >
          <Button onClick={() => setSaleModalOpen(true)}>Log First Sale</Button>
        </EmptyState>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Sold By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td className={styles.productName}>{s.products?.name || '-'}</td>
                    <td className={styles.brand}>{s.products?.brand_name || '-'}</td>
                    <td className={styles.qty}>{s.quantity}</td>
                    <td className={styles.price}>{formatCurrency(s.unit_price)}</td>
                    <td className={styles.price}><strong>{formatCurrency(s.total)}</strong></td>
                    <td className={styles.user}>{s.profiles?.display_name || '-'}</td>
                    <td className={styles.date} title={formatDate(s.sold_at)}>
                      {formatRelativeTime(s.sold_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className={styles.loadMore}>
              <Button variant="secondary" onClick={() => loadMore(filters)} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}

      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        products={products}
        onSubmit={handleLogSale}
      />
    </div>
  );
}
