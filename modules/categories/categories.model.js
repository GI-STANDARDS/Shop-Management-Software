const { getDatabase } = require('../../config/database');

const categoriesModel = {
  findAll() {
    const db = getDatabase();
    return db.prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count
      FROM categories c
      ORDER BY c.name ASC
    `).all();
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  },

  create(data) {
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)'
    ).run(data.name, data.description || null, data.parent_id || null);
    return result.lastInsertRowid;
  },

  update(id, data) {
    const db = getDatabase();
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(data)) {
      if (['name', 'description', 'parent_id', 'is_active'].includes(key)) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length) {
      params.push(id);
      db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    }
  },

  delete(id) {
    const db = getDatabase();
    db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(id);
  },
};

module.exports = categoriesModel;
