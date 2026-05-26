const salesModel = require('./sales.model');
const productsModel = require('../products/products.model');
const customersModel = require('../customers/customers.model');
const { AppError } = require('../../middleware/errorHandler');

function generateInvoiceNumber() {
  const last = salesModel.getLastInvoiceNumber();
  const date = new Date();
  const ds = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  let seq = 1;
  if (last) {
    const parts = last.split('-');
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `INV-${ds}-${String(seq).padStart(4, '0')}`;
}

module.exports = {
  list(q) { return salesModel.findAll(q); },

  getById(id) {
    const sale = salesModel.findById(id);
    if (!sale) throw new AppError('Sale not found', 404);
    return sale;
  },

  create(saleData, userId) {
    const items = saleData.items;
    if (!items || items.length === 0) {
      throw new AppError('Sale must have at least one item', 400);
    }

    let subtotal = 0, taxTotal = 0, discountTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = productsModel.findById(item.product_id);
      if (!product) throw new AppError(`Product ${item.product_id} not found`, 404);
      if (!product.is_active) throw new AppError(`Product ${product.name} is inactive`, 400);

      const stock = productsModel.getLowStock().find(p => p.id === product.id);
      // Better: check current stock
      const { getDatabase } = require('../../config/database');
      const db = getDatabase();
      const currentStock = db.prepare('SELECT COALESCE(quantity, 0) as qty FROM current_stock WHERE product_id = ?').get(product.id);
      const available = currentStock ? currentStock.qty : 0;
      if (available < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}. Available: ${available}`, 422, 'INSUFFICIENT_STOCK');
      }

      const unitPrice = item.unit_price || product.selling_price;
      const lineTotal = unitPrice * item.quantity;
      const lineTax = lineTotal * (product.tax_rate / 100);
      const lineDiscount = lineTotal * (product.discount_rate / 100);
      const finalTotal = lineTotal + lineTax - lineDiscount;

      subtotal += lineTotal;
      taxTotal += lineTax;
      discountTotal += lineDiscount;

      processedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        cost_price: product.cost_price,
        tax_amount: lineTax,
        discount_amount: lineDiscount,
        total: finalTotal,
      });
    }

    const grandTotal = subtotal + taxTotal - discountTotal;
    const changeAmount = Math.max(0, (saleData.amount_paid || grandTotal) - grandTotal);

    const salePayload = {
      invoice_number: generateInvoiceNumber(),
      customer_id: saleData.customer_id || null,
      user_id: userId,
      subtotal,
      tax_total: taxTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
      amount_paid: saleData.amount_paid || grandTotal,
      change_amount: changeAmount,
      payment_method: saleData.payment_method || 'cash',
      notes: saleData.notes || null,
    };

    return salesModel.create(salePayload, processedItems);
  },

  refund(saleId) {
    const result = salesModel.refund(saleId);
    if (!result) throw new AppError('Sale not found or already refunded', 400);
    return result;
  },

  getTodaySummary() { return salesModel.getTodaySummary(); },
};
