export const ACTION_TYPES = {
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  QUANTITY_CHANGED: 'quantity_changed',
  PRODUCT_DELETED: 'product_deleted',
  CATEGORY_CREATED: 'category_created',
  CATEGORY_UPDATED: 'category_updated',
  CATEGORY_DELETED: 'category_deleted',
  SALE_LOGGED: 'sale_logged',
};

export const ACTION_LABELS = {
  product_created: 'Product Created',
  product_updated: 'Product Updated',
  quantity_changed: 'Quantity Changed',
  product_deleted: 'Product Deleted',
  category_created: 'Category Created',
  category_updated: 'Category Updated',
  category_deleted: 'Category Deleted',
  sale_logged: 'Sale Logged',
};

export const ENTITY_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  PRODUCTS: '/products',
  PRODUCT_NEW: '/products/new',
  PRODUCT_EDIT: '/products/:id/edit',
  CATEGORIES: '/categories',
  ACTIVITY: '/activity',
};

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
export const ACTIVITY_PAGE_SIZE = 50;
