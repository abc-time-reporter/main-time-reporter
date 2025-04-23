const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Empty string for null password
  database: 'login_db',
  multipleStatements: true // Allow multiple statements
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database: login_db');
  
  // Create database if it doesn't exist
  db.query('CREATE DATABASE IF NOT EXISTS login_db', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database login_db ready');
    
    // Use the database
    db.query('USE login_db', (err) => {
      if (err) {
        console.error('Error using database:', err);
        return;
      }
      console.log('Using database: login_db');
      
      // Create users table if it doesn't exist
      const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        )
      `;
      
      // Create time_entries table if it doesn't exist
      const createTimeEntriesTableQuery = `
        CREATE TABLE IF NOT EXISTS time_entries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          date DATE NOT NULL,
          clock_in_time DATETIME NOT NULL,
          clock_out_time DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `;
      
      db.query(createUsersTableQuery, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
        } else {
          console.log('Users table ready');
        }
      });

      db.query(createTimeEntriesTableQuery, (err) => {
        if (err) {
          console.error('Error creating time_entries table:', err);
        } else {
          console.log('Time entries table ready');
        }
      });
    });
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('\n=== Registration Attempt ===');
  console.log('Username:', username);
  console.log('Password:', password);

  if (!username || !password) {
    console.log('Error: Missing username or password');
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (password.length < 6) {
    console.log('Error: Password too short');
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  // Check if username already exists
  const checkQuery = 'SELECT * FROM login_db.users WHERE username = ?';
  console.log('Checking if username exists:', checkQuery);
  
  db.query(checkQuery, [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    console.log('Existing users found:', results.length);

    if (results.length > 0) {
      console.log('Error: Username already exists');
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    try {
      // Hash password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');

      // Insert new user
      const insertQuery = 'INSERT INTO login_db.users (username, password) VALUES (?, ?)';
      console.log('Inserting new user...');
      
      db.query(insertQuery, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ success: false, message: 'Error creating user' });
        }
        
        console.log('User created successfully');
        console.log('User ID:', result.insertId);
        res.json({ success: true, message: 'User registered successfully' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ success: false, message: 'Error processing registration' });
    }
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('\n=== Login Attempt ===');
  console.log('Username:', username);
  console.log('Password:', password);

  if (!username || !password) {
    console.log('Error: Missing username or password');
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const query = 'SELECT * FROM login_db.users WHERE username = ?';
  console.log('Executing query:', query);
  console.log('Query parameters:', [username]);
  
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    console.log('\n=== Database Results ===');
    console.log('Number of results:', results.length);
    console.log('Results:', JSON.stringify(results, null, 2));

    if (results.length === 0) {
      console.log('Error: User not found');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = results[0];
    console.log('\n=== User Found ===');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('Stored password hash:', user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('\n=== Password Check ===');
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('Error: Password does not match');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    console.log('\n=== Login Successful ===');
    console.log('Generated token:', token);
    console.log('User ID:', user.id);
    console.log('========================\n');

    res.json({ success: true, token, userId: user.id });
  });
});

// Clock in endpoint
app.post('/api/time-entries/clock-in', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const now = new Date();
  
  const query = `
    INSERT INTO time_entries (user_id, date, clock_in_time)
    VALUES (?, ?, ?)
  `;
  
  db.query(query, [userId, now, now], (err, result) => {
    if (err) {
      console.error('Error clocking in:', err);
      return res.status(500).json({ success: false, message: 'Error clocking in' });
    }
    
    res.json({
      success: true,
      timeEntry: {
        id: result.insertId,
        userId,
        date: now,
        clockInTime: now
      }
    });
  });
});

// Clock out endpoint
app.patch('/api/time-entries/:id/clock-out', verifyToken, (req, res) => {
  const timeEntryId = req.params.id;
  const userId = req.user.userId;
  const now = new Date();
  
  const query = `
    UPDATE time_entries
    SET clock_out_time = ?
    WHERE id = ? AND user_id = ? AND clock_out_time IS NULL
  `;
  
  db.query(query, [now, timeEntryId, userId], (err, result) => {
    if (err) {
      console.error('Error clocking out:', err);
      return res.status(500).json({ success: false, message: 'Error clocking out' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Invalid time entry or already clocked out' });
    }
    
    res.json({
      success: true,
      timeEntry: {
        id: timeEntryId,
        userId,
        clockOutTime: now
      }
    });
  });
});

// Get time entries endpoint
app.get('/api/time-entries', verifyToken, (req, res) => {
  const userId = req.user.userId;
  
  const query = `
    SELECT * FROM time_entries
    WHERE user_id = ?
    ORDER BY date DESC, clock_in_time DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching time entries:', err);
      return res.status(500).json({ success: false, message: 'Error fetching time entries' });
    }
    
    res.json({ success: true, timeEntries: results });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 