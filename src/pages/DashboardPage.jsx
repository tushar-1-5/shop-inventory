import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/formatters';
import StatsCard from '../components/dashboard/StatsCard';
import LowStockAlerts from '../components/dashboard/LowStockAlerts';
import RecentActivity from '../components/dashboard/RecentActivity';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { products, loading } = useProducts();

  if (loading) return <PageSpinner />;

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * Number(p.selling_price), 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>

      <div className={styles.stats}>
        <StatsCard icon="&#x1F4E6;" label="Total Products" value={totalProducts} />
        <StatsCard icon="&#x26A0;" label="Low Stock" value={lowStockCount} variant="warning" />
        <StatsCard icon="&#x274C;" label="Out of Stock" value={outOfStock} variant="danger" />
        <StatsCard icon="&#x1F4B0;" label="Inventory Value" value={formatCurrency(totalValue)} />
      </div>

      <div className={styles.grid}>
        <LowStockAlerts products={products} />
        <RecentActivity />
      </div>
    </div>
  );
}
