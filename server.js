const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ===================== IMPORT ROUTES =====================
const loginRoutes = require('./routes/login');
const accountRoutes = require('./routes/account');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const marketingRoutes = require('./routes/marketing');
const statisticRoutes = require('./routes/statistics');

// ===================== USE ROUTES =====================
app.use('/api', loginRoutes);
app.use('/api', accountRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', marketingRoutes);
app.use('/api', statisticRoutes);

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});