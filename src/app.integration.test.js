import request from 'supertest';
import app from './app.js';

describe('app', () => {
  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'OK' });
  });

  it('GET /unknown returns 404 JSON', async () => {
    const res = await request(app).get('/unknown-route').expect(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});
