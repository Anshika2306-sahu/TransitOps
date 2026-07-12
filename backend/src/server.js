const express = require("express");
const pool = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      message: "TransitOps backend running",
      databaseTime: result.rows[0].now,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});