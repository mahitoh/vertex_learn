import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Academic
 *   description: Academic module endpoints
 */

/**
 * @swagger
 * /api/academic/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/courses', (req, res) => {
  res.json({ message: 'Get courses endpoint - to be implemented' });
});

/**
 * @swagger
 * /api/academic/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post('/courses', (req, res) => {
  res.json({ message: 'Create course endpoint - to be implemented' });
});

/**
 * @swagger
 * /api/academic/grades:
 *   get:
 *     summary: Get grades
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of grades
 */
router.get('/grades', (req, res) => {
  res.json({ message: 'Get grades endpoint - to be implemented' });
});

/**
 * @swagger
 * /api/academic/attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/attendance', (req, res) => {
  res.json({ message: 'Get attendance endpoint - to be implemented' });
});

export default router;
