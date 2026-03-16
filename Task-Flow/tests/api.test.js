const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

process.env.JWT_SECRET = 'test_secret_key';

let mongod;
let token;
let taskId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
});

describe('Auth Endpoints', () => {
  it('POST /api/auth/register — creates a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('POST /api/auth/register — rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'password123',
    });
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/login — returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login — rejects bad credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/profile — returns user profile', async () => {
    const res = await request(app).get('/api/auth/profile')
                                  .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('test@example.com');
  });
});

describe('Task Endpoints', () => {
  it('POST /api/tasks — creates a task', async () => {
    const res = await request(app).post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Build REST API', priority: 'high', tags: ['backend'] });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.task.title).toBe('Build REST API');
    taskId = res.body.data.task._id;
  });

  it('GET /api/tasks — lists tasks with pagination', async () => {
    const res = await request(app).get('/api/tasks')
                                  .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.tasks.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('GET /api/tasks — filters by status', async () => {
    const res = await request(app).get('/api/tasks?status=todo')
                                  .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    res.body.data.tasks.forEach(t => expect(t.status).toBe('todo'));
  });

  it('GET /api/tasks/:id — gets a single task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`)
                                  .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.task._id).toBe(taskId);
  });

  it('PUT /api/tasks/:id — updates a task', async () => {
    const res = await request(app).put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Build REST API', status: 'in_progress' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.status).toBe('in_progress');
  });

  it('GET /api/tasks/stats — returns aggregated stats', async () => {
    const res = await request(app).get('/api/tasks/stats')
                                  .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stats.byStatus).toBeDefined();
    expect(res.body.data.stats.byPriority).toBeDefined();
  });

  it('DELETE /api/tasks/:id — deletes a task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`)
                                  .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/tasks — requires authentication', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });
});
