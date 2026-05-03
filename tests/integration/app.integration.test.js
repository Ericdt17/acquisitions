import request from 'supertest';
import app from '#src/app.js';
import { API_BASE_PATH, API_VERSION } from '#constants/api.js';

describe('app', () => {
  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'OK' });
  });

  it('GET /api/v1/health returns OK with version', async () => {
    const res = await request(app).get(`${API_BASE_PATH}/health`).expect(200);
    expect(res.body).toMatchObject({ status: 'OK', version: API_VERSION });
  });

  it('GET /api documents versioned base path', async () => {
    const res = await request(app).get('/api').expect(200);
    expect(res.body).toMatchObject({
      version: API_VERSION,
      basePath: API_BASE_PATH,
    });
  });

  it('GET /unknown returns 404 JSON', async () => {
    const res = await request(app).get('/unknown-route').expect(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});
