const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vdmb9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri)
const port = 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is Working!");
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
    const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
    const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
    const servicesCollection = client.db('fixPhone').collection("services");
    const adminCollection = client.db(process.env.DB_NAME).collection("adminEmail");

    console.log("FixPhone Database connected successfully!!");

    // insert order info to database
    app.post("/postOrder", (req, res) => {
        const newOrder = req.body;
        console.log("adding new service order: ", newOrder);
        ordersCollection.insertOne(newOrder).then((result) => {
            console.log("inserted count", result.insertedCount);
            res.send(result.insertedCount > 0);
        });
    });

    // Get a service details
    app.get("/services/:id", (req, res) => {
        const id = ObjectId(req.params.id);
        servicesCollection.find({ _id: id }).toArray((err, items) => {
            res.send(items);
        });
    });
   

    // insert new service info to database
    app.post("/addService", (req, res) => {
        const newService = req.body;
        console.log("adding new service: ", newService);
        servicesCollection.insertOne(newService).then((result) => {
            console.log("inserted count", result.insertedCount);
            res.send(result.insertedCount > 0);
        });
    });

    // read all order data from database
    app.get("/allOrders", (req, res) => {
        ordersCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

    // insert review info to database
    app.post("/addReview", (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    // read reviews from database
    app.get("/reviews", (req, res) => {
        reviewCollection
            .find({})
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    // read all services data from database
    app.get("/getServices", (req, res) => {
        servicesCollection.find().toArray((err, documents) => {
            res.send(documents);
        });
    });

    // Add an admin
    app.post("/adminEmail", (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    // check if the user is an admin
    app.post("/isAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email }).toArray((err, adminEmail) => {
            res.send(adminEmail.length > 0);
        });
    });

    // find specific user order
    app.get("/orders/:email", (req, res) => {
        const email = req.params.email;
        ordersCollection.find({ email: email }).toArray((err, items) => {
            res.send(items);
        });
    });

    // update order status
    app.patch("/update/:id", (req, res) => {
        ordersCollection
            .updateOne(
                { _id: ObjectId(req.params.id) },
                {
                    $set: { status: req.body.status },
                }
            )
            .then((result) => {
                res.send(result.modifiedCount > 0);
            });
    });

    // delete a service
     app.delete("/deleteService/:id", (req, res) => {
        console.log("On delete");
        const id = ObjectId(req.params.id);
        console.log("delete this", id);
        servicesCollection
            .findOneAndDelete({ _id: id })
            .then((documents) => res.send(!!documents.value));
    });

    
});

app.listen(process.env.PORT || port, console.log("Server Running on http://localhost:" + port));
