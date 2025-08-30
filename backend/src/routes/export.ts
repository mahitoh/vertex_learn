import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Export student data
router.get('/students', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { format = 'json', includeGrades = 'false', includeAttendance = 'false' } = req.query;
    
    const students = await prisma.user.findMany({
      where: { role: { name: 'student' } },
      include: {
        role: { select: { name: true } },
        ...(includeGrades === 'true' && {
          grades: {
            include: { course: { select: { name: true, code: true } } }
          }
        }),
        ...(includeAttendance === 'true' && {
          attendance: {
            include: { course: { select: { name: true, code: true } } }
          }
        })
      },
      orderBy: { name: 'asc' }
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = students.map(student => ({
        ID: student.id,
        Name: student.name,
        Email: student.email,
        StudentID: student.studentId || '',
        Class: student.class || '',
        RollNumber: student.rollNumber || '',
        Department: student.department || '',
        JoinDate: student.admissionDate || '',
        Status: student.isActive ? 'Active' : 'Inactive'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      
      const csv = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      res.send(csv);
    } else {
      res.json({ students });
    }

  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ error: 'Internal server error while exporting students' });
  }
});

// Export course data
router.get('/courses', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { format = 'json', includeEnrollments = 'false' } = req.query;
    
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { name: true, email: true } },
        ...(includeEnrollments === 'true' && {
          _count: { enrollments: true }
        })
      },
      orderBy: { name: 'asc' }
    });

    if (format === 'csv') {
      const csvData = courses.map(course => ({
        ID: course.id,
        Name: course.name,
        Code: course.code,
        Credits: course.credits,
        Description: course.description || '',
        Instructor: course.instructor.name,
        InstructorEmail: course.instructor.email,
        Status: course.isActive ? 'Active' : 'Inactive',
        Enrollments: includeEnrollments === 'true' ? course._count?.enrollments || 0 : ''
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=courses.csv');
      
      const csv = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      res.send(csv);
    } else {
      res.json({ courses });
    }

  } catch (error) {
    console.error('Export courses error:', error);
    res.status(500).json({ error: 'Internal server error while exporting courses' });
  }
});

// Export grades report
router.get('/grades', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { format = 'json', courseId, studentId } = req.query;
    
    const where: any = {};
    if (courseId) where.courseId = parseInt(String(courseId));
    if (studentId) where.studentId = parseInt(String(studentId));

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: { select: { name: true, email: true, studentId: true } },
        course: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      const csvData = grades.map(grade => ({
        StudentID: grade.student.studentId || '',
        StudentName: grade.student.name,
        StudentEmail: grade.student.email,
        CourseCode: grade.course.code,
        CourseName: grade.course.name,
        AssignmentType: grade.assignmentType,
        Score: grade.score,
        MaxScore: grade.maxScore,
        Percentage: grade.percentage,
        Comments: grade.comments || '',
        Date: grade.createdAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=grades.csv');
      
      const csv = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      res.send(csv);
    } else {
      res.json({ grades });
    }

  } catch (error) {
    console.error('Export grades error:', error);
    res.status(500).json({ error: 'Internal server error while exporting grades' });
  }
});

// Export financial data
router.get('/financial', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { format = 'json', type = 'all' } = req.query;
    
    let data: any = {};

    if (type === 'all' || type === 'invoices') {
      const invoices = await prisma.invoice.findMany({
        include: { student: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      data.invoices = invoices;
    }

    if (type === 'all' || type === 'payments') {
      const payments = await prisma.payment.findMany({
        include: { 
          student: { select: { name: true, email: true } },
          invoice: { select: { invoiceNumber: true } }
        },
        orderBy: { paymentDate: 'desc' }
      });
      data.payments = payments;
    }

    if (type === 'all' || type === 'expenses') {
      const expenses = await prisma.expense.findMany({
        orderBy: { date: 'desc' }
      });
      data.expenses = expenses;
    }

    if (format === 'csv') {
      // For CSV, we'll export the main type requested
      let csvData: any[] = [];
      let filename = '';

      if (type === 'invoices' || type === 'all') {
        csvData = data.invoices?.map((invoice: any) => ({
          InvoiceNumber: invoice.invoiceNumber,
          StudentName: invoice.student.name,
          StudentEmail: invoice.student.email,
          Amount: invoice.amount,
          Description: invoice.description,
          DueDate: invoice.dueDate,
          Status: invoice.status,
          CreatedDate: invoice.createdAt
        })) || [];
        filename = 'invoices.csv';
      } else if (type === 'payments') {
        csvData = data.payments?.map((payment: any) => ({
          PaymentID: payment.id,
          InvoiceNumber: payment.invoice.invoiceNumber,
          StudentName: payment.student.name,
          StudentEmail: payment.student.email,
          Amount: payment.amount,
          PaymentMethod: payment.paymentMethod,
          PaymentDate: payment.paymentDate,
          Status: payment.status
        })) || [];
        filename = 'payments.csv';
      } else if (type === 'expenses') {
        csvData = data.expenses?.map((expense: any) => ({
          ID: expense.id,
          Category: expense.category,
          Amount: expense.amount,
          Description: expense.description,
          Date: expense.date,
          Receipt: expense.receipt || ''
        })) || [];
        filename = 'expenses.csv';
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      const csv = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      res.send(csv);
    } else {
      res.json(data);
    }

  } catch (error) {
    console.error('Export financial data error:', error);
    res.status(500).json({ error: 'Internal server error while exporting financial data' });
  }
});

export default router;
