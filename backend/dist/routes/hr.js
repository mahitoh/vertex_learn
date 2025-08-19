"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/employees', (req, res) => {
    res.json({ message: 'Get employees endpoint - to be implemented' });
});
router.get('/leaves', (req, res) => {
    res.json({ message: 'Get leaves endpoint - to be implemented' });
});
router.get('/assets', (req, res) => {
    res.json({ message: 'Get assets endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=hr.js.map