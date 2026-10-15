import { useState, useEffect, useContext } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { ToastContext } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/formatters';
import StatsCard from '../components/dashboard/StatsCard';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';
import RecentActivity from '../components/dashboard/RecentActivity';
import Button from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import SaleModal from '../components/sales/SaleModal';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { products, loading, fetchProducts } = useProducts();
  const { logSale, getTodayStats } = useSales();
  const { addToast } = useContext(ToastContext);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [todayStats, setTodayStats] = useState({ totalSales: 0, totalRevenue: 0 });

  useEffect(() => {
    getTodayStats().then(setTodayStats);
  }, []);

  async function handleLogSale(saleData) {
    const { error } = await logSale(saleData);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Sale logged successfully', 'success');
      setSaleModalOpen(false);
      fetchProducts();
      getTodayStats().then(setTodayStats);
    }
  }

  if (loading) return <PageSpinner />;

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * Number(p.selling_price), 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Dashboard</h1>
        <Button onClick={() => setSaleModalOpen(true)}>+ Log Sale</Button>
      </div>

      <div className={styles.stats}>
        <StatsCard icon="&#x1F4E6;" label="Total Products" value={totalProducts} />
        <StatsCard icon="&#x26A0;" label="Low Stock" value={lowStockCount} variant="warning" />
        <StatsCard icon="&#x274C;" label="Out of Stock" value={outOfStock} variant="danger" />
        <StatsCard icon="&#x1F4B0;" label="Inventory Value" value={formatCurrency(totalValue)} />
        <StatsCard icon="&#x1F6D2;" label="Today's Sales" value={todayStats.totalSales} variant="success" />
        <StatsCard icon="&#x1F4B5;" label="Today's Revenue" value={formatCurrency(todayStats.totalRevenue)} variant="success" />
      </div>

      <div className={styles.grid}>
        <LowStockAlerts products={products} />
        <RecentActivity />
      </div>

      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        products={products}
        onSubmit={handleLogSale}
      />
    </div>
  );
}
