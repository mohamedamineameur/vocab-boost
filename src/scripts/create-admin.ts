import readline from "readline";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.ts";
import { Profile } from "../models/profile.model.ts";
import database from "../config/database.ts";
import env from "../config/env.ts";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

async function createAdmin() {
  try {
    console.log("\n🔐 Admin Account Creation Utility\n");
    console.log("================================\n");

    // Connect to database
    await database.authenticate();
    console.log("✅ Database connected\n");

    // Synchronize models
    await database.sync();

    // Get admin details
    const firstname = await question("First name: ");
    if (!firstname.trim()) {
      console.error("❌ First name is required");
      process.exit(1);
    }

    const lastname = await question("Last name: ");
    if (!lastname.trim()) {
      console.error("❌ Last name is required");
      process.exit(1);
    }

    let email = "";
    while (!validateEmail(email)) {
      email = await question("Email: ");
      if (!validateEmail(email)) {
        console.error("❌ Invalid email format. Please try again.\n");
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("\n⚠️  User with this email already exists.");
      const makeAdmin = await question("Do you want to make this user admin? (y/n): ");
      
      if (makeAdmin.toLowerCase() === "y" || makeAdmin.toLowerCase() === "yes") {
        existingUser.isAdmin = true;
        existingUser.isVerified = true;
        await existingUser.save();
        
        // Check if profile exists, if not create one
        const existingProfile = await Profile.findOne({ where: { userId: existingUser.id } });
        if (!existingProfile) {
          await Profile.create({
            userId: existingUser.id,
            local: "fr",
            theme: "light",
          });
          console.log(`\n✅ User ${email} is now an admin with profile created!\n`);
        } else {
          console.log(`\n✅ User ${email} is now an admin!\n`);
        }
        process.exit(0);
      } else {
        console.log("\n❌ Operation cancelled.\n");
        process.exit(1);
      }
    }

    let password = "";
    let passwordValidation = validatePassword(password);
    
    while (!passwordValidation.valid) {
      password = await question("Password (min 12 chars, 1 uppercase, 1 number, 1 special): ");
      passwordValidation = validatePassword(password);
      
      if (!passwordValidation.valid) {
        console.error("\n❌ Password does not meet requirements:");
        passwordValidation.errors.forEach((err) => console.error(`   - ${err}`));
        console.log("");
      }
    }

    const confirmPassword = await question("Confirm password: ");
    if (password !== confirmPassword) {
      console.error("\n❌ Passwords do not match!\n");
      process.exit(1);
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
      isVerified: true, // Auto-verify admin
    });

    // Create profile for admin
    await Profile.create({
      userId: admin.id,
      local: "fr",
      theme: "light",
    });

    console.log("\n✅ Admin account created successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:     ${admin.email}`);
    console.log(`👤 Name:      ${admin.firstname} ${admin.lastname}`);
    console.log(`🆔 ID:        ${admin.id}`);
    console.log(`🔑 Admin:     Yes`);
    console.log(`✓  Verified:  Yes`);
    console.log(`👤 Profile:   Created with default settings`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("🎉 You can now log in with these credentials.\n");

  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    process.exit(1);
  } finally {
    rl.close();
    await database.close();
    process.exit(0);
  }
}

// Run the script
createAdmin();

