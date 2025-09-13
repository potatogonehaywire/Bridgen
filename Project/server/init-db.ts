// Initialize database with sample data
export async function initializeDatabase() {
  console.log("🔄 Initializing database with sample data...");

  try {
    // Database tables and sample data are already set up in db.ts
    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
}
