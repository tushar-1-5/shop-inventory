export function validateProduct(values) {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Product name is required';
  }

  if (values.buying_price < 0) {
    errors.buying_price = 'Buying price cannot be negative';
  }

  if (values.selling_price < 0) {
    errors.selling_price = 'Selling price cannot be negative';
  }

  if (values.quantity < 0) {
    errors.quantity = 'Quantity cannot be negative';
  }

  if (values.low_stock_threshold < 0) {
    errors.low_stock_threshold = 'Threshold cannot be negative';
  }

  return errors;
}

export function validateCategory(values) {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Category name is required';
  }

  return errors;
}

export function validateAuth(values, isRegister = false) {
  const errors = {};

  if (!values.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email format';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (isRegister) {
    if (!values.display_name?.trim()) {
      errors.display_name = 'Display name is required';
    }
    if (values.password !== values.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
