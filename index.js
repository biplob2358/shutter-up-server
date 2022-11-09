const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yjf8p4x.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("shutterUp").collection("services");
    const reviewCollection = client.db("shutterUp").collection("reviews");

    app.get("/services", async (req, res) => {
      const size = parseInt(req.query.size);

      const query = {};
      const cursor = serviceCollection
        .find(query)
        .limit(size)
        .sort({ _id: -1 });
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    // reviews

    app.get("/reviews", async (req, res) => {
      console.log(req.query.userEmaill);
      let query = {};
      if (req.query.service_id) {
        query = {
          service_id: req.query.service_id,
        };
      }
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }

      const cursor = reviewCollection.find(query).sort({ date: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    //update
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const reviews = req.body;
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          review: reviews.review,
          rating: reviews.rating,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updatedReview,
        option
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Shutter Up server running");
});
app.listen(port, () => {
  console.log(`Server rinning on port ${port}`);
});
