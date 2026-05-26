const inventoryModel = require('./inventory.model');
const productsModel = require('../products/products.model');
const { AppError } = require('../../middleware/errorHandler');

module.exports = {
  getStock(productId) {
    const p = productsModel.findById(productId);
    if (!p) throw new AppError('Product not found', 404);
    const stock = inventoryModel.getStock(productId);
    return { product: p, stock: stock || { quantity: 0 } };
  },

  getAllStock(q) { return inventoryModel.getAllStock(q); },

  getMovements(productId, q) {
    const p = productsModel.findById(productId);
    if (!p) throw new AppError('Product not found', 404);
    return inventoryModel.getMovements(productId, q);
  },

  adjust(productId, { quantity, type, notes }, userId) {
    if (quantity === 0) throw new AppError('Quantity must be non-zero', 400);
    const p = productsModel.findById(productId);
    if (!p) throw new AppError('Product not found', 404);

    const current = inventoryModel.getStock(productId);
    const prevQty = current ? current.quantity : 0;

    inventoryModel.addMovement(productId, Math.abs(quantity), type, notes || 'Manual adjustment', userId);
    const updated = inventoryModel.getStock(productId);
    return { product: p, previous_qty: prevQty, new_qty: updated ? updated.quantity : 0, change: Math.abs(quantity), type };
  },

  restock(productId, { quantity, notes }, userId) {
    if (!quantity || quantity <= 0) throw new AppError('Restock quantity must be positive', 400);
    const p = productsModel.findById(productId);
    if (!p) throw new AppError('Product not found', 404);

    const current = inventoryModel.getStock(productId);
    const prevQty = current ? current.quantity : 0;

    inventoryModel.addMovement(productId, quantity, 'restock', notes || 'Restocked', userId);
    const updated = inventoryModel.getStock(productId);
    return { product: p, previous_qty: prevQty, new_qty: updated ? updated.quantity : 0, change: quantity, type: 'restock' };
  },
};
