import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button, { ButtonGroup } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import styles from './SaleModal.module.css';

export default function SaleModal({ isOpen, onClose, products, onSubmit }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProductId('');
      setQuantity(1);
      setError('');
    }
  }, [isOpen]);

  const selectedProduct = products.find(p => p.id === productId);
  const total = selectedProduct ? quantity * Number(selectedProduct.selling_price) : 0;
  const maxQty = selectedProduct ? selectedProduct.quantity : 0;

  const productOptions = products
    .filter(p => p.quantity > 0)
    .map(p => ({
      value: p.id,
      label: `${p.name}${p.brand_name ? ` (${p.brand_name})` : ''} — ${p.quantity} in stock`,
    }));

  async function handleSubmit(e) {
    e.preventDefault();

    if (!productId) {
      setError('Select a product');
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    if (quantity > maxQty) {
      setError(`Only ${maxQty} in stock`);
      return;
    }

    setSubmitting(true);
    await onSubmit({
      product_id: productId,
      quantity,
      selling_price: Number(selectedProduct.selling_price),
    });
    setSubmitting(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Sale">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Select
          label="Product"
          options={productOptions}
          placeholder="Select a product..."
          value={productId}
          onChange={e => { setProductId(e.target.value); setError(''); }}
        />

        {selectedProduct && (
          <>
            <div className={styles.productInfo}>
              <span>Price: {formatCurrency(selectedProduct.selling_price)}</span>
              <span>In stock: {selectedProduct.quantity}</span>
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              max={maxQty}
              value={quantity}
              onChange={e => { setQuantity(Number(e.target.value)); setError(''); }}
            />

            <div className={styles.total}>
              Total: <strong>{formatCurrency(total)}</strong>
            </div>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <ButtonGroup>
          <Button type="submit" disabled={submitting || !productId}>
            {submitting ? 'Logging...' : 'Log Sale'}
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
}
