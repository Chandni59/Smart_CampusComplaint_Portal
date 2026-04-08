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
========================= */
const config = {
  user: "adminuser",
  password: "Chanda@4824",
  server: "campus-server123.database.windows.net",
  database: "campusDB",
  options: {
    encrypt: true
  }
};

// CONNECT DB
sql.connect(config)
  .then(() => console.log("Connected to Azure SQL ✅"))
  .catch(err => console.log("DB Error ❌", err));

/* =========================
   🔹 MULTER
========================= */
const upload = multer();

/* =========================
   🔹 AZURE STORAGE
========================= */
const blobServiceClient = BlobServiceClient.fromConnectionString(
  "DefaultEndpointsProtocol=https;AccountName=campusstorage123;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
);

const containerClient = blobServiceClient.getContainerClient("complaints");

/* =========================
   🤖 ANALYZE FUNCTION
========================= */
function analyzeComplaint(text) {
  const lower = text.toLowerCase();

  let category = "Other";
  let priority = "Low";

  if (lower.includes("wifi")) category = "WiFi";
  else if (lower.includes("projector") || lower.includes("fan")) category = "Equipment";
  else if (lower.includes("hostel")) category = "Hostel";

  if (lower.includes("urgent") || lower.includes("not working")) {
    priority = "High";
  } else if (lower.includes("slow") || lower.includes("issue")) {
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
   🔐 LOGIN
========================= */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await sql.query`
    SELECT * FROM Users WHERE email=${email} AND password=${password}
  `;

  if (result.recordset.length === 0) {
    return res.status(400).send("Invalid credentials");
  }

  res.json({ user: result.recordset[0], token: "dummy-token" });
});

/* =========================
   📝 REGISTER
========================= */
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  await sql.query`
    INSERT INTO Users (name, email, password, role)
    VALUES (${name}, ${email}, ${password}, ${role})
  `;

  res.send("Registered");
});

/* =========================
   📤 UPLOAD
========================= */
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const blobName = Date.now() + "-" + file.originalname;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    res.json({ url: blockBlobClient.url });

  } catch (err) {
    res.status(500).send("Upload failed");
  }
});

/* =========================
   📢 SUBMIT COMPLAINT
========================= */
app.post("/api/complaints", async (req, res) => {
  const { userId, title, description, category, priority, location, imageUrl } = req.body;

  await sql.query`
    INSERT INTO Complaints
    (userId, title, description, category, priority, location, status, date, imageUrl)
    VALUES
    (${userId}, ${title}, ${description}, ${category}, ${priority}, ${location}, 'Submitted', GETDATE(), ${imageUrl})
  `;

  res.send("Complaint added");
});

/* =========================
   📄 GET COMPLAINTS
========================= */
app.get("/api/complaints", async (req, res) => {
  const result = await sql.query`SELECT * FROM Complaints`;
  res.json(result.recordset);
});

/* =========================
   🔥 UPDATE STATUS (MISSING BEFORE)
========================= */
app.put("/api/complaints/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!id) return res.status(400).send("Invalid ID");

    if (status === "In Progress") {
      await sql.query`
        UPDATE Complaints
        SET status=${status}, updatedAt=GETDATE()
        WHERE id=${id}
      `;
    } else if (status === "Resolved") {
      await sql.query`
        UPDATE Complaints
        SET status=${status},
            updatedAt = ISNULL(updatedAt, GETDATE()),
            resolvedAt = GETDATE()
        WHERE id=${id}
      `;
    }

    res.send("Updated");

  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

/* =========================
   🚀 START
========================= */
// This tells the app to listen on the port Azure provides, 
// and the '0.0.0.0' allows it to accept external traffic.
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});