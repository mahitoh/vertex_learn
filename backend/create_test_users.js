import bcrypt from "bcrypt";
import pkg from "pg";
const { Client } = pkg;

async function createTestUsers() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5432/vertex_learn",
  });

  try {
    await client.connect();

    // First, get available organizations
    console.log("Available organizations:");
    const orgsResult = await client.query(
      "SELECT id, name, code FROM organizations WHERE status = $1",
      ["approved"]
    );
    orgsResult.rows.forEach((org) =>
      console.log(`- ${org.name} (ID: ${org.id}, Code: ${org.code})`)
    );

    if (orgsResult.rows.length === 0) {
      console.log("No approved organizations found. Cannot create users.");
      return;
    }

    // Get role IDs
    const rolesResult = await client.query(
      "SELECT id, name FROM roles WHERE name IN ($1, $2)",
      ["teacher", "student"]
    );
    const teacherRole = rolesResult.rows.find((r) => r.name === "teacher");
    const studentRole = rolesResult.rows.find((r) => r.name === "student");

    console.log("\nRoles found:");
    console.log(`- Teacher role ID: ${teacherRole?.id}`);
    console.log(`- Student role ID: ${studentRole?.id}`);

    if (!teacherRole || !studentRole) {
      console.log("Required roles not found. Cannot create users.");
      return;
    }

    // Hash password for all test users
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use the first approved organization
    const orgId = orgsResult.rows[0].id;
    const orgName = orgsResult.rows[0].name;

    console.log(
      `\nCreating test users for organization: ${orgName} (ID: ${orgId})`
    );

    // Create test teachers
    const teachers = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@teacher.com",
        employeeId: "TEACH001",
        department: "Mathematics",
        position: "Senior Teacher",
        phone: "555-0101",
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@teacher.com",
        employeeId: "TEACH002",
        department: "English",
        position: "Teacher",
        phone: "555-0102",
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@teacher.com",
        employeeId: "TEACH003",
        department: "Science",
        position: "Head of Department",
        phone: "555-0103",
      },
    ];

    // Create test students
    const students = [
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@student.com",
        studentId: "STU001",
        class: "Grade 10A",
        rollNumber: "G10A001",
        phone: "555-0201",
      },
      {
        firstName: "James",
        lastName: "Wilson",
        email: "james.wilson@student.com",
        studentId: "STU002",
        class: "Grade 10A",
        rollNumber: "G10A002",
        phone: "555-0202",
      },
      {
        firstName: "Olivia",
        lastName: "Garcia",
        email: "olivia.garcia@student.com",
        studentId: "STU003",
        class: "Grade 11B",
        rollNumber: "G11B001",
        phone: "555-0203",
      },
      {
        firstName: "William",
        lastName: "Martinez",
        email: "william.martinez@student.com",
        studentId: "STU004",
        class: "Grade 11B",
        rollNumber: "G11B002",
        phone: "555-0204",
      },
    ];

    // Insert teachers
    console.log("\nCreating teachers...");
    for (const teacher of teachers) {
      try {
        await client.query(
          `
          INSERT INTO users (
            name, email, password_hash, role_id, organization_id,
            employee_id, department, position, phone, is_active, approval_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
          [
            `${teacher.firstName} ${teacher.lastName}`,
            teacher.email,
            hashedPassword,
            teacherRole.id,
            orgId,
            teacher.employeeId,
            teacher.department,
            teacher.position,
            teacher.phone,
            true,
            "approved",
          ]
        );
        console.log(
          `✓ Created teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`
        );
      } catch (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          console.log(`- Teacher ${teacher.email} already exists`);
        } else {
          console.error(
            `Error creating teacher ${teacher.email}:`,
            error.message
          );
        }
      }
    }

    // Insert students
    console.log("\nCreating students...");
    for (const student of students) {
      try {
        await client.query(
          `
          INSERT INTO users (
            name, email, password_hash, role_id, organization_id,
            student_id, class, roll_number, phone, is_active, approval_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
          [
            `${student.firstName} ${student.lastName}`,
            student.email,
            hashedPassword,
            studentRole.id,
            orgId,
            student.studentId,
            student.class,
            student.rollNumber,
            student.phone,
            true,
            "approved",
          ]
        );
        console.log(
          `✓ Created student: ${student.firstName} ${student.lastName} (${student.email})`
        );
      } catch (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          console.log(`- Student ${student.email} already exists`);
        } else {
          console.error(
            `Error creating student ${student.email}:`,
            error.message
          );
        }
      }
    }

    console.log("\n=== TEST CREDENTIALS ===");
    console.log("Password for all test accounts: password123");
    console.log("\nTeacher Accounts:");
    teachers.forEach((teacher) => {
      console.log(
        `- ${teacher.firstName} ${teacher.lastName}: ${teacher.email}`
      );
    });

    console.log("\nStudent Accounts:");
    students.forEach((student) => {
      console.log(
        `- ${student.firstName} ${student.lastName}: ${student.email}`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

createTestUsers().catch(console.error);
