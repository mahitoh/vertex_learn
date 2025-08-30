import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Global search across multiple entities
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { q: query, type, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = String(query);
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const searchLimit = parseInt(String(limit));

    let results: any = {};

    // Search users if no specific type or type is 'users'
    if (!type || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { employeeId: { contains: searchTerm, mode: 'insensitive' } },
            { studentId: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          role: { select: { name: true } }
        },
        skip,
        take: searchLimit,
        orderBy: { name: 'asc' }
      });

      const totalUsers = await prisma.user.count({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { employeeId: { contains: searchTerm, mode: 'insensitive' } },
            { studentId: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      });

      results.users = {
        data: users,
        total: totalUsers,
        page: parseInt(String(page)),
        limit: searchLimit,
        totalPages: Math.ceil(totalUsers / searchLimit)
      };
    }

    // Search courses if no specific type or type is 'courses'
    if (!type || type === 'courses') {
      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true
        },
        include: {
          instructor: { select: { name: true, email: true } }
        },
        skip,
        take: searchLimit,
        orderBy: { name: 'asc' }
      });

      const totalCourses = await prisma.course.count({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true
        }
      });

      results.courses = {
        data: courses,
        total: totalCourses,
        page: parseInt(String(page)),
        limit: searchLimit,
        totalPages: Math.ceil(totalCourses / searchLimit)
      };
    }

    // Search assets if no specific type or type is 'assets'
    if (!type || type === 'assets') {
      const assets = await prisma.asset.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          user: { select: { name: true, email: true } }
        },
        skip,
        take: searchLimit,
        orderBy: { name: 'asc' }
      });

      const totalAssets = await prisma.asset.count({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      });

      results.assets = {
        data: assets,
        total: totalAssets,
        page: parseInt(String(page)),
        limit: searchLimit,
        totalPages: Math.ceil(totalAssets / searchLimit)
      };
    }

    // Search invoices if no specific type or type is 'invoices'
    if (!type || type === 'invoices') {
      const invoices = await prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          student: { select: { name: true, email: true } }
        },
        skip,
        take: searchLimit,
        orderBy: { createdAt: 'desc' }
      });

      const totalInvoices = await prisma.invoice.count({
        where: {
          OR: [
            { invoiceNumber: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      });

      results.invoices = {
        data: invoices,
        total: totalInvoices,
        page: parseInt(String(page)),
        limit: searchLimit,
        totalPages: Math.ceil(totalInvoices / searchLimit)
      };
    }

    res.json({
      query: searchTerm,
      results,
      totalResults: Object.values(results).reduce((sum: number, result: any) => sum + result.total, 0)
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error while performing search' });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { q: query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = String(query);
    const suggestions: any = {};

    if (!type || type === 'users') {
      const userSuggestions = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: { id: true, name: true, email: true, role: { select: { name: true } } },
        take: 5,
        orderBy: { name: 'asc' }
      });
      suggestions.users = userSuggestions;
    }

    if (!type || type === 'courses') {
      const courseSuggestions = await prisma.course.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true
        },
        select: { id: true, name: true, code: true },
        take: 5,
        orderBy: { name: 'asc' }
      });
      suggestions.courses = courseSuggestions;
    }

    res.json({ suggestions });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Internal server error while fetching search suggestions' });
  }
});

export default router;
