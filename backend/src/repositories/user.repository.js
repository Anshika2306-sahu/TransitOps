const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};


const incrementFailedAttempts = async (userId) => {
  const query = `
    UPDATE users
    SET failed_attempts = failed_attempts + 1
    WHERE id = $1
    RETURNING failed_attempts;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};


const lockUserAccount = async (userId) => {
  const query = `
    UPDATE users
    SET is_locked = TRUE
    WHERE id = $1;
  `;

  await pool.query(query, [userId]);
};


const resetFailedAttempts = async (userId) => {
  const query = `
    UPDATE users
    SET failed_attempts = 0
    WHERE id = $1;
  `;

  await pool.query(query, [userId]);
};


module.exports = {
  findUserByEmail,
  incrementFailedAttempts,
  lockUserAccount,
  resetFailedAttempts,
};