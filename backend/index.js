const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('DeCaVision Backend Running');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});