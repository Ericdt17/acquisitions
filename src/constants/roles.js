export const ROLE_USER = 'user';
export const ROLE_ADMIN = 'admin';
export const ROLE_SUPER_ADMIN = 'super_admin';

/** Roles allowed on public signup (`super_admin` is never assignable via API). */
export const SIGNUP_ROLES = [ROLE_USER, ROLE_ADMIN];

export const ALL_ROLES = [ROLE_USER, ROLE_ADMIN, ROLE_SUPER_ADMIN];
