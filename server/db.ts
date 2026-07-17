import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const dbPath = path.join(process.cwd(), 'database.sqlite');
  
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return dbInstance;
}

export async function initDb() {
  const db = await getDb();

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      email TEXT,
      role TEXT
    )
  `);

  // Create Customers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      revenue REAL,
      signup_date TEXT,
      status TEXT
    )
  `);

  // Create Sales table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      amount REAL,
      category TEXT,
      items_sold INTEGER,
      product_name TEXT
    )
  `);

  // Create Reports table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      created_by TEXT,
      created_at TEXT,
      status TEXT,
      description TEXT
    )
  `);

  // Seed default admin user if not exists
  const adminExists = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    await db.run(
      'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin123', 'Administrator', 'admin@company.com', 'Administrator']
    );
  }

  // Seed customers if empty
  const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');
  if (customerCount && (customerCount as any).count === 0) {
    const defaultCustomers = [
      ['Acme Corporation', 'billing@acme.com', '+1 (555) 019-2834', 45200.00, '2026-01-15', 'Active'],
      ['Globex Corporation', 'finance@globex.com', '+1 (555) 014-9382', 12500.50, '2026-02-10', 'Active'],
      ['Initech Corp', 'accounts@initech.com', '+1 (555) 017-4829', 32000.00, '2026-03-05', 'Active'],
      ['Umbrella Corp', 'procurement@umbrella.com', '+1 (555) 012-9847', 8900.00, '2026-03-22', 'Inactive'],
      ['Hooli Inc', 'billing@hooli.xyz', '+1 (555) 015-1122', 75000.00, '2026-04-01', 'Active'],
      ['Soylent Corp', 'supply@soylent.com', '+1 (555) 011-3344', 15400.00, '2026-04-18', 'Active'],
      ['Initech Software', 'sales@initech-soft.com', '+1 (555) 018-8833', 6200.00, '2026-05-12', 'Active'],
      ['Vehement Capital', 'info@vehement.co', '+1 (555) 013-5566', 112000.00, '2026-05-29', 'Active'],
      ['Massive Dynamic', 'contracts@massivedynamic.org', '+1 (555) 016-7788', 9500.00, '2026-06-11', 'Inactive'],
      ['Wayne Enterprises', 'bwayne@waynecorp.com', '+1 (555) 010-0077', 185000.00, '2026-06-25', 'Active'],
      ['Stark Industries', 'pepper@stark.com', '+1 (555) 019-3000', 210000.00, '2026-07-02', 'Active'],
      ['Tyrell Corp', 'replicant@tyrell.io', '+1 (555) 014-2019', 41200.00, '2026-07-10', 'Active']
    ];

    for (const cust of defaultCustomers) {
      await db.run(
        'INSERT INTO customers (name, email, phone, revenue, signup_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        cust
      );
    }
  }

  // Seed sales if empty
  const salesCount = await db.get('SELECT COUNT(*) as count FROM sales');
  if (salesCount && (salesCount as any).count === 0) {
    const defaultSales = [
      // 2026-01
      ['2026-01-05', 1200.00, 'Electronics', 3, 'Smart Monitor 4K'],
      ['2026-01-12', 4500.00, 'Software', 1, 'Enterprise SaaS License'],
      ['2026-01-18', 350.00, 'Office Supplies', 10, 'Ergonomic Desk Organizer'],
      ['2026-01-25', 2400.00, 'Furniture', 2, 'Executive Office Chair'],
      
      // 2026-02
      ['2026-02-02', 800.00, 'Electronics', 2, 'Mechanical Keyboard Pro'],
      ['2026-02-10', 5000.00, 'Software', 1, 'Data Analytics Suite License'],
      ['2026-02-15', 150.00, 'Office Supplies', 5, 'Heavy Duty Stapler'],
      ['2026-02-22', 1800.00, 'Furniture', 1, 'Electric Standing Desk'],
      ['2026-02-28', 1100.00, 'Electronics', 1, 'Noise Cancelling Headphones'],

      // 2026-03
      ['2026-03-04', 1500.00, 'Electronics', 5, 'Portable USB-C Dock'],
      ['2026-03-12', 6200.00, 'Software', 2, 'Cloud Server Backup Subscription'],
      ['2026-03-19', 420.00, 'Office Supplies', 12, 'Eco Whiteboard Marker Set'],
      ['2026-03-24', 3500.00, 'Furniture', 4, 'Conference Room Table'],
      ['2026-03-31', 950.00, 'Electronics', 1, 'Acoustic Conference Speaker'],

      // 2026-04
      ['2026-04-05', 2100.00, 'Electronics', 7, 'Vertical Mouse wireless'],
      ['2026-04-12', 8500.00, 'Software', 1, 'Machine Learning Model Builder'],
      ['2026-04-19', 600.00, 'Office Supplies', 15, 'Recycled Printer Paper Box'],
      ['2026-04-26', 1200.00, 'Furniture', 1, 'Lounge Visitor Armchair'],

      // 2026-05
      ['2026-05-03', 3100.00, 'Electronics', 2, 'UltraWide Dual Monitor Setup'],
      ['2026-05-11', 11000.00, 'Software', 11, 'Developer API Seat Renewals'],
      ['2026-05-18', 850.00, 'Office Supplies', 8, 'Secure Document Shredder'],
      ['2026-05-24', 4500.00, 'Furniture', 3, 'Modular Bookshelf Units'],
      ['2026-05-30', 2500.00, 'Electronics', 10, 'HD Webcam 1080p'],

      // 2026-06
      ['2026-06-02', 1900.00, 'Electronics', 1, 'Tablet Pro LTE 256GB'],
      ['2026-06-10', 14200.00, 'Software', 1, 'AI-driven Customer Insights Platform'],
      ['2026-06-17', 550.00, 'Office Supplies', 20, 'Fountain Pen Gift Set'],
      ['2026-06-24', 5800.00, 'Furniture', 6, 'Adjustable Acoustic Screens'],

      // 2026-07 (Up to current mid-month)
      ['2026-07-01', 3400.00, 'Electronics', 2, 'Mobile Test Devices Premium'],
      ['2026-07-06', 16500.00, 'Software', 3, 'HR Payroll ERP License Year 1'],
      ['2026-07-11', 400.00, 'Office Supplies', 4, 'Label Maker Professional'],
      ['2026-07-15', 7200.00, 'Furniture', 2, 'Glass Magnetic Partition Board']
    ];

    for (const sale of defaultSales) {
      await db.run(
        'INSERT INTO sales (date, amount, category, items_sold, product_name) VALUES (?, ?, ?, ?, ?)',
        sale
      );
    }
  }

  // Seed reports if empty
  const reportsCount = await db.get('SELECT COUNT(*) as count FROM reports');
  if (reportsCount && (reportsCount as any).count === 0) {
    const defaultReports = [
      ['Q1 Business Operations Review', 'Financial', 'Admin User', '2026-04-10', 'Published', 'Comprehensive assessment of revenues, hardware costs, and software subscriptions of Q1.'],
      ['SaaS Monthly Recurring Audit', 'Audit', 'Admin User', '2026-05-15', 'Published', 'Detailed recurring license tracking and seat expansion metrics across current subscribers.'],
      ['Employee Hardware Resource Planning', 'Operations', 'IT Operations', '2026-06-01', 'Published', 'Forecasts the procurement of monitors, chairs, and input accessories for the next expansion phase.'],
      ['Customer Churn Analysis H1', 'Marketing', 'Data Science Group', '2026-06-20', 'Draft', 'Exploratory metrics tracking high-value accounts that went inactive or downgraded licenses.'],
      ['FY26 Midyear Financial Statement', 'Financial', 'Chief Accountant', '2026-07-12', 'Pending', 'Official ledger balances, cumulative sales totals, and tax forecasts for review.']
    ];

    for (const rep of defaultReports) {
      await db.run(
        'INSERT INTO reports (title, category, created_by, created_at, status, description) VALUES (?, ?, ?, ?, ?, ?)',
        rep
      );
    }
  }

  console.log('Database successfully initialized and seeded.');
}
