const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

const {
  findUserByEmail,
  incrementFailedAttempts,
  lockUserAccount,
  resetFailedAttempts,
} = require("../repositories/user.repository");

const loginUser = async (email, password, role) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.is_locked) {
    throw new Error("Account locked after 5 failed attempts. Please contact IT.");
  }

  // Bypassing role check for simplicity unless it's strictly required, 
  // but let's keep Anu's logic
  // Wait, if role wasn't passed by frontend, let's just ignore it or use it if provided
  if (role && user.role !== role) {
    throw new Error("Invalid role selection");
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    const attempt = await incrementFailedAttempts(user.id);

    if (attempt.failed_attempts >= 5) {
      await lockUserAccount(user.id);
      throw new Error("Account locked after 5 failed attempts. Please contact IT.");
    }

    throw new Error(`Invalid credentials. ${5 - attempt.failed_attempts} attempts remaining`);
  }

  await resetFailedAttempts(user.id);

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  loginUser,
};
