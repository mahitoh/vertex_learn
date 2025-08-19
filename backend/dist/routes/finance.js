"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/invoices', (req, res) => {
    res.json({ message: 'Get invoices endpoint - to be implemented' });
});
router.get('/expenses', (req, res) => {
    res.json({ message: 'Get expenses endpoint - to be implemented' });
});
router.get('/campaigns', (req, res) => {
    res.json({ message: 'Get campaigns endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=finance.js.map