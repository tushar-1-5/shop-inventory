import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import styles from './LowStockAlerts.module.css';

export default function LowStockAlerts({ products }) {
  const lowStock = products
    .filter(p => p.quantity <= p.low_stock_threshold)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Low Stock Alerts</h3>
      {lowStock.length === 0 ? (
        <p className={styles.empty}>All products are well-stocked</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map(p => (
              <tr key={p.id}>
                <td className={styles.name}>{p.name}</td>
                <td className={styles.brand}>{p.brand_name || '-'}</td>
                <td>
                  <Badge variant={p.quantity === 0 ? 'danger' : 'warning'}>
                    {p.quantity}
                  </Badge>
                </td>
                <td className={styles.threshold}>{p.low_stock_threshold}</td>
                <td>
                  <Link to={`/products/${p.id}/edit`} className={styles.restock}>
                    Restock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
