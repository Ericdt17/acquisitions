import request from 'supertest';
import { eq, inArray } from 'drizzle-orm';
import app from './app.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from '#constants/roles.js';

const hasDb = Boolean(process.env.DATABASE_URL);
const describeUsers = hasDb ? describe : describe.skip;

describeUsers('API /api/users (integration)', () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const adminEmail = `users-it-admin-${suffix}@example.com`;
  const memberEmail = `users-it-member-${suffix}@example.com`;
  const password = 'password123';

  let agent;
  let memberId;

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'IT Admin',
        email: adminEmail,
        password,
        role: 'user',
      })
      .expect(201);

    await db.update(users).set({ role: ROLE_ADMIN }).where(eq(users.email, adminEmail));

    agent = request.agent(app);
    await agent.post('/api/auth/signin').send({ email: adminEmail, password }).expect(200);
  });

  afterAll(async () => {
    const emails = [adminEmail, memberEmail];
    await db.delete(users).where(inArray(users.email, emails));
  });

  it('GET /api/users without auth returns 401', async () => {
    await request(app).get('/api/users').expect(401);
  });

  it('GET /api/users returns 200 and a users array', async () => {
    const res = await agent.get('/api/users').expect(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.some((u) => u.email === adminEmail)).toBe(true);
  });

  it('POST /api/users creates a user', async () => {
    const res = await agent
      .post('/api/users')
      .send({
        name: 'IT Member',
        email: memberEmail,
        password,
        role: 'user',
      })
      .expect(201);

    expect(res.body.user).toMatchObject({
      name: 'IT Member',
      email: memberEmail,
      role: 'user',
    });
    expect(res.body.user.id).toBeDefined();
    memberId = res.body.user.id;
  });

  it('GET /api/users/:id returns the user', async () => {
    const res = await agent.get(`/api/users/${memberId}`).expect(200);
    expect(res.body.user).toMatchObject({
      id: memberId,
      email: memberEmail,
      role: 'user',
    });
  });

  it('PATCH /api/users/:id updates the user', async () => {
    const res = await agent
      .patch(`/api/users/${memberId}`)
      .send({ name: 'IT Member Updated' })
      .expect(200);

    expect(res.body.user.name).toBe('IT Member Updated');
  });

  it('POST /api/users with super_admin as non-super_admin returns 403', async () => {
    const extra = `users-it-extra-${Date.now()}@example.com`;
    const res = await agent
      .post('/api/users')
      .send({
        name: 'No Super',
        email: extra,
        password,
        role: ROLE_SUPER_ADMIN,
      })
      .expect(403);

    expect(res.body.error).toBe('Forbidden');

    await db.delete(users).where(eq(users.email, extra));
  });

  it('DELETE /api/users/:id removes the user', async () => {
    await agent.delete(`/api/users/${memberId}`).expect(200);
    await agent.get(`/api/users/${memberId}`).expect(404);
    memberId = undefined;
  });

  it('DELETE /api/users/:id for self returns 400', async () => {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail));
    await agent.delete(`/api/users/${row.id}`).expect(400);
  });
});
