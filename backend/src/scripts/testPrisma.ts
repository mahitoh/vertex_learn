import { prisma } from "../config/prisma";

async function testPrisma() {
  try {
    console.log("🔄 Testing Prisma database connection...");

    // Test database connection
    await prisma.$connect();
    console.log("✅ Prisma database connection established successfully.");

    // Test creating a user
    console.log("🔄 Creating test user...");
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password_hash: "hashed_password",
        role: "student",
        first_name: "Test",
        last_name: "User",
      },
    });
    console.log("✅ Created test user:", user);

    // Test finding the user
    console.log("🔄 Finding test user...");
    const foundUser = await prisma.user.findUnique({
      where: { user_id: user.user_id },
    });
    console.log("✅ Found user:", foundUser);

    // Test updating the user
    console.log("🔄 Updating test user...");
    const updatedUser = await prisma.user.update({
      where: { user_id: user.user_id },
      data: { first_name: "Updated Test" },
    });
    console.log("✅ Updated user:", updatedUser);

    // Test deleting the user
    console.log("🔄 Deleting test user...");
    await prisma.user.delete({
      where: { user_id: user.user_id },
    });
    console.log("✅ Deleted user");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);

    // Provide troubleshooting information
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Make sure PostgreSQL is running on your system");
    console.log("2. Verify your database credentials in the .env file");
    console.log('3. Ensure the database "vertex_learn" exists');
    console.log(
      '4. Check that the PostgreSQL user "postgres" has the correct password'
    );
    console.log(
      "5. If using a different setup, update the DATABASE_URL in .env"
    );
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
  }
}

// Run the test
testPrisma();
