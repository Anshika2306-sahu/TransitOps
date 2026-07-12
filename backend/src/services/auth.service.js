const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

const {
  findUserByEmail,
  incrementFailedAttempts,
  lockUserAccount,
  resetFailedAttempts,
} = require("../repositories/user.repository");


const loginUser = async (email, password, role) => {

  // Find user
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }


  // Check if account is locked
  if (user.is_locked) {
    throw new Error(
      "Account locked after 5 failed attempts"
    );
  }


  // Check role
  if (user.role !== role) {
    throw new Error(
      "Invalid role selection"
    );
  }


  // Compare password
  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );


  if (!passwordMatch) {

    const attempt =
      await incrementFailedAttempts(user.id);


    if (attempt.failed_attempts >= 5) {

      await lockUserAccount(user.id);

      throw new Error(
        "Account locked after 5 failed attempts"
      );
    }


    throw new Error(
      `Invalid credentials. ${
        5 - attempt.failed_attempts
      } attempts remaining`
    );
  }


  // Reset attempts after successful login
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