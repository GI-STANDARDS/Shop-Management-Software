const purchasesModel = require('./purchases.model');
const { AppError } = require('../../middleware/errorHandler');

function generatePurchaseNumber() {
  const date = new Date();
  return `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Date.now() % 10000}`;
}

module.exports = {
  list(q) { return purchasesModel.findAll(q); },
  getById(id) { const p = purchasesModel.findById(id); if (!p) throw new AppError('Purchase not found', 404); return p; },
  create(data, userId) {
    const items = data.items;
    if (!items || items.length === 0) throw new AppError('At least one item required', 400);
    let subtotal = 0;
    const processed = items.map(item => {
      const total = item.unit_cost * item.quantity;
      subtotal += total;
      return { product_id: item.product_id, quantity: item.quantity, unit_cost: item.unit_cost, total };
    });
    data.purchase_number = generatePurchaseNumber();
    data.user_id = userId;
    data.subtotal = subtotal;
    data.grand_total = subtotal + (data.tax_total || 0);
    return purchasesModel.create(data, processed);
  },
};
