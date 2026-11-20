import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

const port = process.env.PORT || 6173;

const app = express();
app.use(cors());
app.use(morgan("combined"));

app.post("/feedback", bodyParser.json(), (req, res) => {
  console.info("req body", req.body);
  if (req.body.feedback === "no no no no no") {
    res.sendStatus(400);
  } else {
    res.sendStatus(200);
  }
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
