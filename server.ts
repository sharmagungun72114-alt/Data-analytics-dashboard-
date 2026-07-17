import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb, initDb } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // Initialize and seed SQLite database
  try {
    await initDb();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }

  // --- API ROUTES ---

  // 1. POST /api/login
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const db = await getDb();
      // Allow logging in with either username or email
      const user = await db.get(
        'SELECT id, username, name, email, role FROM users WHERE (username = ? OR email = ?) AND password = ?',
        [username, username, password]
      );

      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials. You can use your username or email.' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 1b. POST /api/register
  app.post('/api/register', async (req, res) => {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    try {
      const db = await getDb();
      
      // Check if user already exists
      const existingUser = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username or email already registered.' });
      }

      await db.run(
        'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
        [username, password, name, email, 'Viewer']
      );

      const newUser = await db.get('SELECT id, username, name, email, role FROM users WHERE username = ?', [username]);
      res.json({ success: true, user: newUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 1c. POST /api/google-login
  app.post('/api/google-login', async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and name are required.' });
    }
    try {
      const db = await getDb();
      // Check if user exists by email
      let user = await db.get('SELECT id, username, name, email, role FROM users WHERE email = ?', [email]);
      
      if (!user) {
        // Automatically register Google user
        const username = email.split('@')[0];
        // Generate random secure-looking password
        const password = Math.random().toString(36).substring(2) + 'G!';
        await db.run(
          'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
          [username, password, name, email, 'Viewer']
        );
        user = await db.get('SELECT id, username, name, email, role FROM users WHERE email = ?', [email]);
      }
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 2. GET /api/dashboard
  app.get('/api/dashboard', async (req, res) => {
    try {
      const db = await getDb();

      // Total Revenue
      const revRow = await db.get('SELECT SUM(amount) as total FROM sales');
      const totalRevenue = revRow?.total || 0;

      // Total Sales (count of items sold)
      const salesRow = await db.get('SELECT SUM(items_sold) as total_items FROM sales');
      const totalSales = salesRow?.total_items || 0;

      // Total Customers
      const custRow = await db.get('SELECT COUNT(*) as count FROM customers');
      const totalCustomers = custRow?.count || 0;

      // Monthly Growth (comparing June 2026 vs July 2026)
      const juneRow = await db.get("SELECT SUM(amount) as total FROM sales WHERE date LIKE '2026-06%'");
      const julyRow = await db.get("SELECT SUM(amount) as total FROM sales WHERE date LIKE '2026-07%'");
      
      const juneRev = juneRow?.total || 0;
      const julyRev = julyRow?.total || 0;
      let monthlyGrowth = 0;
      if (juneRev > 0) {
        monthlyGrowth = parseFloat((((julyRev - juneRev) / juneRev) * 100).toFixed(2));
      } else if (julyRev > 0) {
        monthlyGrowth = 100; // If June has 0 but July has sales
      }

      // Sales Trend (Grouped by Month)
      const trendRows = await db.all(`
        SELECT SUBSTR(date, 1, 7) as month, SUM(amount) as amount, COUNT(id) as count 
        FROM sales 
        GROUP BY month 
        ORDER BY month ASC
      `);

      // Format month names for Chart.js display (e.g. "2026-01" -> "Jan")
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const salesTrend = trendRows.map(row => {
        const [year, m] = row.month.split('-');
        const name = monthNames[parseInt(m) - 1] || row.month;
        return {
          month: name,
          fullMonth: row.month,
          amount: parseFloat(row.amount.toFixed(2)),
          count: row.count
        };
      });

      // Revenue by Category
      const categoryRows = await db.all(`
        SELECT category, SUM(amount) as amount 
        FROM sales 
        GROUP BY category
      `);
      const categoryRevenue = categoryRows.map(row => ({
        category: row.category,
        amount: parseFloat(row.amount.toFixed(2))
      }));

      // Customer Distribution
      const distRows = await db.all(`
        SELECT status, COUNT(*) as count 
        FROM customers 
        GROUP BY status
      `);
      const customerDistribution = distRows.map(row => ({
        status: row.status,
        count: row.count
      }));

      res.json({
        success: true,
        kpis: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalSales,
          totalCustomers,
          monthlyGrowth
        },
        salesTrend,
        categoryRevenue,
        customerDistribution
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 3. GET /api/analytics
  app.get('/api/analytics', async (req, res) => {
    try {
      const db = await getDb();

      // Top Selling Products
      const topProducts = await db.all(`
        SELECT product_name as name, SUM(items_sold) as itemsSold, SUM(amount) as revenue
        FROM sales
        GROUP BY product_name
        ORDER BY revenue DESC
        LIMIT 5
      `);

      // Average Transaction Value
      const avgRow = await db.get('SELECT AVG(amount) as avg_amount FROM sales');
      const averageTransaction = parseFloat((avgRow?.avg_amount || 0).toFixed(2));

      // Sales Volume vs Value monthly breakdown
      const monthlyBreakdown = await db.all(`
        SELECT SUBSTR(date, 1, 7) as month, SUM(amount) as revenue, SUM(items_sold) as items
        FROM sales
        GROUP BY month
        ORDER BY month ASC
      `);

      res.json({
        success: true,
        topProducts,
        averageTransaction,
        monthlyBreakdown
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 4. GET /api/customers
  app.get('/api/customers', async (req, res) => {
    const { search, status, sortBy, sortOrder, page, limit } = req.query;

    try {
      const db = await getDb();
      let query = 'SELECT * FROM customers WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) as count FROM customers WHERE 1=1';
      const params: any[] = [];

      if (search) {
        const searchPattern = `%${search}%`;
        query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (status && status !== 'All') {
        query += ' AND status = ?';
        countQuery += ' AND status = ?';
        params.push(status);
      }

      // Order by
      if (sortBy) {
        const validColumns = ['name', 'email', 'revenue', 'signup_date', 'status'];
        if (validColumns.includes(sortBy as string)) {
          const order = (sortOrder as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          query += ` ORDER BY ${sortBy} ${order}`;
        }
      } else {
        query += ' ORDER BY id DESC';
      }

      // Pagination
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const offset = (pageNum - 1) * limitNum;

      query += ' LIMIT ? OFFSET ?';
      const selectParams = [...params, limitNum, offset];

      // Execute queries
      const countRow = await db.get(countQuery, params);
      const totalCount = countRow?.count || 0;
      const customers = await db.all(query, selectParams);

      res.json({
        success: true,
        customers,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 5. GET /api/reports
  app.get('/api/reports', async (req, res) => {
    const { search, category, status } = req.query;
    try {
      const db = await getDb();
      let query = 'SELECT * FROM reports WHERE 1=1';
      const params: any[] = [];

      if (search) {
        const searchPattern = `%${search}%`;
        query += ' AND (title LIKE ? OR description LIKE ? OR created_by LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (status && status !== 'All') {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const reports = await db.all(query, params);
      res.json({ success: true, reports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 6. POST /api/import
  app.post('/api/import', async (req, res) => {
    const { type, data } = req.body;

    if (!type || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'Invalid import format. Need type ("customers" | "sales") and data array.' });
    }

    try {
      const db = await getDb();
      let insertedCount = 0;

      if (type === 'customers') {
        const stmt = await db.prepare(
          'INSERT INTO customers (name, email, phone, revenue, signup_date, status) VALUES (?, ?, ?, ?, ?, ?)'
        );
        for (const item of data) {
          if (item.name && item.email) {
            await stmt.run([
              item.name,
              item.email,
              item.phone || '',
              parseFloat(item.revenue) || 0.0,
              item.signup_date || new Date().toISOString().split('T')[0],
              item.status || 'Active'
            ]);
            insertedCount++;
          }
        }
        await stmt.finalize();
      } else if (type === 'sales') {
        const stmt = await db.prepare(
          'INSERT INTO sales (date, amount, category, items_sold, product_name) VALUES (?, ?, ?, ?, ?)'
        );
        for (const item of data) {
          if (item.date && item.amount && item.product_name) {
            await stmt.run([
              item.date,
              parseFloat(item.amount),
              item.category || 'General',
              parseInt(item.items_sold) || 1,
              item.product_name
            ]);
            insertedCount++;
          }
        }
        await stmt.finalize();
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported import type.' });
      }

      res.json({ success: true, message: `Successfully imported ${insertedCount} records into ${type}.` });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 7. GET /api/export
  app.get('/api/export', async (req, res) => {
    const { type } = req.query;

    if (type !== 'customers' && type !== 'sales') {
      return res.status(400).send('Invalid export type requested. Must be "customers" or "sales".');
    }

    try {
      const db = await getDb();
      let csvContent = '';

      if (type === 'customers') {
        const rows = await db.all('SELECT * FROM customers ORDER BY name ASC');
        csvContent += 'ID,Name,Email,Phone,Revenue,Signup Date,Status\n';
        for (const row of rows) {
          // Escape quotes and commas in CSV fields
          const name = `"${row.name.replace(/"/g, '""')}"`;
          const email = `"${row.email.replace(/"/g, '""')}"`;
          const phone = `"${(row.phone || '').replace(/"/g, '""')}"`;
          csvContent += `${row.id},${name},${email},${phone},${row.revenue},${row.signup_date},${row.status}\n`;
        }
      } else {
        const rows = await db.all('SELECT * FROM sales ORDER BY date DESC');
        csvContent += 'ID,Date,Amount,Category,Items Sold,Product Name\n';
        for (const row of rows) {
          const cat = `"${row.category.replace(/"/g, '""')}"`;
          const prod = `"${row.product_name.replace(/"/g, '""')}"`;
          csvContent += `${row.id},${row.date},${row.amount},${cat},${row.items_sold},${prod}\n`;
        }
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
      res.status(200).send(csvContent);
    } catch (error: any) {
      res.status(500).send(`Export failed: ${error.message}`);
    }
  });

  // 8. PUT /api/profile
  // Allows updating the profile locally (stored in SQLite) or simple user status edit
  app.put('/api/profile', async (req, res) => {
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
      return res.status(400).json({ success: false, message: 'ID, name, and email are required.' });
    }
    try {
      const db = await getDb();
      await db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, id]
      );
      const updatedUser = await db.get('SELECT id, username, name, email, role FROM users WHERE id = ?', [id]);
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // --- VITE MIDDLEWARE CONFIGURATION ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
