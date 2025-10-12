/**
 * Script non-interactif pour créer un admin via arguments CLI
 * Usage: npm run create-admin-cli -- --email=admin@example.com --password=SecurePass123! --firstname=John --lastname=Doe
 */
import bcrypt from "bcrypt";
import { User } from "../models/user.model.ts";
import database from "../config/database.ts";
import env from "../config/env.ts";

const parseArgs = (): Record<string, string> => {
  const args: Record<string, string> = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key && value) {
      args[key] = value;
    }
  });
  return args;
};

async function createAdminCLI() {
  try {
    const args = parseArgs();

    // Validate required arguments
    const required = ["email", "password", "firstname", "lastname"];
    const missing = required.filter((field) => !args[field]);

    if (missing.length > 0) {
      console.error("❌ Missing required arguments:", missing.join(", "));
      console.log("\nUsage:");
      console.log(
        "  npm run create-admin-cli -- --email=admin@example.com --password=SecurePass123! --firstname=John --lastname=Doe\n"
      );
      process.exit(1);
    }

    const { email, password, firstname, lastname } = args;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format");
      process.exit(1);
    }

    // Validate password
    if (password.length < 12) {
      console.error("❌ Password must be at least 12 characters");
      process.exit(1);
    }

    // Connect to database
    await database.authenticate();
    console.log("✅ Database connected");

    await database.sync();

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (existingUser.isAdmin) {
        console.log("⚠️  Admin user already exists with this email");
        process.exit(0);
      }
      
      // Make existing user admin
      existingUser.isAdmin = true;
      existingUser.isVerified = true;
      await existingUser.save();
      console.log(`✅ User ${email} is now an admin!`);
      process.exit(0);
    }

    // Hash password
    const saltRounds = env.SALT_ROUNDS || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await User.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      isAdmin: true,
      isVerified: true,
    });

    console.log("\n✅ Admin account created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:     ${admin.email}`);
    console.log(`👤 Name:      ${admin.firstname} ${admin.lastname}`);
    console.log(`🆔 ID:        ${admin.id}`);
    console.log(`🔑 Admin:     Yes`);
    console.log(`✓  Verified:  Yes`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    process.exit(1);
  } finally {
    await database.close();
    process.exit(0);
  }
}

createAdminCLI();

