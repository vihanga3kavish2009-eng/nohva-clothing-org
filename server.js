const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'images', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = 'prod_' + Date.now() + '_' + Math.round(Math.random() * 1e4) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.')); // Serve static files

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nohva', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  type: String,
  size: String,
  price: Number,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ timestamp: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const imageUrl = '/images/products/' + req.file.filename;
  res.json({ imageUrl });
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // Delete associated image file if it's a local upload
    if (product && product.imageUrl && product.imageUrl.startsWith('/images/products/')) {
      const imgPath = path.join(__dirname, product.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed sample products
app.post('/api/seed', async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "MONOLITH BLAZER V1",
        category: "Blazers",
        type: "OBSIDIAN BLACK",
        size: "M",
        price: 245,
        imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d466f1c4?q=80&h=800&auto=format&fit=crop",
        timestamp: new Date()
      },
      {
        name: "STRUCTURE KIDS DRESS",
        category: "Kids",
        type: "ASPHALT GREY",
        size: "S",
        price: 320,
        imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&h=800&auto=format&fit=crop",
        timestamp: new Date()
      },
      {
        name: "CORE ESSENTIALS HOODIE",
        category: "Essentials",
        type: "CHARCOAL",
        size: "L",
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
        timestamp: new Date()
      }
    ];

    await Product.insertMany(sampleProducts);
    res.json({ message: 'Sample products added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});