const { getDb } = require('../db');

const findUserByEmail = async (email) => {
  const db = await getDb();
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0];
};

const incrementFailedAttempts = async (userId) => {
  const db = await getDb();
  const query = `
    UPDATE users
    SET failed_attempts = failed_attempts + 1
    WHERE id = $1
    RETURNING failed_attempts;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

const lockUserAccount = async (userId) => {
  const db = await getDb();
  const query = `
    UPDATE users
    SET is_locked = TRUE
    WHERE id = $1;
  `;
  await db.query(query, [userId]);
};

const resetFailedAttempts = async (userId) => {
  const db = await getDb();
  const query = `
    UPDATE users
    SET failed_attempts = 0, is_locked = FALSE
    WHERE id = $1;
  `;
  await db.query(query, [userId]);
};

module.exports = {
  findUserByEmail,
  incrementFailedAttempts,
  lockUserAccount,
  resetFailedAttempts,
};
