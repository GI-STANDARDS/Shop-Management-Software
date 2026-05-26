require('../setup');
const { expect } = require('chai');
const { getDatabase } = require('../../config/database');
const { seedTestData } = require('../fixtures/seed-data');

describe('Auth Service', () => {
  before(async () => {
    getDatabase();
    await seedTestData();
  });

  it('should verify user exists in database', () => {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    expect(user).to.not.be.undefined;
    expect(user.full_name).to.equal('Test Admin');
  });

  it('should verify password hash exists', () => {
    const db = getDatabase();
    const user = db.prepare('SELECT password_hash FROM users WHERE username = ?').get('admin');
    expect(user.password_hash).to.not.be.empty;
  });
});
