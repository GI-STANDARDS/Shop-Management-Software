const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
};

const ROLE_IDS = {
  [ROLES.ADMIN]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.CASHIER]: 3,
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.CASHIER]: 1,
};

// Granular permission definitions
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'products.*', 'categories.*', 'suppliers.*', 'customers.*',
    'inventory.*', 'sales.*', 'purchases.*', 'expenses.*',
    'reports.*', 'dashboard.*', 'users.*', 'settings.*',
    'backup.*', 'activity.*', 'audit.*', 'roles.*',
    'employees.*', 'financial.*',
  ],
  [ROLES.MANAGER]: [
    'products.read', 'products.create', 'products.update',
    'categories.read', 'categories.create', 'categories.update',
    'suppliers.read', 'suppliers.create', 'suppliers.update',
    'customers.*',
    'inventory.read', 'inventory.adjust',
    'sales.*', 'purchases.*', 'expenses.*',
    'reports.read', 'reports.operational',
    'dashboard.read', 'dashboard.analytics',
    'employees.read',
  ],
  [ROLES.CASHIER]: [
    'products.read',
    'customers.read', 'customers.create',
    'sales.create', 'sales.read', 'sales.refund',
    'dashboard.read',
    'inventory.read',
  ],
};

const PERMISSION_LABELS = {
  'products.*': 'Full product management',
  'products.read': 'View products',
  'products.create': 'Add products',
  'products.update': 'Edit products',
  'categories.*': 'Full category management',
  'categories.read': 'View categories',
  'categories.create': 'Add categories',
  'categories.update': 'Edit categories',
  'suppliers.*': 'Full supplier management',
  'suppliers.read': 'View suppliers',
  'suppliers.create': 'Add suppliers',
  'suppliers.update': 'Edit suppliers',
  'customers.*': 'Full customer management',
  'customers.read': 'View customers',
  'customers.create': 'Add customers',
  'inventory.*': 'Full inventory control',
  'inventory.read': 'View stock levels',
  'inventory.adjust': 'Adjust stock',
  'sales.*': 'Full sales management',
  'sales.create': 'Create sales',
  'sales.read': 'View sales',
  'sales.refund': 'Process refunds',
  'purchases.*': 'Full purchase management',
  'expenses.*': 'Full expense management',
  'reports.*': 'All reports',
  'reports.read': 'View reports',
  'reports.operational': 'Operational reports',
  'dashboard.*': 'Full dashboard',
  'dashboard.read': 'View dashboard',
  'dashboard.analytics': 'View analytics',
  'users.*': 'User management',
  'settings.*': 'System settings',
  'backup.*': 'Backup management',
  'activity.*': 'View activity logs',
  'audit.*': 'View audit logs',
  'roles.*': 'Role management',
  'employees.*': 'Employee management',
  'employees.read': 'View employees',
  'financial.*': 'Financial reports',
};

const SALE_STATUS = {
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'mixed'];

const INVENTORY_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
};

const EXPENSE_CATEGORIES = [
  'rent', 'electricity', 'salary', 'maintenance',
  'supplies', 'transport', 'marketing', 'other',
];

const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'products.*', 'categories.*', 'suppliers.*', 'customers.*',
    'inventory.*', 'sales.*', 'purchases.*', 'expenses.*',
    'reports.*', 'dashboard.*', 'users.*', 'settings.*',
    'backup.*', 'activity.*', 'audit.*', 'roles.*',
    'employees.*', 'financial.*',
  ],
  [ROLES.MANAGER]: [
    'products.read', 'products.create', 'products.update',
    'categories.read', 'categories.create', 'categories.update',
    'suppliers.read', 'suppliers.create', 'suppliers.update',
    'customers.*',
    'inventory.read', 'inventory.adjust',
    'sales.*', 'purchases.*', 'expenses.*',
    'reports.read', 'reports.operational',
    'dashboard.read', 'dashboard.analytics',
    'employees.read',
  ],
  [ROLES.CASHIER]: [
    'products.read',
    'customers.read', 'customers.create',
    'sales.create', 'sales.read', 'sales.refund',
    'dashboard.read',
    'inventory.read',
  ],
};

module.exports = {
  ROLES,
  ROLE_IDS,
  ROLE_HIERARCHY,
  PERMISSIONS,
  PERMISSION_LABELS,
  SALE_STATUS,
  PAYMENT_METHODS,
  INVENTORY_TYPES,
  EXPENSE_CATEGORIES,
  DEFAULT_ROLE_PERMISSIONS,
};
