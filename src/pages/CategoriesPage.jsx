import { useState, useContext } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ToastContext } from '../contexts/ToastContext';
import { validateCategory, hasErrors } from '../utils/validators';
import { formatDate } from '../utils/formatters';
import Button, { ButtonGroup } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts();
  const { addToast } = useContext(ToastContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function getProductCount(categoryId) {
    return products.filter(p => p.category_id === categoryId).length;
  }

  function openAdd() {
    setEditingId(null);
    setForm({ name: '', description: '' });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateCategory(form);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    let result;
    if (editingId) {
      result = await updateCategory(editingId, { name: form.name.trim(), description: form.description.trim() });
    } else {
      result = await createCategory(form.name.trim(), form.description.trim());
    }
    setSubmitting(false);

    if (result.error) {
      if (result.error.message?.includes('duplicate')) {
        setErrors({ name: 'A category with this name already exists' });
      } else {
        addToast(result.error.message, 'error');
      }
    } else {
      addToast(editingId ? 'Category updated' : 'Category created', 'success');
      setModalOpen(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    const { error } = await deleteCategory(deleteConfirm.id);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Category deleted', 'success');
    }
    setDeleteConfirm(null);
  }

  if (loading) return <PageSpinner />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Categories</h1>
        <Button onClick={openAdd}>+ Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon="&#x1F3F7;"
          title="No categories yet"
          message="Create categories to organize your products."
        >
          <Button onClick={openAdd}>Create First Category</Button>
        </EmptyState>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td className={styles.name}>{cat.name}</td>
                  <td className={styles.desc}>{cat.description || '-'}</td>
                  <td>{getProductCount(cat.id)}</td>
                  <td className={styles.date}>{formatDate(cat.created_at)}</td>
                  <td>
                    <ButtonGroup>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(cat)}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors({}); }}
            error={errors.name}
            autoFocus
          />
          <Input
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <ButtonGroup>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </ButtonGroup>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
      >
        <p className={styles.confirmText}>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          {getProductCount(deleteConfirm?.id) > 0 && (
            <> This category has {getProductCount(deleteConfirm?.id)} product(s) that will become uncategorized.</>
          )}
        </p>
        <ButtonGroup>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </ButtonGroup>
      </Modal>
    </div>
  );
}
