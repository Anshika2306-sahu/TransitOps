const { loginUser } = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const result = await loginUser(email, password, role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  // Keeping register around just in case we need it, though normally manager creates users
  res.status(501).json({ error: 'Not implemented in this demo' });
};

module.exports = { login, register };
