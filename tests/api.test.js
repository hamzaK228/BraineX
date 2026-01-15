const request = require('supertest');
const app = require('../server');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: `test${Date.now()}@example.com`,
          password: 'Test@123',
          confirmPassword: 'Test@123',
          field: 'Computer Science',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject weak passwords', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        field: 'Computer Science',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@brainex.com',
        password: 'Admin@123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@brainex.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('Scholarships API', () => {
  describe('GET /api/scholarships', () => {
    it('should return list of scholarships', async () => {
      const res = await request(app).get('/api/scholarships');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/scholarships').query({ category: 'graduate' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Security', () => {
  it('should enforce rate limiting', async () => {
    const requests = [];
    for (let i = 0; i < 110; i++) {
      requests.push(request(app).get('/api/scholarships'));
    }

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.some((r) => r.statusCode === 429);

    expect(tooManyRequests).toBe(true);
  });

  it('should require authentication for protected routes', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });
});
