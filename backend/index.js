const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   🔐 DB CONFIG
   (Prioritizes Azure App Settings)
========================= */
const config = {
  user: process.env.DB_USER || "adminuser",
  password: process.env.DB_PASSWORD || "Chanda@4824",
  server: process.env.DB_SERVER || "campus-server123.database.windows.net",
  database: process.env.DB_DATABASE || "campusDB",
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// CONNECT DB
sql.connect(config)
  .then(() => console.log("Connected to Azure SQL ✅"))
  .catch(err => console.log("DB Error ❌", err));

/* =========================
   🔹 MULTER (Memory Storage)
========================= */
const upload = multer();

/* =========================
   🔹 AZURE STORAGE SETUP
========================= */
let containerClient;

try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME || "complaints");
        console.log("Azure Blob Storage initialized ✅");
    } else {
        console.log("⚠️ AZURE_STORAGE_CONNECTION_STRING is missing in App Settings!");
    }
} catch (err) {
    console.log("❌ Azure Storage Init Error:", err.message);
}

/* =========================
   🤖 ANALYZE FUNCTION
========================= */
function analyzeComplaint(text) {
  const lower = text.toLowerCase();
  let category = "Other";
  let priority = "Low";

  // Category Detection
  if (lower.includes("wifi") || lower.includes("internet")) category = "WiFi";
  else if (lower.includes("projector") || lower.includes("fan") || lower.includes("ac")) category = "Equipment";
  else if (lower.includes("hostel") || lower.includes("room")) category = "Hostel";
  else if (lower.includes("water")) category = "Water";

  // Priority Detection
  if (lower.includes("urgent") || lower.includes("not working") || lower.includes("broken")) {
    priority = "High";
  } else if (lower.includes("slow") || lower.includes("issue") || lower.includes("sometimes")) {
    priority = "Medium";
  }

  return { category, priority };
}

/* =========================
   📡 ANALYZE API
========================= */
app.post("/api/analyze", (req, res) => {
  const { description } = req.body;
  const result = analyzeComplaint(description || "");
  res.json(result);
});

/* =========================
   🔐 AUTH ROUTES
========================= */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await sql.query`SELECT * FROM Users WHERE email=${email} AND password=${password}`;
    
    if (result.recordset.length === 0) {
      return res.status(400).send("Invalid credentials");
    }
    res.json({ user: result.recordset[0], token: "session-active" });
  } catch (err) {
    res.status(500).send("Login failed");
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    await sql.query`INSERT INTO Users (name, email, password, role) VALUES (${name}, ${email}, ${password}, ${role})`;
    res.send("Registered");
  } catch (err) {
    res.status(500).send("Registration failed");
  }
});

/* =========================
   📤 UPLOAD API
========================= */
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!containerClient) return res.status(500).send("Storage not configured");
    
    const file = req.file;
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    res.json({ url: blockBlobClient.url });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

/* =========================
   📢 COMPLAINT ROUTES
========================= */
app.post("/api/complaints", async (req, res) => {
  try {
    const { userId, title, description, category, priority, location, imageUrl } = req.body;
    await sql.query`
      INSERT INTO Complaints (userId, title, description, category, priority, location, status, date, imageUrl)
      VALUES (${userId}, ${title}, ${description}, ${category}, ${priority}, ${location}, 'Submitted', GETDATE(), ${imageUrl})
    `;
    res.send("Complaint added");
  } catch (err) {
    res.status(500).send("Submission failed");
  }
});

app.get("/api/complaints", async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Complaints ORDER BY date DESC`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Fetch failed");
  }
});

// 🔥 NEW: GET SINGLE COMPLAINT (Fixes Loading/Wrong Details issue)
app.get("/api/complaints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await sql.query`SELECT * FROM Complaints WHERE id = ${id}`;
      if (result.recordset.length === 0) return res.status(404).send("Not found");
      res.json(result.recordset[0]);
    } catch (err) {
      res.status(500).send("Error fetching details");
    }
});

/* =========================
   🔥 UPDATE STATUS
========================= */
app.put("/api/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === "In Progress") {
      await sql.query`UPDATE Complaints SET status=${status}, updatedAt=GETDATE() WHERE id=${id}`;
    } else if (status === "Resolved") {
      await sql.query`UPDATE Complaints SET status=${status}, updatedAt=GETDATE(), resolvedAt=GETDATE() WHERE id=${id}`;
    }
    res.send("Updated");
  } catch (err) {
    res.status(500).send("Update failed");
  }
});

/* =========================
    🚀 START SERVER
========================= */
// Azure App Service provides the PORT, but 8080 is the standard for containers
const PORT = process.env.PORT || 8080; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Cloud check: Accepting traffic on all interfaces via 0.0.0.0`);
});