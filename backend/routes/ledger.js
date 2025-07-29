const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Ledger = require("../models/Ledger");
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');
const LoanEntry = require('../models/loanEntry');
const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
router.post(
  "/add",
  upload.fields([
    { name: 'proof1', maxCount: 1 },
    { name: 'proof2', maxCount: 1 },
    { name: 'proof3', maxCount: 10 },
    { name: "customerSign", maxCount: 1 },
    { name: "customerPhoto", maxCount: 1 },
    { name: "thumbImpression", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        customerId,
        doccharge,
        loanNumber,
        fatherhusname,
        date,
        lastDateForLoan,
        customerName,
        mobileNumber1,
        mobileNumber2,
        landmark,
        address,
        nw,
        gw,
        schema,
        percent,
        loanAmount,
        interestbalamount,
        loanamountbalance,
        interest,
        jewelList
      } = req.body;

  

      // Safely parse the jewelList, if present
      let jewelListParsed = [];
      if (jewelList) {
        try {
          jewelListParsed = JSON.parse(jewelList);
        } catch (error) {
          console.error('Error parsing jewelList:', error);
          return res.status(400).json({ error: 'Invalid jewelList format' });
        }
      }
      const existingRecords = await Ledger.find({ customerId });

      let existingProofs = {
        proof1: null,
        proof2: null,
        customerSign: null,
        customerPhoto: null,
        thumbImpression: null
      };

      // Extract existing proof images if any records are found
      if (existingRecords.length > 0) {
        existingProofs = {
          proof1: existingRecords[0].proof1,
          proof2: existingRecords[0].proof2,
          customerSign: existingRecords[0].customerSign,
          customerPhoto: existingRecords[0].customerPhoto,
          thumbImpression: existingRecords[0].thumbImpression
        };
      }
   
      const proofFilePaths = {
        proof1: req.files["proof1"] 
          ? `/uploads/${req.files["proof1"][0].filename}`
          : existingProofs.proof1, 
      
        proof2: req.files["proof2"] 
          ? `/uploads/${req.files["proof2"][0].filename}`  
          : existingProofs.proof2,  
      
        proof3: req.files["proof3"] 
          ? req.files["proof3"].map((file) => `/uploads/${file.filename}`)  
          : existingProofs.proof3 || [], 
      
        customerSign: req.files["customerSign"] 
          ? `/uploads/${req.files["customerSign"][0].filename}`  
          : existingProofs.customerSign,  
      
        customerPhoto: req.files["customerPhoto"] 
          ? `/uploads/${req.files["customerPhoto"][0].filename}`  
          : existingProofs.customerPhoto,  
      
        thumbImpression: req.files["thumbImpression"] 
          ? `/uploads/${req.files["thumbImpression"][0].filename}`  
          : existingProofs.thumbImpression,  
      };
      

      const newLedger = new Ledger({
        customerId,
        doccharge,
        loanNumber,
        date,
        lastDateForLoan,
        fatherhusname,
        customerName,
        mobileNumber1,
        mobileNumber2,
        landmark,
        address,
        schema,
         nw,
        gw,
        loanAmount,
        loanamountbalance: loanamountbalance || null,
        interestbalamount: interestbalamount || null,
        interest,
        percent,
        proof1: proofFilePaths.proof1,
        proof2: proofFilePaths.proof2,
        proof3: proofFilePaths.proof3,
        customerSign: proofFilePaths.customerSign,
        customerPhoto: proofFilePaths.customerPhoto,
        thumbImpression: proofFilePaths.thumbImpression,
        jewelList: jewelListParsed,
      });

      await newLedger.save();

      res.status(201).json({ message: 'Ledger entry created successfully' });
    } catch (error) {
      console.error('Detailed Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  }
);



router.get("/loans/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const loans = await Ledger.find({ customerId });

   

    if (loans.length > 0) {
      res.status(200).json(loans);
    } else {
      res.status(404).json({ message: "No loans found for this customer ID" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/loan/:loanNumber", async (req, res) => {
  const { loanNumber } = req.params;
  try {
    const ledger = await Ledger.findOne({ loanNumber });
    if (ledger) {
      res.status(200).json(ledger);
    } else {
      res
        .status(404)
        .json({ message: "Ledger entry not found for this loan number" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/all", async (req, res) => {
  try {
    const ledgers = await Ledger.find();

    for (const ledger of ledgers) {
      const loanEntries = await LoanEntry.find({ loanNo: ledger.loanNumber })
        .sort({ paymentDate: 1 }); // Sort in ascending order

      if (loanEntries.length > 0) {
        let loanamountbalance = ledger.loanAmount; // Initialize with loan amount

        for (let i = 0; i < loanEntries.length; i++) {
          const entry = loanEntries[i];

          if (i === 0) {
            // First payment: subtract from the ledger's original loan amount
            loanamountbalance -= entry.interestamount;
          } else {
            // Subsequent payments: subtract from the previous entry's balance
            loanamountbalance -= entry.interestamount;
          }
  // Prevent negative
          // Update the balance field in LoanEntry
          await LoanEntry.updateOne(
            { _id: entry._id },
            { balance: loanamountbalance }
          );
        }
// Calculate number of days from ledger.date to today (+1 to include start date)
      const today = new Date();
      const loanStartDate = new Date(ledger.date);
      let numberOfdays = Math.floor((today - loanStartDate) / (1000 * 60 * 60 * 24)) + 1;
      numberOfdays = Math.max(numberOfdays, 0); 
        // Update the ledger's balance
        await Ledger.updateOne(
          { _id: ledger._id },
          { loanamountbalance: loanamountbalance ,
           numberOfdays: numberOfdays}
        );
      }
    }

    const updatedLedgers = await Ledger.find();
    res.status(200).json(updatedLedgers);
  } catch (error) {
    console.error("Error retrieving ledgers:", error);
    res.status(500).json({ message: error.message });
  }
});





router.get("/merged-loan-data", async (req, res) => {
  try {
    const ledgers = await Ledger.find();
    const loanEntries = await LoanEntry.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const mergedData = await Promise.all(
      ledgers.map(async (ledger) => {
        const matchingLoanEntries = loanEntries.filter(
          (entry) => entry.loanNo === ledger.loanNumber
        );

        let latestPaymentDate = null;
        let isClosed = false;
        if (matchingLoanEntries.length > 0) {
  
          matchingLoanEntries.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        
          latestPaymentDate = new Date(matchingLoanEntries[0].paymentDate);
          latestPaymentDate.setHours(0, 0, 0, 0); 
              // Fetch isClosed status from the latest entry
              isClosed = matchingLoanEntries[0].isClosed;
        }



        const ledgerData = {
          loanAmount: ledger.loanAmount,
          percent: ledger.percent,
          schema: ledger.schema,
          date: ledger.date,
          loanNumber:ledger.loanNumber,
          lastDateForLoan: ledger.lastDateForLoan,
         
          interest: ledger.interest,
        };


        const lastDateForLoan = new Date(ledger.lastDateForLoan);
        lastDateForLoan.setHours(0, 0, 0, 0);

        let updatedSchema = ledger.schema;
        let updatedPercent = ledger.percent;

        if (today > lastDateForLoan && !ledger.isSchemaUpdated && !isClosed) {

          switch (ledger.schema) {
            case "LGL":
              updatedSchema = "MGL";
              updatedPercent = 18;
              break;
            case "MGL":
              updatedSchema = "HGL";
              updatedPercent = 24;
              break;
            case "HGL":
              updatedSchema = "HGL"; // No further upgrade, but percent increases to 30%
              updatedPercent = 30;
              break;
            case "HGL-SPCL":
              updatedSchema = "HGL-SPCL"; // No further upgrade, but percent increases to 30%
              updatedPercent = 30;
              break;
            default:
              // If schema is not recognized, keep the current values
              updatedSchema = ledger.schema;
              updatedPercent = ledger.percent;
          }
          ledger.isSchemaUpdated = true;
          // Update only schema and percent in the ledger
          ledger.schema = updatedSchema;
          ledger.percent = updatedPercent;
        }

        // Calculate the number of days
        const loanStartDate = new Date(ledger.date);
        loanStartDate.setHours(0, 0, 0, 0); // Normalize time to midnight

        let numberOfdays;
        if (latestPaymentDate) {
          // If latestPaymentDate exists, calculate days from latestPaymentDate to today
          numberOfdays = Math.floor((today - latestPaymentDate) / (1000 * 60 * 60 * 24));
        } else {
          // If no paymentDate exists, calculate days from loanStartDate to today
         numberOfdays = Math.floor((today - loanStartDate) / (1000 * 60 * 60 * 24)) + 1;
        }

        // Ensure numberOfdays is not negative
        numberOfdays = Math.max(numberOfdays, 0);

        // Calculate interest
        let principalAmount;
        if (matchingLoanEntries.length > 0 && matchingLoanEntries[0].loanamountbalance) {
          // If loanamountbalance exists in the latest LoanEntry, use it as the principal
          principalAmount = parseFloat(matchingLoanEntries[0].loanamountbalance);
        } else {
          // If no loanamountbalance exists, use loanAmount as the principal
          principalAmount = parseFloat(ledger.loanAmount);
        }

        const percent = parseFloat(updatedPercent); // Use updated percent
        let interest;

        // Check if the loan is within the first 15 days and no payment has been made
        if (numberOfdays <= 15 && !latestPaymentDate) {
          interest = (principalAmount * percent * 15) / 36500;
        } else {
          // After 15 days or if a payment has been made, calculate interest for the actual number of days
          interest = (principalAmount * percent * numberOfdays) / 36500;
        }

        // Update interest in the response
        ledgerData.interest = Math.round(interest / 10) * 10;
       
        // Update schema and percent in the response
        ledgerData.schema = updatedSchema;
        ledgerData.percent = updatedPercent;

        // Update only interest in the ledger
        ledger.interest = ledgerData.interest; 

        // Save only the updated fields (schema, percent, interest) to the database
        await Ledger.updateOne(
          { _id: ledger._id }, // Filter by ledger ID
          {
            $set: {
              schema: updatedSchema,
              percent: updatedPercent,
              interest: ledger.interest,
              isSchemaUpdated: ledger.isSchemaUpdated,
           
            },
          }
        );

        // If matching loan entries exist, add paymentDate, isClosed, and loanamountbalance from the latest entry
        if (matchingLoanEntries.length > 0) {
          return {
            ...ledgerData, // Spread ledger data
            paymentDate: matchingLoanEntries[0].paymentDate,
            isClosed: matchingLoanEntries[0].isClosed,
            loanamountbalance: matchingLoanEntries[0].loanamountbalance,
            numberOfdays: numberOfdays, // Include numberOfdays for debugging
          };
        } else {
          // If no matching loan entry is found, set paymentDate, isClosed, and loanamountbalance to null
          return {
            ...ledgerData,
            paymentDate: null,
            isClosed: null,
            loanamountbalance: null,
            numberOfdays: numberOfdays, // Include numberOfdays for debugging
          };
        }
      })
    );

    // Send the merged data as the response
    res.status(200).json(mergedData);
  } catch (error) {
    // Log the error for debugging
    console.error("Error merging loan data:", error);
    // Send a detailed error response
    res.status(500).json({ message: "Failed to merge loan data", error: error.message });
  }
});



router.get("/all/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const ledgers = await Ledger.find({ customerId });

    if (ledgers.length > 0) {
      res.status(200).json(ledgers);
    } else {
      res
        .status(404)
        .json({ message: "No ledgers found for this customer ID" });
    }
  } catch (error) {
    console.error("Error retrieving ledgers:", error);
    res.status(500).json({ message: error.message });
  }
});
router.get("/customer/:customerId/:mobileNumber", async (req, res) => {
  const { customerId, mobileNumber } = req.params;
  try {
    const customer = await Ledger.findOne({ customerId, mobileNumber });
    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle fetching ledger details by loan number and include image URLs
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


router.get("/loan/:loanNumber", async (req, res) => {
  const { loanNumber } = req.params;
  try {
    const ledger = await Ledger.findOne({ loanNumber });
    if (ledger) {
      // Construct image URLs
      const imageUrls = {
        proof1: ledger.proof1 ? `${process.env.REACT_APP_BACKEND_URL}${ledger.proof1}` : null,
        proof2: ledger.proof2 ? `${process.env.REACT_APP_BACKEND_URL}${ledger.proof2}` : null,
        proof3: ledger.proof3 ? ledger.proof3.map((file) => `${process.env.REACT_APP_BACKEND_URL}${file}`) : [],
        customerSign: ledger.customerSign ? `${process.env.REACT_APP_BACKEND_URL}${ledger.customerSign}` : null,
        customerPhoto: ledger.customerPhoto ? `${process.env.REACT_APP_BACKEND_URL}${ledger.customerPhoto}` : null,
        thumbImpression: ledger.thumbImpression ? `${process.env.REACT_APP_BACKEND_URL}${ledger.thumbImpression}` : null,
      };


      res.status(200).json({ ...ledger.toObject(), imageUrls });
    } else {
      res.status(404).json({ message: "Ledger entry not found for this loan number" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





router.get("/latest_loan_number", async (req, res) => {
  try {
    // Find the latest loan number from the database
    const latestEntry = await Ledger.findOne(
      {},
      { loanNumber: 1 },
      { sort: { loanNumber: -1 } }
    );

    let nextLoanNumber;
    
    if (!latestEntry) {
      nextLoanNumber = "RR101"; // Start from RR101 if no previous record
    } else {
      const currentLoanNumber = latestEntry.loanNumber;
      
      // Ensure currentLoanNumber starts with "RR" and has a valid number part
      if (!/^RR\d+$/.test(currentLoanNumber)) {
        return res.status(500).json({ message: "Invalid loan number format in DB" });
      }
      
      // Extract numeric part and increment
      const numericPart = parseInt(currentLoanNumber.slice(2), 10); 
      nextLoanNumber = `RR${(numericPart + 1).toString().padStart(3, "0")}`;
    }

    res.json({ latestLoanNumber: nextLoanNumber });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.get("/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const ledger = await Ledger.findOne({ customerId });
    if (ledger) {
      res.status(200).json(ledger);
    } else {
      res.status(404).json({ message: "Ledger entry not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/image/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const ledger = await Ledger.findOne({ customerId });
    if (ledger) {
      if (ledger.proofFilePath) {
        res.status(200).json({ imageUrl: ledger.proofFilePath });
      } else {
        res.status(404).json({ message: "No image found for this customer" });
      }
    } else {
      res.status(404).json({ message: "Ledger entry not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:loanNumber', async (req, res) => {
  try {
    const { loanNumber } = req.params;

    const result = await Ledger.deleteMany({ loanNumber });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No ledger entries found to delete' });
    }

    res.json({ message: 'Ledger entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger entries:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ledgerEntry = await Ledger.findById(req.params.id);
    res.status(200).json(ledgerEntry);
  } catch (error) {
    console.error("Error fetching ledger entry:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:loanNumber", async (req, res) => {
  try {
    const ledgerEntries = await Ledger.find({
      loanNumber: req.params.loanNumber,
    });
    if (ledgerEntries.length === 0)
      return res.status(404).json({ message: "No ledgers found" });
    res.json(ledgerEntries);
  } catch (error) {
    console.error("Error fetching ledger entries:", error);
    res.status(500).json({ message: error.message });
  }
});




const convertDateFormat = (dateStr) => {
  console.log("Converting date:", dateStr);
  if (!dateStr) {
    console.error('Received null or undefined date string');
    return null;
  }

  // Check if the date string is in YYYY-MM-DD format
  const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (yyyymmddRegex.test(dateStr)) {
    return new Date(dateStr); // Directly return a Date object
  }

  // Check if the date string is in YYYY/MM/DD format
  const yyyymmddSlashRegex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (yyyymmddSlashRegex.test(dateStr)) {
    return new Date(dateStr.replace(/\//g, '-')); // Replace '/' with '-' and return a Date object
  }

  // Assume it's in DD/MM/YYYY format
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) {
    console.error('Invalid date format:', dateStr);
    return null;
  }

  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime())) {
    console.error('Converted date is invalid:', date);
    return null;
  }

  return date;
};




router.put(
  "/update/:loanNumber", 
  upload.fields([
    { name: "proof1", maxCount: 1 },
    { name: "proof2", maxCount: 1 },
    { name: "proof3", maxCount: 10 },
    { name: "customerSign", maxCount: 1 },
    { name: "customerPhoto", maxCount: 1 },
    { name: "thumbImpression", maxCount: 1 },
  ]), 
  // Validation middleware
  [
    body("customerId").if(body("customerId").exists()).notEmpty().withMessage("Customer ID is required"),
    body("customerName").if(body("customerName").exists()).notEmpty().withMessage("Customer Name is required"),
    body("mobileNumber1")
      .if(body("mobileNumber1").exists())
      .isLength({ min: 10, max: 10 }).withMessage("Mobile Number 1 must be exactly 10 digits")
      .isNumeric().withMessage("Mobile Number 1 must contain only numbers"),
    body("fatherhusname").if(body("fatherhusname").exists()).notEmpty().withMessage("Father/Husband Name is required"),
    body("landmark").if(body("landmark").exists()).notEmpty().withMessage("Landmark is required"),
    body("address").if(body("address").exists()).notEmpty().withMessage("Address is required"),
    body("schema").if(body("schema").exists()).notEmpty().withMessage("Schema is required"),
    body("percent").if(body("percent").exists()).notEmpty().withMessage("Percent is required"),
    body("loanAmount").if(body("loanAmount").exists()).notEmpty().withMessage("Loan Amount is required"),
    body("interest").if(body("interest").exists()).notEmpty().withMessage("Interest is required"),
 
  ],
  async (req, res) => {
    const { loanNumber } = req.params;
    let updateData = {};
    let nonFileUpdateData = {};

    // Run validations for non-file data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const ledgerEntry = await Ledger.findOne({ loanNumber });
      if (!ledgerEntry) {
        return res.status(404).json({ message: "Ledger entry not found" });
      }

      // Extract customerId from the loan entry
      const customerId = ledgerEntry.customerId;

      // Handle file updates
      if (req.files) {
        const fileTypes = ["proof1", "proof2", "proof3", "customerSign", "customerPhoto", "thumbImpression"];
        fileTypes.forEach((fileType) => {
          if (req.files[fileType]) {
            if (fileType === "proof3") {
              updateData[fileType] = req.files[fileType].map(file => `/uploads/${file.filename}`);
            } else {
              updateData[fileType] = `/uploads/${req.files[fileType][0].filename}`;
            }
          }
        });
      }

      // Handle non-file data updates only if the fields are present and not null
      if (req.body) {
        const {
          customerId, customerName, mobileNumber1, fatherhusname, landmark, address, schema, 
          percent, loanAmount, interest, mobileNumber2, date, lastDateForLoan, iw, gw, nw, jewelList
        } = req.body;
  
        // Only update fields if they exist in the request body
        nonFileUpdateData = {
          ...(customerId && { customerId }),
          ...(customerName && { customerName }),
          ...(mobileNumber1 && { mobileNumber1 }),
          ...(mobileNumber2 && { mobileNumber2 }),
          ...(fatherhusname && { fatherhusname }),
          ...(landmark && { landmark }),
          ...(address && { address }),
          ...(schema && { schema }),
          ...(percent && { percent }),
          ...(loanAmount && { loanAmount }),
          ...(interest && { interest }),
          ...(date && { date: convertDateFormat(date) }),
          ...(lastDateForLoan && { lastDateForLoan: convertDateFormat(lastDateForLoan) }),// Same for lastDateForLoan
          ...(iw && { iw }),
          ...(gw && { gw }),
          ...(nw && { nw }),
          ...(jewelList && { jewelList })
        };
      }

      // Merge file and non-file updates
      const updateQuery = { $set: { ...updateData, ...nonFileUpdateData } };

      // Update the current loan
      const updatedLedger = await Ledger.updateOne({ loanNumber }, updateQuery);

      if (updatedLedger.matchedCount === 0) {
        return res.status(404).json({ message: "Ledger entry not found or no changes made" });
      }
      if (updatedLedger.modifiedCount === 0) {
        return res.status(400).json({ message: "No records updated" });
      }

      if (Object.keys(updateData).length > 0) {
        await Ledger.updateMany(
          { customerId, loanNumber: { $ne: loanNumber } },  
          { $set: updateData }
        );
      }

      res.status(200).json({ message: "Ledger updated successfully and proofs synced across all loans" });
    } catch (error) {
      console.error("Error updating ledger:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);




router.put("/updateLoan/:loanNumber", async (req, res) => {


  const { loanNumber } = req.params;
  const {
    lastDateForLoan,
    schema,
    percent,
    interest,
    loanamountbalance,
    interestbalamount,
  } = req.body;

  try {
    const updatedLedger = await Ledger.findOneAndUpdate(
      { loanNumber },
      { lastDateForLoan, schema, percent, interest, loanamountbalance, interestbalamount }, 
      { new: true }
    );

    if (updatedLedger) {
      res.status(200).json(updatedLedger);
    } else {
      res.status(404).json({ message: "Ledger entry not found for this loan number" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
