import { query, withTransaction } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/jwt.js';
import logger from '../utils/logger.js';

/**
 * Register a new user in Neon PostgreSQL with hashed password and role profile
 * 
 * @param {Object} data Registration payload
 * @returns {Promise<Object>} Created user profile
 */
export async function registerUser(data) {
  const {
    email,
    password,
    role,
    full_name,
    institution_name,
    aicte_application_id,
    bank_name,
    branch_name,
    ifsc_code,
    address,
    state,
    phone,
  } = data;

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if user already exists
  const existingRes = await query(
    'SELECT id, email FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (existingRes.rows.length > 0) {
    const error = new Error('An account with this email address already exists. Please log in.');
    error.status = 409;
    throw error;
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  return withTransaction(async (client) => {
    // 3. Insert into users table
    const insertUserSql = `
      INSERT INTO users (
        email, password_hash, full_name, role, institution_name, bank_name, phone, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING id, email, full_name, role, institution_name, bank_name, phone, is_active, created_at;
    `;

    const userRes = await client.query(insertUserSql, [
      normalizedEmail,
      hashedPassword,
      full_name || normalizedEmail.split('@')[0],
      role,
      role === 'institution' ? (institution_name || 'My Institution') : null,
      role === 'bank' ? (bank_name || 'Commercial Bank') : null,
      phone || null,
    ]);

    const user = userRes.rows[0];

    // 4. Role-specific relational record creation
    let institution = null;
    if (user.role === 'institution') {
      const appId = aicte_application_id || `AICTE-1-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const instName = institution_name || user.institution_name || 'Technical Institute';

      const insertInstSql = `
        INSERT INTO institutions (
          user_id, aicte_application_id, institution_name, address, state, contact_email, contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (aicte_application_id) DO UPDATE SET
          institution_name = EXCLUDED.institution_name,
          address = COALESCE(EXCLUDED.address, institutions.address),
          state = COALESCE(EXCLUDED.state, institutions.state)
        RETURNING id, user_id, aicte_application_id, institution_name, address, state, contact_email, contact_phone;
      `;

      const instRes = await client.query(insertInstSql, [
        user.id,
        appId,
        instName,
        address || 'Campus Address',
        state || 'Delhi',
        user.email,
        phone || null,
      ]);

      institution = instRes.rows[0];
    }

    let bank = null;
    if (user.role === 'bank') {
      const bName = bank_name || user.bank_name || 'Commercial Bank';
      const bBranch = branch_name || 'Main Branch';
      const bIfsc = ifsc_code || 'BANK0001234';

      const insertBankSql = `
        INSERT INTO banks (user_id, bank_name, branch_name, ifsc_code)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, bank_name, branch_name, ifsc_code;
      `;
      const bankRes = await client.query(insertBankSql, [user.id, bName, bBranch, bIfsc]);
      bank = bankRes.rows[0];
    }

    logger.info('User successfully registered in Neon PostgreSQL', {
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      ...user,
      institution_id: institution ? institution.id : null,
      aicte_application_id: institution ? institution.aicte_application_id : null,
      bank_id: bank ? bank.id : null,
      branch_name: bank ? bank.branch_name : null,
      ifsc_code: bank ? bank.ifsc_code : null,
      institution,
      bank,
    };
  });
}

/**
 * Authenticate user with email and password from Neon PostgreSQL
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User profile if credentials match
 */
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const userSql = `
    SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.institution_name, u.bank_name, u.phone, u.is_active,
           i.id as institution_id, i.aicte_application_id,
           b.id as bank_id, b.branch_name, b.ifsc_code
    FROM users u
    LEFT JOIN institutions i ON i.user_id = u.id
    LEFT JOIN banks b ON b.user_id = u.id
    WHERE LOWER(u.email) = $1
    LIMIT 1;
  `;

  const res = await query(userSql, [normalizedEmail]);
  const user = res.rows[0];

  if (!user) {
    const error = new Error('Invalid email or password. Please verify your credentials.');
    error.status = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('Your account has been deactivated. Please contact AICTE Administrator.');
    error.status = 403;
    throw error;
  }

  if (!user.password_hash) {
    const error = new Error('Account password not configured in database. Please register or reset password.');
    error.status = 401;
    throw error;
  }

  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    const error = new Error('Invalid email or password. Please verify your credentials.');
    error.status = 401;
    throw error;
  }

  // Remove password_hash from return payload
  const { password_hash, ...safeUser } = user;
  logger.info('User successfully authenticated via Neon PostgreSQL', { userId: safeUser.id, role: safeUser.role });
  return safeUser;
}

/**
 * Get user profile by ID
 * @param {string} userId 
 */
export async function getUserById(userId) {
  const sql = `
    SELECT u.id, u.email, u.full_name, u.role, u.institution_name, u.bank_name, u.phone, u.is_active,
           i.id as institution_id, i.aicte_application_id,
           b.id as bank_id, b.branch_name, b.ifsc_code
    FROM users u
    LEFT JOIN institutions i ON i.user_id = u.id
    LEFT JOIN banks b ON b.user_id = u.id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [userId]);
  return res.rows[0] || null;
}

/**
 * Synchronize legacy Firebase user into PostgreSQL (backward compatibility bridge)
 */
export async function syncUserProfile(firebaseUser, profile) {
  const { uid, email } = firebaseUser;
  const {
    role,
    full_name,
    institution_name,
    aicte_application_id,
    bank_name,
    branch_name,
    ifsc_code,
    address,
    state,
    phone,
  } = profile;

  return withTransaction(async (client) => {
    const upsertUserSql = `
      INSERT INTO users (
        firebase_uid, email, full_name, role, institution_name, bank_name, phone, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      ON CONFLICT (email) 
      DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        role = COALESCE(users.role, EXCLUDED.role),
        institution_name = COALESCE(EXCLUDED.institution_name, users.institution_name),
        bank_name = COALESCE(EXCLUDED.bank_name, users.bank_name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, firebase_uid, email, full_name, role, institution_name, bank_name, phone, is_active, created_at;
    `;

    const userRes = await client.query(upsertUserSql, [
      uid,
      email || `${uid}@tracktitans.local`,
      full_name || 'Authorized User',
      role,
      institution_name || null,
      bank_name || null,
      phone || null,
    ]);

    const user = userRes.rows[0];
    return user;
  });
}

export default {
  registerUser,
  loginUser,
  getUserById,
  syncUserProfile,
};
