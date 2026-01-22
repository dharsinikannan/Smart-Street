require("dotenv").config();
const db = require("./db");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const seed = async () => {
  console.log("🌱 Starting Database Seed...");

  try {
    // 1. Drop existing tables and types
    console.log("🔥 Dropping existing tables and types...");
    await db.query(`
      DROP TABLE IF EXISTS 
        notifications, 
        audit_logs, 
        permits, 
        space_requests, 
        spaces, 
        owners, 
        vendors, 
        users 
      CASCADE;

      DROP TYPE IF EXISTS 
        notification_type,
        permit_status,
        request_status,
        user_role
      CASCADE;
    `);

    // 2. Re-create schema
    console.log("🏗️ Re-creating schema from sql file...");
    const schemaPath = path.join(__dirname, "database", "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    
    // Remove comments and execute
    // Simple split by ; might fail if ; is in string, but schema.sql looks simple enough.
    // Better: use the same logic as setup-db.js or just run the whole thing if the driver supports it.
    // pg driver usually supports multiple statements if passed in one query.
    await db.query(schemaSQL);
    console.log("✅ Schema created.");

    // 3. Insert Users
    console.log("👥 Inserting Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Admin
    const adminRes = await db.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ('Admin User', 'admin@example.com', $1, 'ADMIN', '1234567890')
      RETURNING user_id;
    `, [hashedPassword]);
    const adminId = adminRes.rows[0].user_id;

    // Owner
    const ownerUserRes = await db.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ('John Owner', 'owner@example.com', $1, 'OWNER', '0987654321')
      RETURNING user_id;
    `, [hashedPassword]);
    const ownerUserId = ownerUserRes.rows[0].user_id;

    // Vendor
    const vendorUserRes = await db.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ('Alice Vendor', 'vendor@example.com', $1, 'VENDOR', '1122334455')
      RETURNING user_id;
    `, [hashedPassword]);
    const vendorUserId = vendorUserRes.rows[0].user_id;

    // 4. Insert Profiles
    console.log("📝 Inserting Profiles...");
    
    // Owner Profile
    const ownerRes = await db.query(`
      INSERT INTO owners (user_id, owner_name, contact_info)
      VALUES ($1, 'John Owner', '0987654321')
      RETURNING owner_id;
    `, [ownerUserId]);
    const ownerId = ownerRes.rows[0].owner_id;

    // Vendor Profile
    const vendorRes = await db.query(`
      INSERT INTO vendors (user_id, business_name, category, license_number, verified)
      VALUES ($1, 'Alice Food Truck', 'Food & Beverage', 'LIC-2024-001', true)
      RETURNING vendor_id;
    `, [vendorUserId]);
    const vendorId = vendorRes.rows[0].vendor_id;

    // 5. Insert Space
    console.log("📍 Inserting Space...");
    const spaceRes = await db.query(`
      INSERT INTO spaces (owner_id, space_name, address, allowed_radius, center)
      VALUES (
        $1, 
        'Downtown Spot #1', 
        '123 Main St, Cityville', 
        50.0, 
        ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)
      )
      RETURNING space_id;
    `, [ownerId]);
    const spaceId = spaceRes.rows[0].space_id;

    // 6. Insert Request
    console.log("📨 Inserting Space Request...");
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24); // Tomorrow
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 4); // 4 hours duration

    await db.query(`
      INSERT INTO space_requests (
        vendor_id, 
        space_id, 
        center, 
        max_width, 
        max_length, 
        start_time, 
        end_time, 
        status
      )
      VALUES (
        $1, 
        $2, 
        ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326), 
        3.0, 
        4.0, 
        $3, 
        $4, 
        'PENDING'
      );
    `, [vendorId, spaceId, startTime.toISOString(), endTime.toISOString()]);

    console.log("✨ Seed completed successfully!");

  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    db.pool.end();
  }
};

seed();
