const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "config/config.env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(bodyParser.json());

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const atlasDB = process.env.MONGO_CLOUD_URI;
console.log("MongoDB URI:", atlasDB); // Debugging Log

(async () => {
  try {
    await mongoose.connect(atlasDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
  }
})();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const adaguRouter = require("./routes/Adagu");
const adminRouter = require("./routes/Admin");
const rootadminRouter = require("./routes/rootadmin");
const voucherRoutes = require("./routes/voucherRoutes");
const ledgerRouter = require("./routes/ledger");
const expensesRouter = require("./routes/expenses");
const salaryRoutes = require("./routes/salary");
const reportRoutes = require("./routes/report");
const schemaRoutes = require("./routes/schemaRoutes");
const loanEntryRoutes = require("./routes/loanEntryRoutes");
const customerRoutes = require("./routes/customer");
const goldLoanEntryRoutes = require("./routes/goldLoanEntry");
const paidVoucherRoutes = require('./routes/paidVoucherRoutes');

app.use("/api/repledge", goldLoanEntryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/schemas", schemaRoutes);
app.use("/api/loanEntry", loanEntryRoutes);
app.use("/api/expenses", expensesRouter);
app.use("/api/adagu", adaguRouter);
app.use("/api/admins", adminRouter);
app.use("/api/rootadmin", rootadminRouter);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/ledger", ledgerRouter);
app.use("/api/salary", salaryRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/paidvouchers", paidVoucherRoutes);

const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(frontendPath, "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send(err);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});