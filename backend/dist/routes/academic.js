"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/courses', (req, res) => {
    res.json({ message: 'Get courses endpoint - to be implemented' });
});
router.post('/courses', (req, res) => {
    res.json({ message: 'Create course endpoint - to be implemented' });
});
router.get('/grades', (req, res) => {
    res.json({ message: 'Get grades endpoint - to be implemented' });
});
router.get('/attendance', (req, res) => {
    res.json({ message: 'Get attendance endpoint - to be implemented' });
});
exports.default = router;
//# sourceMappingURL=academic.js.map