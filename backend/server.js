const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home API
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/", (req, res) => {
  res.json({
    message: "PrimePC API"
  });
});

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});