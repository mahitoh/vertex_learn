const express = require("express");
const router = express.Router();
const { Invoice, Expense, Campaign, Student } = require("./models");
// -------------------- Invoices --------------------
router.post("/invoices", async (req, res) => {
  try {
    const { studentId, amount, dueDate, paymentMethod } = req.body;
    const invoice = await Invoice.create({
      studentId,
      amount,
      dueDate,
      paymentMethod
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/invoices/:id/pay", async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    invoice.status = "paid";
    await invoice.save();
    res.json({ message: "Payment confirmed", invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// -------------------- Expenses --------------------
router.post("/expenses", async (req, res) => {
  try {
    const { category, description, amount } = req.body;
    const expense = await Expense.create({ category, description, amount });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/expenses/summary", async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    const summary = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// -------------------- Campaigns --------------------
router.post("/campaigns", async (req, res) => {
  try {
    const { name, leads, conversions, roi } = req.body;
    const campaign = await Campaign.create({ name, leads, conversions, roi });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await Campaign.findAll();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;