const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const articleRoutes = require("./routes/article");
const dotenv = require("dotenv");
const http = require("http");
const { setupSocket } = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });


app.use("/api/articles", articleRoutes);

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});



server.listen(process.env.PORT, () => console.log(`Server started on ${process.env.PORT}`));


setupSocket(server);
