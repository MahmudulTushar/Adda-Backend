const express = require('express');
const messagesRoutes = require('./routes/messagesRoutes');
const roomsRoutes = require('./routes/roomsRoutes');
const roomRequestRoutes = require('./routes/roomRequestsRoutes');
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(express.json());

app.use((req, res, next) =>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
})

app.get('/',(req, res) =>{
  res.status(200).send('Hello World');
})
app.use(messagesRoutes);
app.use(roomsRoutes);
app.use(roomRequestRoutes);
app.listen(port, () => console.log(`Listening on loclhost: ${port}`));