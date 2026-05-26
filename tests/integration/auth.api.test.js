require('../setup');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const { getDatabase } = require('../../config/database');
const { seedTestData } = require('../fixtures/seed-data');

describe('Auth API', () => {
  before(async () => {
    getDatabase();
    await seedTestData();
  });

  it('POST /api/v1/auth/login - should return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'test123' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.token).to.be.a('string');
    expect(res.body.data.user).to.have.property('username', 'admin');
  });

  it('POST /api/v1/auth/login - should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'wrong' });

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
  });

  it('GET /api/v1/auth/me - should return profile with valid token', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'test123' });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).to.equal(200);
    expect(res.body.data.username).to.equal('admin');
  });
});
