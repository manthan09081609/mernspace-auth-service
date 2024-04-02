import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Service Template");
});

export default app;
