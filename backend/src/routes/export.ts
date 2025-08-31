import { Router, Request, Response } from 'express';
import { query } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Export student data
router.get('/students', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { format = 'json', includeGrades = 'false', includeAttendance = 'false' } = req.query;
    
    // Get students with role information
    const studentsQuery = `
      SELECT u.*, r.name as roleName 
      FROM users u
      JOIN roles r ON u.roleId = r.id
      WHERE r.name = 'student'
      ORDER BY u.name ASC
    `;
    
    const studentsResult = await query(studentsQuery, []);
    let students = studentsResult.rows;
    
    // If grades are requested, fetch them separately
    if (includeGrades === 'true') {
      const gradesQuery = `
        SELECT g.*, c.name as courseName, c.code as courseCode, u.id as userId
        FROM grades g
        JOIN courses c ON g.courseId = c.id
        JOIN users u ON g.userId = u.id
        JOIN roles r ON u.roleId = r.id
        WHERE r.name = 'student'
      `;
      
      const gradesResult = await query(gradesQuery, []);
      const gradesMap = {};
      
      // Group grades by userId
      gradesResult.rows.forEach(grade => {
        if (!gradesMap[grade.userId]) {
          gradesMap[grade.userId] = [];
        }
        gradesMap[grade.userId].push({
          ...grade,
          course: {
            name: grade.courseName,
            code: grade.courseCode
          }
        });
      });
      
      // Add grades to each student
      students = students.map(student => ({
        ...student,
        grades: gradesMap[student.id] || [],
        role: { name: student.roleName }
      }));
    } else {
      // Just add role information
      students = students.map(student => ({
        ...student,
        role: { name: student.roleName }
      }));
    }
    
    // If attendance is requested, fetch it separately
    if (includeAttendance === 'true') {
      const attendanceQuery = `
        SELECT a.*, c.name as courseName, c.code as courseCode, u.id as userId
        FROM attendance a
        JOIN courses c ON a.courseId = c.id
        JOIN users u ON a.userId = u.id
        JOIN roles r ON u.roleId = r.id
        WHERE r.name = 'student'
      `;
      
      const attendanceResult = await query(attendanceQuery, []);
      const attendanceMap = {};
      
      // Group attendance by userId
      attendanceResult.rows.forEach(attendance => {
        if (!attendanceMap[attendance.userId]) {
          attendanceMap[attendance.userId] = [];
        }
        attendanceMap[attendance.userId].push({
          ...attendance,
          course: {
            name: attendance.courseName,
            code: attendance.courseCode
          }
        });
      });
      
      // Add attendance to each student
      students = students.map(student => ({
        ...student,
        attendance: attendanceMap[student.id] || []
      }));
    }

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
    
    // Get courses with instructor information
    const coursesQuery = `
      SELECT c.*, u.name as instructorName, u.email as instructorEmail
      FROM courses c
      JOIN users u ON c.instructorId = u.id
      ORDER BY c.name ASC
    `;
    
    const coursesResult = await query(coursesQuery, []);
    let courses = coursesResult.rows.map(course => ({
      ...course,
      instructor: {
        name: course.instructorName,
        email: course.instructorEmail
      }
    }));
    
    // If enrollments count is requested, fetch it separately
    if (includeEnrollments === 'true') {
      const enrollmentsQuery = `
        SELECT courseId, COUNT(*) as enrollmentCount
        FROM enrollments
        GROUP BY courseId
      `;
      
      const enrollmentsResult = await query(enrollmentsQuery, []);
      const enrollmentsMap = {};
      
      enrollmentsResult.rows.forEach(row => {
        enrollmentsMap[row.courseId] = row.enrollmentCount;
      });
      
      // Add enrollment counts to each course
      courses = courses.map(course => ({
        ...course,
        _count: {
          enrollments: enrollmentsMap[course.id] || 0
        }
      }));
    }

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
    
    // Build the WHERE clause for the SQL query
    let whereClause = '';
    const queryParams = [];
    
    if (courseId) {
      whereClause += ' AND g.courseId = ?';
      queryParams.push(parseInt(String(courseId)));
    }
    
    if (studentId) {
      whereClause += ' AND g.userId = ?';
      queryParams.push(parseInt(String(studentId)));
    }
    
    // Get grades with student and course information
    const gradesQuery = `
      SELECT g.*, 
             u.name as studentName, u.email as studentEmail, u.studentId as studentIdNumber,
             c.name as courseName, c.code as courseCode
      FROM grades g
      JOIN users u ON g.userId = u.id
      JOIN courses c ON g.courseId = c.id
      WHERE 1=1 ${whereClause}
      ORDER BY g.createdAt DESC
    `;
    
    const gradesResult = await query(gradesQuery, queryParams);
    const grades = gradesResult.rows.map(grade => ({
      ...grade,
      student: {
        name: grade.studentName,
        email: grade.studentEmail,
        studentId: grade.studentIdNumber
      },
      course: {
        name: grade.courseName,
        code: grade.courseCode
      }
    }));

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
      const invoicesQuery = `
        SELECT i.*, u.name as studentName, u.email as studentEmail
        FROM invoices i
        JOIN users u ON i.userId = u.id
        ORDER BY i.createdAt DESC
      `;
      
      const invoicesResult = await query(invoicesQuery, []);
      data.invoices = invoicesResult.rows.map(invoice => ({
        ...invoice,
        student: {
          name: invoice.studentName,
          email: invoice.studentEmail
        }
      }));
    }

    if (type === 'all' || type === 'payments') {
      const paymentsQuery = `
        SELECT p.*, u.name as studentName, u.email as studentEmail, i.invoiceNumber
        FROM payments p
        JOIN users u ON p.userId = u.id
        JOIN invoices i ON p.invoiceId = i.id
        ORDER BY p.paymentDate DESC
      `;
      
      const paymentsResult = await query(paymentsQuery, []);
      data.payments = paymentsResult.rows.map(payment => ({
        ...payment,
        student: {
          name: payment.studentName,
          email: payment.studentEmail
        },
        invoice: {
          invoiceNumber: payment.invoiceNumber
        }
      }));
    }

    if (type === 'all' || type === 'expenses') {
      const expensesQuery = `
        SELECT * FROM expenses
        ORDER BY date DESC
      `;
      
      const expensesResult = await query(expensesQuery, []);
      data.expenses = expensesResult.rows;
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
