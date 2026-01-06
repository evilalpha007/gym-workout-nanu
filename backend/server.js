require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB, isConnected } = require("./config/db");

// Check required environment variables
if (!process.env.MONGODB_URI) {
  console.error(" ERROR: MONGODB_URI is not set in .env file");
  console.error(
    "Please create a .env file with MONGODB_URI=mongodb://localhost:27017/your-db-name"
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(" ERROR: JWT_SECRET is not set in .env file");
  console.error("Please add JWT_SECRET=your-secret-key to your .env file");
  process.exit(1);
}

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const uploadRoutes = require("./routes/upload.routes");
const setupCronJobs = require("./services/cron.service");
const questRoutes = require("./routes/quest.routes");

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Render)
const PORT = process.env.PORT || 5000;

const seedAdmin = require("./utils/seedAdmin");

// Connect to MongoDB (async, but don't block server start)
connectDB().then(() => {
  seedAdmin();
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  // Don't exit - let server start and handle errors in middleware
});

// Start Cron Jobs (only if DB is connected)
// Delay cron jobs until DB is connected
setTimeout(() => {
  if (isConnected()) {
    setupCronJobs();
  } else {
    console.warn("⚠️  Cron jobs not started - DB not connected");
  }
}, 2000);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path}`);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is from our frontend or localhost
    const allowedOrigins = [
      "https://gym-workout-nanu.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

// Database connection check middleware
app.use((req, res, next) => {
  const connected = isConnected();
  console.log("Database connected:", connected);
  if (!connected) {
    console.error("❌ Database not connected!");
    return res.status(503).json({
      error: "Database not connected. Please check your MongoDB connection.",
    });
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/quests", questRoutes);

app.get("/", (req, res) => {
  res.send("Fitness League API is running");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Middleware Error:", err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
     return res.status(400).json({ error: 'File too large. strict limit applies.' });
  }

  res.status(500).json({ error: err.message || 'Server Error' });
});

// Create global handlers for crash prevention
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

// Start server
try {
  app.listen(PORT, () => {
    console.log(`\n✅ Server running on port ${PORT}`);
 
  });
} catch (error) {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
}
