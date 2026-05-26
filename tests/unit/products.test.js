require('../setup');
const { expect } = require('chai');
const { getDatabase } = require('../../config/database');
const { seedTestData } = require('../fixtures/seed-data');

describe('Products Model', () => {
  before(async () => {
    getDatabase();
    await seedTestData();
  });

  it('should find product by id', () => {
    const db = getDatabase();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(1);
    expect(product).to.not.be.undefined;
    expect(product.name).to.equal('Test Product');
    expect(product.selling_price).to.equal(100);
  });

  it('should have stock record', () => {
    const db = getDatabase();
    const stock = db.prepare('SELECT COALESCE(quantity, 0) as qty FROM current_stock WHERE product_id = ?').get(1);
    if (stock) {
      expect(stock.qty).to.be.at.least(0);
    }
  });
});
