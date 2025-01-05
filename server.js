require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const emailRoutes = require("./routes/email");
const emailTemplateRoutes = require("./routes/email-routes");

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? [
        "https://iquiz-client.replit.app",
        "http://207.180.235.87:3003", 
        "http://207.180.235.87:5173", 
        "http://localhost:3003",
        "http://localhost:5173",
      ]
    : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use(emailRoutes);
app.use(emailTemplateRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Node environment: ${process.env.NODE_ENV}`);
  console.log(
    "MAILCHIMP_API_KEY:",
    process.env.MAILCHIMP_API_KEY ? "Is set" : "Not set"
  );
});
