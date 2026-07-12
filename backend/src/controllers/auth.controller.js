const { loginUser } = require("../services/auth.service");


const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

const result = await loginUser(
  email,
  password,
  role
);

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


module.exports = {
  login,
};