const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Joi = require('joi');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment variable validation
const isDevelopment = process.env.NODE_ENV !== 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isDevelopment ? 'worldend-dev-secret-key-2024-change-in-production' : null);
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/worldend';

if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required in production');
  process.exit(1);
}

if (isDevelopment) {
  console.warn('⚠️  Using default JWT_SECRET for development. Change this in production!');
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isDevelopment ? false : { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "http:", "https:"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 login attempts per windowMs (increased for development)
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files with proper headers
app.use('/uploads', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Cache-Control', 'public, max-age=3600');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'images'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'videos'), { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'image') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
    } else if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video files are allowed'), false);
      }
    }
    cb(null, true);
  }
});

// Initialize database
initializeDatabase();

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Anime table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS anime (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        genres TEXT,
        year INTEGER,
        episodes INTEGER,
        status TEXT,
        image_url TEXT,
        rating REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Episodes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS episodes (
        id SERIAL PRIMARY KEY,
        anime_id INTEGER NOT NULL,
        episode_number INTEGER NOT NULL,
        title TEXT,
        video_url TEXT,
        video_platform TEXT DEFAULT 'file',
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE
      )
    `);

    // Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        anime_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Favorites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        anime_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
        UNIQUE(user_id, anime_id)
      )
    `);

    // Watch history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        anime_id INTEGER NOT NULL,
        episode_id INTEGER,
        timestamp INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
        FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
      )
    `);

    // Settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      )
    `);

    // Insert default settings
    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('admin_email_domain', '@worldend.com')
      ON CONFLICT (key) DO NOTHING
    `);
    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('max_video_size_mb', '2048')
      ON CONFLICT (key) DO NOTHING
    `);

    // Create default admin user
    const adminEmail = 'admin@worldend.com';
    const adminPassword = bcrypt.hashSync('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin', adminEmail, adminPassword, 'admin']);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}


// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().pattern(/^[a-zA-Z\s]+$/),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const animeSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).allow(''),
  genres: Joi.string().max(500).allow(''),
  year: Joi.number().integer().min(1900).max(2100).allow(''),
  episodes: Joi.number().integer().min(1).max(5000).allow(''),
  status: Joi.string().valid('Ongoing', 'Completed', 'Upcoming').required(),
  video_url: Joi.string().uri().allow(''),
  video_platform: Joi.string().valid('file', 'youtube', 'vimeo', 'other').default('file'),
});

const episodeSchema = Joi.object({
  episode_number: Joi.number().integer().min(1).max(5000).required(),
  title: Joi.string().max(200).allow(''),
  video_url: Joi.string().uri().allow(''),
  video_platform: Joi.string().valid('file', 'youtube', 'vimeo', 'other').default('file'),
  duration: Joi.number().integer().min(1).max(14400).allow(''),
});

const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow(''),
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Helper function to check if email is admin email
async function isAdminEmail(email) {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['admin_email_domain']);
    const domain = result.rows[0] ? result.rows[0].value : '@worldend.com';
    return email.endsWith(domain);
  } catch (err) {
    console.error('Error checking admin email:', err);
    return false;
  }
}

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if email is admin email
    const isAdmin = await isAdminEmail(email);
    const role = isAdmin ? 'admin' : 'user';

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, role]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.rows[0].id, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'User registered successfully',
      token,
      user: { id: result.rows[0].id, name, email, role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Get user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Anime Routes
app.get('/api/anime', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM anime ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/anime/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM anime WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/anime', authenticateToken, requireAdmin, upload.fields([
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    // Validate input
    const { error, value } = animeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, description, genres, year, episodes, status, video_url, video_platform } = value;
    const imageUrl = req.files['image'] ? `/uploads/images/${req.files['image'][0].filename}` : null;

    const result = await pool.query(
      `INSERT INTO anime (title, description, genres, year, episodes, status, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [title, description, genres, year, episodes, status, imageUrl, req.user.id]
    );

    // If video URL was provided, create first episode
    if (video_url) {
      await pool.query(
        `INSERT INTO episodes (anime_id, episode_number, title, video_url, video_platform, duration)
         VALUES ($1, 1, 'Episode 1', $2, $3, 1440)`,
        [result.rows[0].id, video_url, video_platform || 'other']
      );
    }

    res.json({
      message: 'Anime created successfully',
      anime: {
        id: result.rows[0].id,
        title,
        description,
        genres,
        year,
        episodes,
        status,
        image_url: imageUrl,
        video_url: video_url
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/anime/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, genres, year, episodes, status } = req.body;
    let imageUrl = req.files['image'] ? `/uploads/images/${req.files['image'][0].filename}` : null;

    let query = 'UPDATE anime SET title = $1, description = $2, genres = $3, year = $4, episodes = $5, status = $6';
    const params = [title, description, genres, year, episodes, status];
    let paramCount = 6;

    if (imageUrl) {
      query += `, image_url = $${paramCount + 1}`;
      params.push(imageUrl);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount + 1}`;
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ message: 'Anime updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update anime' });
  }
});

app.delete('/api/anime/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM anime WHERE id = $1', [req.params.id]);
    res.json({ message: 'Anime deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete anime' });
  }
});

// Episodes Routes
app.get('/api/anime/:id/episodes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM episodes WHERE anime_id = $1 ORDER BY episode_number', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/anime/:id/episodes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = episodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { episode_number, title, video_url, video_platform, duration } = value;

    const result = await pool.query(
      `INSERT INTO episodes (anime_id, episode_number, title, video_url, video_platform, duration)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.params.id, episode_number, title, video_url, video_platform || 'other', duration || 1440]
    );

    res.json({
      message: 'Episode created successfully',
      episode: { id: result.rows[0].id, episode_number, title, video_url, video_platform }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reviews Routes
app.get('/api/anime/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.anime_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/anime/:id/reviews', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { rating, comment } = value;

    const result = await pool.query(
      `INSERT INTO reviews (anime_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.params.id, req.user.id, rating, comment]
    );

    res.json({
      message: 'Review created successfully',
      review: { id: result.rows[0].id, anime_id: req.params.id, user_id: req.user.id, rating, comment }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Favorites Routes
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, f.created_at as favorited_at FROM favorites f
       JOIN anime a ON f.anime_id = a.id
       WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/favorites/:animeId', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO favorites (user_id, anime_id) VALUES ($1, $2)
       ON CONFLICT (user_id, anime_id) DO NOTHING`,
      [req.user.id, req.params.animeId]
    );
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.delete('/api/favorites/:animeId', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM favorites WHERE user_id = $1 AND anime_id = $2`,
      [req.user.id, req.params.animeId]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// User Routes
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get favorites count
    const favResult = await pool.query('SELECT COUNT(*) as count FROM favorites WHERE user_id = $1', [req.user.id]);
    const favoritesCount = parseInt(favResult.rows[0].count);
    
    // Get watch history count
    const histResult = await pool.query('SELECT COUNT(DISTINCT anime_id) as count FROM watch_history WHERE user_id = $1', [req.user.id]);
    const watchedCount = parseInt(histResult.rows[0].count);
    
    res.json({
      ...user,
      favorites_count: favoritesCount,
      watched_count: watchedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Settings Routes
app.get('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { admin_email_domain, max_video_size_mb } = req.body;

    if (admin_email_domain) {
      await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [admin_email_domain, 'admin_email_domain']);
    }
    if (max_video_size_mb) {
      await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [max_video_size_mb, 'max_video_size_mb']);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Connected to PostgreSQL database');
});
