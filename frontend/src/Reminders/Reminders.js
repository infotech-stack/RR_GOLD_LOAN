import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BalanceContext } from "./BalanceContext";
import { utils, writeFile, readFile, writeFileAsync } from 'xlsx';
import { AccountBalance, Work } from "@mui/icons-material";
import InputIcon from "@mui/icons-material/Input";
import PaymentsIcon from "@mui/icons-material/Payments";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";

const Reminders = () => {
  const [dayToDayExpenses, setDayToDayExpenses] = useState([]);
  const [paidvoucher, setPaidvoucher] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [apraisalentries, setApraisalentries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { updateBalances } = useContext(BalanceContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          vouchersRes,
          paidvouchersRes,
          expensesRes,
          salariesRes,
          ledgerRes,
          appraisalRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vouchers/all`),
          axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/paidvouchers/all`
          ),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/expenses`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/salary`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/all`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/all`),
        ]);

        const formatData = (data) =>
          data.map((item) => ({
            ...item,
            date: formatDate(item.date),
            paymentDate: formatDate(item.paymentDate),
            quantity: item.quantity || "-",
            weight: item.weight || "-",
            voucherNo: item.voucherNo || "-",
            doccharge: item.doccharge || "0",
          }));

        setVouchers(formatData(vouchersRes.data));
        setPaidvoucher(formatData(paidvouchersRes.data));
        setDayToDayExpenses(formatData(expensesRes.data));
        setSalaries(formatData(salariesRes.data));
        setLedgerEntries(formatData(ledgerRes.data));
        setApraisalentries(formatData(appraisalRes.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const filterDataByDateRange = (data) => {
    if (!selectedYear) return data;

    // Convert selected year to number
    const year = Number(selectedYear);

    return data.filter((item) => {
      const dateField = new Date(item.date || item.paymentDate);
      const itemYear = dateField.getFullYear();

      // Check if the item matches the selected year
      if (itemYear !== year) {
        return false;
      }

      // If no startDate or endDate is provided, return items for the selected year only
      if (!startDate || !endDate) {
        return true;
      }

      // Apply date range filtering if startDate and endDate are provided
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return dateField >= start && dateField <= end;
    });
  };

  const aggregateDataByDate = (data, amountFields) => {
    return data.reduce((acc, item) => {
      const date = item.date || item.paymentDate;
      if (!acc[date]) {
        acc[date] = {
          totalAmount: 0,
          date: date,
        };
      }

      amountFields.forEach((field) => {
        acc[date].totalAmount += parseFloat(item[field] || 0);
      });

      return acc;
    }, {});
  };

  const aggregatedExpenses = aggregateDataByDate(dayToDayExpenses, [
    "totalRupees",
  ]);
  const aggregatedSalaries = aggregateDataByDate(salaries, ["salaryAmount"]);
  const aggregatedVouchers = aggregateDataByDate(vouchers, ["amount"]);
  const aggregatedLedger = aggregateDataByDate(ledgerEntries, ["loanAmount"]);
  const aggregatedPaidVouchers = aggregateDataByDate(paidvoucher, ["amount"]);
  const aggregatedAppraisals = aggregateDataByDate(apraisalentries, [
    "interestamount",
    "interestPrinciple",
  ]);
  const aggregatedDocCharges = aggregateDataByDate(ledgerEntries, [
    "doccharge",
  ]);

  const allDates = [
    ...new Set([
      ...Object.keys(aggregatedExpenses),
      ...Object.keys(aggregatedSalaries),
      ...Object.keys(aggregatedVouchers),
      ...Object.keys(aggregatedLedger),
      ...Object.keys(aggregatedAppraisals),
      ...Object.keys(aggregatedPaidVouchers),
    ]),
  ].sort();

  const filterAndAggregateData = () => {
    const filteredDates = allDates.filter((date) => {
      const dateField = new Date(date);
      const year = dateField.getFullYear();
  
      // Filter by selected year
      if (selectedYear && year !== Number(selectedYear)) {
        return false;
      }
      return (
        !startDate ||
        !endDate ||
        (dateField >= new Date(startDate).setHours(0, 0, 0, 0) &&
          dateField <= new Date(endDate).setHours(23, 59, 59, 999))
      );
    });
  
    let prevClosingBalance = 0; // Start with zero or initial balance
    let lastYearClosingBalance = 0; // Track the last year's closing balance
  
    // Calculate last year's closing balance
    const lastYearDates = allDates.filter((date) => {
      const dateField = new Date(date);
      return dateField.getFullYear() < new Date(filteredDates[0]).getFullYear();
    });
  
    lastYearDates.forEach((date) => {
      lastYearClosingBalance = calculateClosingBalance(lastYearClosingBalance, date);
    });
  
    // Log the correct last year closing balance

  
    return filteredDates.map((date, index) => {
      const currentYear = new Date(date).getFullYear();
  
      // For the first date, always set the opening balance to last year's closing balance
      if (index === 0) {
        prevClosingBalance = lastYearClosingBalance;  // Use last year's closing balance
      }
  
      // Set opening balance for the current date
      const openingBalance = prevClosingBalance;
      const closingBalance = calculateClosingBalance(openingBalance, date);
      
      // Update prevClosingBalance for the next date
      prevClosingBalance = closingBalance;
  
      // Log for debugging purposes
     
  
      return {
        date,
        openingBalance: formatNumber(openingBalance),  // Use correct opening balance
        dayToDayExpenses: aggregatedExpenses[date] || { date: date, totalAmount: 0 },
        salaries: aggregatedSalaries[date] || { date: date, totalAmount: 0 },
        vouchers: aggregatedVouchers[date] || { date: date, totalAmount: 0 },
        paidvoucher: aggregatedPaidVouchers[date] || { date: date, totalAmount: 0 },
        doccharge: aggregatedDocCharges[date] || { date: date, totalAmount: 0 },
        ledger: aggregatedLedger[date] || { date: date, totalAmount: 0 },
        appraisals: aggregatedAppraisals[date] || { date: date, totalAmount: 0 },
        closingBalance: formatNumber(closingBalance),  // Set closing balance for current date
      };
    });
  };
  
  
  const calculateClosingBalance = (prevClosingBalance, date) => {
    const openingBalance = prevClosingBalance;
    const dayToDayTotal = aggregatedExpenses[date]?.totalAmount || 0;
    const salaryTotal = aggregatedSalaries[date]?.totalAmount || 0;
    const voucherTotal = aggregatedVouchers[date]?.totalAmount || 0;
    const ledgerTotal = aggregatedLedger[date]?.totalAmount || 0;
    const appraisalTotal = aggregatedAppraisals[date]?.totalAmount || 0;
    const docChargeTotal = aggregatedDocCharges[date]?.totalAmount || 0;
    const paidVoucherTotal = aggregatedPaidVouchers[date]?.totalAmount || 0;

    return (
      openingBalance +
      voucherTotal +
      docChargeTotal +
      appraisalTotal -
      dayToDayTotal -
      paidVoucherTotal -
      salaryTotal -
      ledgerTotal
    );
  };

  const formatNumber = (number) => {
    const roundedNumber = Math.round(number); // Round to the nearest integer
    return roundedNumber === 0 ? "" : roundedNumber; // Display empty string if zero
  };
  const filteredRows = filterAndAggregateData();

  useEffect(() => {
    const todayDate = new Date().toISOString().split("T")[0];
    const todayRow = filteredRows.find((row) => row.date === todayDate);

    if (todayRow) {
      updateBalances(filteredRows); // Update balances in context
    } else {
  
    }
  }, [filteredRows, updateBalances]);
  const handleDownloadPDF = async () => {
    const input = document.querySelector(".paperbg");
    const actionsColumn = document.querySelectorAll(".actions-column");

    // Hide the actions column
    actionsColumn.forEach((cell) => {
      cell.style.display = "none";
    });

    if (input) {
      const canvas = await html2canvas(input, {
        useCORS: true,
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.width;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page with the image
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height;

      // Add new pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.height;
      }

      // Save the PDF
      pdf.save("customer-entry-details.pdf");
    }

    // Show the actions column again
    actionsColumn.forEach((cell) => {
      cell.style.display = "";
    });
  };

  const dayToDayExpensesTotal = filteredRows.reduce(
    (acc, row) => acc + row.dayToDayExpenses.totalAmount,
    0
  );
  const salaryTotal = filteredRows.reduce(
    (acc, row) => acc + row.salaries.totalAmount,
    0
  );
  const ledgerTotal = filteredRows.reduce((acc, row) => {
    const totalAmount = row.ledger.totalAmount || 0;
    return acc + totalAmount;
  }, 0);

  const docChargeTotal = filterDataByDateRange(ledgerEntries).reduce(
    (acc, entry) => {
      const doccharge = parseFloat(entry.doccharge) || 0; // Convert to number
      return acc + doccharge;
    },
    0
  );
  const interestTotal = filterDataByDateRange(apraisalentries).reduce(
    (acc, entry) => {
      const interestPrinciple = parseFloat(entry.interestPrinciple) || 0; // Convert to number
      return acc + interestPrinciple;
    },
    0
  );

  const appraisalTotal = filteredRows.reduce(
    (acc, row) => acc + row.appraisals.totalAmount,
    0
  );
  const mdTotal = filteredRows.reduce(
    (acc, row) => acc + row.vouchers.totalAmount,
    0
  );
  const mdpaidTotal = filteredRows.reduce(
    (acc, row) => acc + row.paidvoucher.totalAmount,
    0
  );

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this expense!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/expenses/delete/${id}`
        );

        Swal.fire("Deleted!", "Expense deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting expense:", error);
        Swal.fire("Failed!", "Failed to delete expense.", "error");
      }
    }
  };

  const handleDelete2 = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this salary payment!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/salary/delete/${id}`
        );

        Swal.fire(
          "Deleted!",
          "Salary payment deleted successfully.",
          "success"
        );
      } catch (error) {
        console.error("Error deleting salary payment:", error);
        Swal.fire("Failed!", "Failed to delete salary payment.", "error");
      }
    }
  };
  const handleDownloadExcel = () => {
    // Step 1: Get all tables in the `.paperbg` container
    const tables = document.querySelectorAll(".paperbg table");
    if (tables.length === 0) {
      console.error("No tables found!");
      return;
    }
  
    // Step 2: Define titles for each table
    const titles = [
      "Day Book", // Title for the first table
      "Day-to-Day Expenses", // Title for the second table
      "Document Charge", // Title for the third table
      "Salary Payments", // Title for the fourth table
      "MD Voucher", // Title for the fifth table
      "Ledger Entries", // Title for the sixth table
      "Paid Voucher to MD", // Title for the seventh table
      "Appraisal Entries", // Title for the last table
    ];
  
    // Step 3: Create a new workbook
    const workbook = utils.book_new();
  
    // Step 4: Loop through each table and add it as a worksheet
    tables.forEach((table, index) => {
      // Get the title from the predefined titles array
      const tableTitle = titles[index] || `Sheet${index + 1}`; // Fallback to Sheet1, Sheet2, etc.
  
      // Convert the table to a worksheet
      const worksheet = utils.table_to_sheet(table);
  
      // Step 5: Fix zero values (replace empty cells with 0)
      const range = utils.decode_range(worksheet["!ref"]);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (!cell || !cell.v) {
            // If the cell is empty or has no value, set it to 0
            worksheet[cellAddress] = { t: "n", v: 0 }; // t: "n" means numeric type
          }
        }
      }
  
      // Step 6: Apply header styling (background color and center alignment)
      const headerRow = utils.decode_range(worksheet["!ref"]).s.r; // First row is the header
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = utils.encode_cell({ r: headerRow, c: col });
        const cell = worksheet[cellAddress];
        if (cell) {
          cell.s = {
            fill: { fgColor: { rgb: "4F81BD" } }, // Blue background
            font: { bold: true, color: { rgb: "FFFFFF" } }, // Bold and white text
            alignment: { horizontal: "center", vertical: "center" }, // Center alignment
          };
        }
      }
  
      // Step 7: Center-align all cell content
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell) {
            cell.s = cell.s || {}; // Ensure style object exists
            cell.s.alignment = cell.s.alignment || {}; // Ensure alignment object exists
            cell.s.alignment.horizontal = "center"; // Center horizontally
            cell.s.alignment.vertical = "center"; // Center vertically
          }
        }
      }
  
      // Step 8: Reduce cell size (column width)
      const colWidths = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxLength = 0;
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell && cell.v) {
            const cellLength = String(cell.v).length;
            if (cellLength > maxLength) {
              maxLength = cellLength;
            }
          }
        }
        colWidths.push({ wch: Math.min(maxLength + 1, 15) }); // Limit column width to 15 characters
      }
      worksheet["!cols"] = colWidths;
  
      // Step 9: Set A4 page size and fit to one page
      worksheet["!pageSetup"] = {
        paperSize: 9, // A4 size (9 is the code for A4)
        fitToPage: true, // Fit the sheet to one page
        fitToWidth: 1, // Fit to 1 page wide
        fitToHeight: 1, // Fit to 1 page tall
      };
  
      // Step 10: Add the worksheet to the workbook with the table title as the sheet name
      utils.book_append_sheet(workbook, worksheet, tableTitle);
    });
  
    // Step 11: Write the workbook to a file and trigger the download
    writeFile(workbook, "customer-entry-details.xlsx");
  };
  const handleDelete3 = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this Md voucher!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/vouchers/delete/${id}`
        );

        Swal.fire("Deleted!", "Vouchers deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting Vouchers:", error);
        Swal.fire("Failed!", "Failed to delete Vouchers.", "error");
      }
    }
  };
  const handleDelete4 = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this Paid voucher!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/paidvouchers/delete/${id}`
        );

        Swal.fire("Deleted!", "Paid Vouchers deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting Vouchers:", error);
        Swal.fire("Failed!", "Failed to delete Vouchers.", "error");
      }
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const handleEditOpen = (expense) => {
    setCurrentExpense(expense);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentExpense(null);
  };

  const handleEditSubmit = async (form) => {
   
    console.log("clicked");

    const updatedExpense = {
      productName: form.productName.value,
      date: form.date.value,
      totalRupees: form.totalRupees.value,
      quantity: form.quantity.value,
      weight: form.weight.value,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/expenses/edit/${currentExpense._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedExpense),
        }
      );

      if (response.ok) {
        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Expense Updated",
          text: "The expense has been updated successfully!",
        });

        handleEditClose();
      } else {
    
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update the expense. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the expense. Please try again.",
      });
    }
  };
  const [salaryEditOpen, setSalaryEditOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);

  const handleSalaryEditOpen = (salary) => {
    setCurrentSalary(salary);
    setSalaryEditOpen(true);
  };

  const handleSalaryEditClose = () => {
    setSalaryEditOpen(false);
    setCurrentSalary(null);
  };
  const handleSalaryEditSubmit = async (form) => {
    console.log("clicked");

    const updatedSalary = {
      employeeName: form.employeeName.value,
      designation: form.designation.value,
      date: form.date.value,
      salaryAmount: form.salaryAmount.value,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/salary/edit/${currentSalary._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSalary),
        }
      );

      if (response.ok) {
        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Salary Updated",
          text: "The salary has been updated successfully!",
        });

        handleSalaryEditClose();
      } else {
        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update the salary. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating salary:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the salary. Please try again.",
      });
    }
  };
  const [voucherEditOpen, setVoucherEditOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);

  const handleVoucherEditOpen = (voucher) => {
    setCurrentVoucher(voucher);
    setVoucherEditOpen(true);
  };

  const handleVoucherEditClose = () => {
    setVoucherEditOpen(false);
    setCurrentVoucher(null);
  };
  const handleVoucherEditSubmit = async (form) => {
    const updatedVoucher = {
      name: form.name.value,
      amount: form.amount.value,
      date: form.date.value,
      purposeOfAmount: form.purposeOfAmount.value,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/vouchers/edit/${currentVoucher._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedVoucher),
        }
      );

      if (response.ok) {
        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Voucher Updated",
          text: "The voucher has been updated successfully!",
        });

        handleVoucherEditClose();
      } else {
        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update the voucher. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the voucher. Please try again.",
      });
    }
  };
  const [paidVoucherEditOpen, setPaidVoucherEditOpen] = useState(false);
  const [currentPaidVoucher, setCurrentPaidVoucher] = useState(null);

  // Open the dialog and set the current voucher to edit
  const handlePaidVoucherEditOpen = (paidVoucher) => {
    setCurrentPaidVoucher(paidVoucher);
    setPaidVoucherEditOpen(true);
  };

  // Close the dialog
  const handlePaidVoucherEditClose = () => {
    setPaidVoucherEditOpen(false);
    setCurrentPaidVoucher(null);
  };

  // Handle the edit voucher submission
  const handlePaidVoucherEditSubmit = async () => {
    const form = document.getElementById("edit-paid-voucher-form");
    const formData = new FormData(form);

    const updatedVoucher = {
      name: formData.get("name"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      purposeOfAmount: formData.get("purposeOfAmount"),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/paidvouchers/edit/${currentPaidVoucher._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedVoucher),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: " Paid Voucher Updated",
          text: "The  paid voucher has been updated successfully!",
        });
        handlePaidVoucherEditClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update the voucher. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the paid voucher. Please try again.",
      });
    }
  };

  const handleDelete6 = async (id) => {
    // First confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this Md voucher!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      // Second dialog with a checkbox for double confirmation
      const secondResult = await Swal.fire({
        title: "Final Confirmation",
        html: `
          <p>Please confirm the deletion by checking the box below:</p>
          <input type="checkbox" id="double-confirmation-checkbox" />
          <label for="double-confirmation-checkbox">I confirm the deletion</label>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete Voucher",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const checkbox = document.getElementById(
            "double-confirmation-checkbox"
          );
          if (!checkbox.checked) {
            Swal.showValidationMessage(
              "You need to confirm the deletion by checking the box."
            );
          }
          return checkbox.checked;
        },
      });

      if (secondResult.isConfirmed) {
        try {
          await axios.delete(
            `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/delete/${id}`
          );

          Swal.fire("Deleted!", "Vouchers deleted successfully.", "success");
        } catch (error) {
          console.error("Error deleting Vouchers:", error);
          Swal.fire("Failed!", "Failed to delete Vouchers.", "error");
        }
      }
    }
  };

  return (

    <div className="card no-hover-card">
    <div className="card-header daybook_header ">
      <h5 className="text-center pt-2">  <FontAwesomeIcon icon={faCalculator} style={{ fontSize: "20px", color: "#373A8F",marginRight:"10px" }} />DAY BOOK</h5>
    </div>
      <div className="card-body p-5">
      <div className="row mb-4">
          {/* Year Dropdown */}
          <div className="col">
            <label className="form-label">Select Year:</label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[2022, 2023, 2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Picker */}
          <div className="col">
            <label className="form-label">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              isClearable
            />
          </div>

          {/* End Date Picker */}
          <div className="col">
            <label className="form-label">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              isClearable
            />
          </div>

          {/* PDF Download Button */}
          <div className="col d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
          </div>

          {/* Excel Download Button */}
          <div className="col d-flex align-items-end">
            <button
              className="btn btn-success w-100"
              onClick={handleDownloadExcel} 
            >
              Download Excel
            </button>
          </div>
        </div>

        {startDate && endDate && (
          <div className="row g-2 mb-3">
          {/* Row 1 */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />
              <span className="text-muted small me-2">Day to Day:</span>
              <strong className="text-danger">{dayToDayExpensesTotal}</strong>
            </div>
          </div>
        
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <InputIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#198754' }} />
              <span className="text-muted small me-2">Received MD:</span>
              <strong className="text-success">{mdTotal}</strong>
            </div>
          </div>
        
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <InputIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#198754' }} />
              <span className="text-muted small me-2">Doc Charge:</span>
              <strong className="text-success">{docChargeTotal}</strong>
            </div>
          </div>
        
          {/* Row 2 */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <AccountBalance sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />
              <span className="text-muted small me-2">Ledger Loan:</span>
              <strong className="text-danger">{ledgerTotal}</strong>
            </div>
          </div>
        
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <PaymentsIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#198754' }} />
              <span className="text-muted small me-2">Appraisal:</span>
              <strong className="text-success">{appraisalTotal}</strong>
            </div>
          </div>
        
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <Work sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />
              <span className="text-muted small me-2">Salary:</span>
              <strong className="text-danger">{salaryTotal}</strong>
            </div>
          </div>
        
          {/* Paid to MD - full width if odd number, otherwise will fit naturally */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center p-2 bg-light rounded">
              <Work sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />
              <span className="text-muted small me-2">Paid to MD:</span>
              <strong className="text-danger">{mdpaidTotal}</strong>
            </div>
          </div>
        </div>
        )}

        <div className="table-responsive p-3">
          <table className="table table-bordered">
          <thead  className='reminer_table 'style={{ backgroundColor: "#f9fff7" }}>

              <tr>
                <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle" }}>Opening Balance</th>
                <th colSpan={2}>Day To Day Expenses</th>
                <th colSpan={2}>Salary Amount</th>
                <th colSpan={2}>Received Amount from Md</th>
                <th colSpan={2}>Document Charge</th>
                <th colSpan={2}>Paid Amount to MD</th>
                <th colSpan={2}>Ledger Loan Amount</th>
                <th colSpan={2}>Appraisal Payment</th>
                <th rowSpan={2} style={{ textAlign: "center", verticalAlign: "middle" }}>Closing Balance</th>
              </tr>
              <tr>
                <th>Date</th>
                <th>Total</th>
                <th>Date</th>
                <th>Total</th>
                <th>Date</th>
                <th>Total</th>
                <th>Date</th>
                <th>Total</th>
                <th>Date</th>
                <th>Total</th>
                <th>Date</th>
                <th>Total</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.openingBalance}</td>
                  <td>{row.dayToDayExpenses.date}</td>
                  <td>{row.dayToDayExpenses.totalAmount}</td>
                  <td>{row.salaries.date}</td>
                  <td>{row.salaries.totalAmount}</td>
                  <td>{row.vouchers.date}</td>
                  <td>{row.vouchers.totalAmount}</td>
                  <td>{row.doccharge.date}</td>
                  <td>{row.doccharge.totalAmount}</td>
                  <td>{row.paidvoucher.date}</td>
                  <td>{row.paidvoucher.totalAmount}</td>
                  <td>{row.ledger.date}</td>
                  <td>{row.ledger.totalAmount}</td>
                  <td>{row.appraisals.date}</td>
                  <td>{row.appraisals.totalAmount}</td>
                  <td>{row.closingBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 ">
          <h4 className="text-center text-blue ">Day-to-Day Expenses</h4>
          <h6 className="text-danger text-end">
            <i className="fas fa-rupee-sign me-2"></i>
            <span className="fw-bold">  <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />Total:</span> {dayToDayExpensesTotal}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered p-4">
              <thead className="table-dark ">
                <tr>
                  <th className="table_padding">Expense Details</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding">Total Rupees</th>
                  <th className="table_padding">Quantity</th>
                  <th className="table_padding">Weight</th>
                  <th className="table_padding">Voucher No</th>
                  <th className="actions-column table_padding">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(dayToDayExpenses).map((expense) => (
                  <tr key={expense._id}>
                    <td className="table_padding">{expense.productName}</td>
                    <td className="table_padding">{expense.date}</td>
                    <td className="table_padding">{expense.totalRupees}</td>
                    <td className="table_padding">{expense.quantity}</td>
                    <td className="table_padding">{expense.weight}</td>
                    <td className="table_padding">{expense.voucherNo}</td>
                    <td className="actions-column table_padding">
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEditOpen(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(expense._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal fade" id="editExpenseModal" tabIndex="-1" aria-labelledby="editExpenseModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="editExpenseModalLabel">Edit Expense</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {currentExpense && (
                    <form id="edit-expense-form">
                      <div className="mb-3">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="productName"
                          defaultValue={currentExpense.productName}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          defaultValue={currentExpense.date.split("T")[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Total Rupees</label>
                        <input
                          type="number"
                          className="form-control"
                          name="totalRupees"
                          defaultValue={currentExpense.totalRupees}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input
                          type="text"
                          className="form-control"
                          name="quantity"
                          defaultValue={currentExpense.quantity}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Weight</label>
                        <input
                          type="text"
                          className="form-control"
                          name="weight"
                          defaultValue={currentExpense.weight}
                        />
                      </div>
                    </form>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() =>
                      handleEditSubmit(document.getElementById("edit-expense-form"))
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleEditClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3">
          <h4 className="text-center text-green">Document Charge</h4>
          <h6 className="text-success text-end">
            <i className="fas fa-download me-2"></i>
            <span className="fw-bold">  <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#198754' }} />Total:</span> {docChargeTotal}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="table_padding">Customer ID</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding">Customer Name</th>
                  <th className="table_padding">Document Charge</th>
                  <th className="table_padding">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(ledgerEntries).map((entry) => (
                  <tr key={entry._id}>
                    <td className="table_padding">{entry.customerId}</td>
                    <td className="table_padding">{entry.date}</td>
                    <td className="table_padding">{entry.customerName}</td>
                    <td className="table_padding">{entry.doccharge}</td>
                    <td className="table_padding">{entry.loanAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-3">
          <h4 className="text-center text-blue ">Salary Payments</h4>
          <h6 className="text-danger text-end">
            <i className="fas fa-briefcase me-2"></i>
            <span className="fw-bold">  <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />Total:</span> {salaryTotal}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered ">
              <thead className="table-dark ">
                <tr className="table_padding">
                  <th className="table_padding">Employee Name</th>
                  <th className="table_padding">Designation</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding">Salary Amount</th>
                  <th className="actions-column table_padding">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(salaries).map((payment) => (
                  <tr key={payment._id}>
                    <td className="table_padding">{payment.employeeName}</td>
                    <td className="table_padding">{payment.designation}</td>
                    <td className="table_padding">{payment.date}</td>
                    <td className="table_padding">{payment.salaryAmount}</td>
                    <td className="actions-column table_padding">
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleSalaryEditOpen(payment)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete2(payment._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal fade" id="editSalaryModal" tabIndex="-1" aria-labelledby="editSalaryModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="editSalaryModalLabel">Edit Salary Payment</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {currentSalary && (
                    <form id="edit-salary-form">
                      <div className="mb-3">
                        <label className="form-label">Employee Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="employeeName"
                          defaultValue={currentSalary.employeeName}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          name="designation"
                          defaultValue={currentSalary.designation}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          defaultValue={currentSalary.date.split("T")[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Salary Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="salaryAmount"
                          defaultValue={currentSalary.salaryAmount}
                        />
                      </div>
                    </form>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() =>
                      handleSalaryEditSubmit(document.getElementById("edit-salary-form"))
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleSalaryEditClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3">
          <h4 className="text-center text-green ">MD Voucher</h4>
          <h6 className="text-success text-end">
            <i className="fas fa-download me-2"></i>
            <span className="fw-bold"> <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#198754' }} />Total:</span> {mdTotal}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="table_padding">Name</th>
                  <th className="table_padding">Amount</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding">Purpose</th>
                  <th className="actions-column table_padding">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(vouchers).map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="table_padding">{voucher.name}</td>
                    <td className="table_padding">{voucher.amount}</td>
                    <td className="table_padding">{voucher.date}</td>
                    <td className="table_padding">{voucher.purposeOfAmount}</td>
                    <td className="actions-column table_padding">
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleVoucherEditOpen(voucher)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete3(voucher._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal fade" id="editVoucherModal" tabIndex="-1" aria-labelledby="editVoucherModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="editVoucherModalLabel">Edit Voucher</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {currentVoucher && (
                    <form id="edit-voucher-form">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          defaultValue={currentVoucher.name}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="amount"
                          defaultValue={currentVoucher.amount}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          defaultValue={currentVoucher.date.split("T")[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Purpose</label>
                        <input
                          type="text"
                          className="form-control"
                          name="purposeOfAmount"
                          defaultValue={currentVoucher.purposeOfAmount}
                        />
                      </div>
                    </form>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() =>
                      handleVoucherEditSubmit(document.getElementById("edit-voucher-form"))
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleVoucherEditClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3">
          <h4 className="text-center text-blue">Ledger Entries</h4>
          <h6 className="text-danger text-end">
            <i className="fas fa-wallet me-2"></i>
            <span className="fw-bold"><CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />Total:</span> {ledgerTotal}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="table_padding">Customer ID</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding">Customer Name</th>
                  <th className="table_padding">Document Charge</th>
                  <th className="table_padding">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(ledgerEntries).map((entry) => (
                  <tr key={entry._id}>
                    <td className="table_padding">{entry.customerId}</td>
                    <td className="table_padding">{entry.date}</td>
                    <td className="table_padding">{entry.customerName}</td>
                    <td className="table_padding">{entry.doccharge}</td>
                    <td className="table_padding">{entry.loanAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 p-3">
          <h4 className="text-center text-blue  ">Paid Voucher to MD</h4>
          <h6 className="text-danger text-end">
            <i className="fas fa-wallet me-2"></i>
            <span className="fw-bold"> <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#dc3545' }} />Total:</span> {mdpaidTotal}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="table_padding">Name</th>
                  <th className="table_padding">Amount</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding" >Purpose</th>
                  <th className="actions-column table_padding">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(paidvoucher).map((paidvoucher) => (
                  <tr key={paidvoucher._id}>
                    <td className="table_padding">{paidvoucher.name}</td>
                    <td className="table_padding">{paidvoucher.amount}</td>
                    <td className="table_padding">{paidvoucher.date}</td>
                    <td className="table_padding">{paidvoucher.purposeOfAmount}</td>
                    <td className="actions-column table_padding">
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handlePaidVoucherEditOpen(paidvoucher)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete4(paidvoucher._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal fade" id="editPaidVoucherModal" tabIndex="-1" aria-labelledby="editPaidVoucherModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="editPaidVoucherModalLabel">Edit Paid Voucher</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {currentPaidVoucher && (
                    <form id="edit-paid-voucher-form">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          defaultValue={currentPaidVoucher.name}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="amount"
                          defaultValue={currentPaidVoucher.amount}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          defaultValue={currentPaidVoucher.date.split("T")[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Purpose</label>
                        <input
                          type="text"
                          className="form-control"
                          name="purposeOfAmount"
                          defaultValue={currentPaidVoucher.purposeOfAmount}
                        />
                      </div>
                    </form>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handlePaidVoucherEditSubmit()}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handlePaidVoucherEditClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3">
          <h4 className="text-center text-blue ">Appraisal Entries</h4>
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-primary">
                Interest Total: {interestTotal}
              </h6>
            </div>
            <div className="col-md-6">
              <h6 className="text-success text-end">
                <i className="fas fa-money-bill-wave me-2"></i>
                <span className="fw-bold"> <CurrencyRupeeIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#198754' }} /> Total:</span> {appraisalTotal}
              </h6>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th className="table_padding">Customer ID</th>
                  <th className="table_padding">Loan Number</th>
                  <th className="table_padding">Date</th>
                  <th className="table_padding">Principle Paid</th>
                  <th className="table_padding">Interest Paid</th>
                  <th className="table_padding">Balance</th>
                  <th className="actions-column table_padding">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterDataByDateRange(apraisalentries).map((appraisal) => (
                  <tr key={appraisal._id}>
                    <td className="table_padding">{appraisal.customerId}</td>
                    <td className="table_padding">{appraisal.loanNo}</td>
                    <td className="table_padding">{appraisal.paymentDate}</td>
                    <td className="table_padding">{appraisal.interestamount}</td>
                    <td className="table_padding">{appraisal.interestPrinciple}</td>
                    <td className="table_padding">{appraisal.balance}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete6(appraisal._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
 
);
};

export default Reminders;
