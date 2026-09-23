const express = require('express');
const cors = require('cors');
const alumniRoutes = require('./routes/alumniRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Ana Sayfa (GET /) - Temporary One Main Page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Alumni Tracking System</title>
</head>
<body>
  <h1>Alumni Tracking System</h1>
  <p>Mezunlarımızı ve öğrencilerimizi bir araya getiren kariyer ve iletişim takip platformu.</p>
  <p><strong>Temporary One Main Page</strong></p>
</body>
</html>`);
});

// 2. GET /hello → "Hello World!"
app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

// 3. GET /hello/esra → "Hello Esra"
app.get('/hello/esra', (req, res) => {
  res.send('Hello Esra');
});

// 4. GET /sum/{number1}/{number2} → İki sayıyı toplar
app.get('/sum/:number1/:number2', (req, res) => {
  const number1 = Number(req.params.number1);
  const number2 = Number(req.params.number2);
  const total = number1 + number2;
  res.send(total.toString());
});

// 5. GET /about → Temporary About Page
app.get('/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>About Alumni Tracking System</title>
</head>
<body>
  <h1>About Alumni Tracking System</h1>
  <p>Bu proje mezun takip sistemi olarak tasarlanmış olup üniversite ve mezun ilişkilerini güçlendirmeyi amaçlamaktadır.</p>
  <p><strong>Temporary About Page</strong></p>
</body>
</html>`);
});

// Mevcut /alumni rotası ve kontrol rotaları
app.use('/alumni', alumniRoutes);
app.get('/ok', (req, res) => res.status(200).send('ok'));
app.get('/health', (req, res) => res.status(200).send('ok'));

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor: http://localhost:${PORT}`);
});

module.exports = app;
