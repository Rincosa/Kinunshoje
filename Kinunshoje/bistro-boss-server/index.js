const express =require('express');
const app= express();
const cors= require('cors');
const jwt= require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAIL_GUN_API_KEY || 'key-yourkeyhere'});



const port= process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: axios } = require('axios');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hvbh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Store ID: bistr67b571378e8b9
// Store Password (API/Secret Key): bistr67b571378e8b9@ssl


// Merchant Panel URL: https://sandbox.sslcommerz.com/manage/ (Credential as you inputted in the time of registration)


 
// Store name: testbistr76yu
// Registered URL: www.bristroboss.com
// Session API to generate transaction: https://sandbox.sslcommerz.com/gwprocess/v3/api.php
// Validation API: https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?wsdl
// Validation API (Web Service) name: https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

// step-1 payment initiate


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("bistroDb").collection("users");
    const menuCollection = client.db("bistroDb").collection("menu");
    const reviewCollection = client.db("bistroDb").collection("reviews");
    const cartCollection = client.db("bistroDb").collection("carts");
    const paymentCollection = client.db("bistroDb").collection("payments");

    // jwt related api
    app.post('/jwt', async(req, res)=>{
      const user= req.body;
      const token= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h'});
      res.send({token});

    })

    // middlewares
    const verifyToken= (req,res, next)=>{
      console.log('inside verify token',req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized access'});
      }
      const token= req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if(err){
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
      })
    }

    // use verify admin after verifytoken
    const verifyAdmin= async(req,res,next)=>{
      const email = req.decoded.email;
      const query= {email: email};
      const user= await userCollection.findOne(query);
      const isAdmin= user?.role === 'admin';
      if(!isAdmin){
        return res.status(403).send({message: 'forbidden access'});
      }
      next();
    }

    // users related api
    app.get('/users',verifyToken, verifyAdmin, async(req,res)=>{
      console.log(req.headers);
      const result= await userCollection.find().toArray();
      res.send(result);
    });

    app.get('/users/admin/:email', verifyToken, async (req,res)=>{
      const email =req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'})
      }

      const query = {email: email};
      const user = await userCollection.findOne(query);
      let admin= false;
      if(user){
        admin =user?.role === 'admin';
      }
      res.send({admin});
    })

    app.post('/users', async(req, res)=>{
      const user = req.body;
      // insert email if user doesnt exists;
      // you can do this many ways (1. email unique, 2. upset 3. simple checking)
      const query ={email: user.email}
      const existingUser= await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result= await userCollection.insertOne(user);
      res.send(result);
    })

    app.patch('/user/admin/:id', verifyToken, verifyAdmin, async (req,res)=>{
      const id= req.params.id;
      const filter ={ _id: new ObjectId(id)};
      const updatedDoc={
        $set:{
          role: 'admin'
        }
      }
      const result =await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.delete('/users/:id', verifyToken, verifyAdmin, async (req,res)=>{
      const id = req.params.id;
      const query= {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // menu related apis
    app.get('/menu',async(req,res)=>{
        const result= await menuCollection.find().toArray();
        res.send(result);
    })

    app.get('/menu/:id', async(req, res)=>{
      const id = req.params.id;
      const query= {_id: new ObjectId(id)}
      const result= await menuCollection.findOne(query);
      res.send(result);
    })

    app.post('/menu', verifyToken, verifyAdmin, async(req,res)=>{
      const item =req.body;
      const result = await menuCollection.insertOne(item);
      res.send(result);
    })

    app.patch('/menu/:id', async(req, res)=>{
      const item = req.body;
      const id =req.params.id;
      const filter= {_id: new ObjectId(id)}
      const updatedDoc ={
        $set:{
          name: item.name,
          category: item.category,
          price: item.price,
           recipe: item.recipe,
           image: item.image
        }
      }
      const result = await menuCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/menu/:id', verifyToken, verifyAdmin, async(req,res)=>{
      const id= req.params.id;
      const query= {_id: new ObjectId(id)}
      const result= await menuCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/reviews',async(req,res)=>{
        const result= await reviewCollection.find().toArray();
        res.send(result);
    })

    // carts collection

    app.get('/carts', async(req,res)=>{
      const email= req.query.email;
      const query= {email: email};
      const result= await cartCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/carts', async(req,res)=>{
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    app.delete('/carts/:id', async(req,res)=>{
      const id= req.params.id;
      const query ={_id: new ObjectId(id)}
      const result= await cartCollection.deleteOne(query);
      res.send(result);
    });

    // payment intent
    app.post('/create-payment-intent', async(req,res)=>{
      const { price}= req.body;
      const amount =parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent =await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })

    app.get('/payments/:email', verifyToken, async (req,res)=>{
      const query ={ email: req.params.email}
      if(req.params.email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'});
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/payments', async(req,res)=>{
      const payment = req.body;
      const paymentResult= await paymentCollection.insertOne(payment);

      // carefully delete each item from the cart
      console.log('payment info', payment);
      const query ={_id:{
        $in: payment.cartIds.map(id=> new ObjectId(id))
      }};

      const deleteResult =await cartCollection.deleteMany(query);

      // SEND USER EMAIL ABOUT PAYMENT CONFIRMATION
      mg.messages.create(process.env.MAIL_SENDING_DOMAIN, {
        from: "Excited User <mailgun@sandbox438154e3b4e943aa9729a66b5f3bdf72.mailgun.org>",
        to: ["rinco.it.continental@gmail.com"],
        subject: "Bistro Boss Order Confirmation",
        text: "Testing some Mailgun awesomeness!",
        html: `
        <div>
        <h2>Thank you for your order</h2>
        <h4>Your Transaction Id: <strong> ${payment.transactionId}</strong></h4>
        <p>We would like to get your feedback about the food</p>
        </div>`
      })
      .then(msg => console.log(msg)) // logs response data
      .catch(err => console.log(err)); // logs any error


      res.send({paymentResult, deleteResult});
    })

    app.post("/create-ssl-payment", async(req,res)=>{
      const payment=req.body;
      console.log("payment info", payment);

      const trxid= new ObjectId().toString();

      payment.transactionId= trxid;

      const email= payment.email;
      const query= {email: email};
      const result= await cartCollection.find(query).toArray();
      const totalPrice= result.reduce((total,item)=> total + item.price, 0);
      console.log("result",totalPrice);


      if(totalPrice===payment.price && totalPrice !== 0){
        const initiate= {
          store_id:"bistr67b571378e8b9",
          store_passwd:"bistr67b571378e8b9@ssl",
          total_amount: totalPrice,
          currency: 'BDT',
          tran_id: trxid, // use unique tran_id for each api call
          success_url: 'http://localhost:5000/success-payment',
          fail_url: 'http://localhost:5173/fail',
          cancel_url: 'http://localhost:5173/cancel',
          ipn_url: 'http://localhost:5000/ipn-success-payment',
          shipping_method: 'Courier',
          product_name: 'Computer.',
          product_category: 'Electronic',
          product_profile: 'general',
          cus_name: 'Customer Name',
          cus_email: `${payment.email}`,
          cus_add1: 'Dhaka',
          cus_add2: 'Dhaka',
          cus_city: 'Dhaka',
          cus_state: 'Dhaka',
          cus_postcode: '1000',
          cus_country: 'Bangladesh',
          cus_phone: '01711111111',
          cus_fax: '01711111111',
          ship_name: 'Customer Name',
          ship_add1: 'Dhaka',
          ship_add2: 'Dhaka',
          ship_city: 'Dhaka',
          ship_state: 'Dhaka',
          ship_postcode: 1000,
          ship_country: 'Bangladesh',
        };
  
        const iniRespose =await axios({
          url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
          method: "POST",
          data: initiate,
          headers:{
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
  
        const saveData= await paymentCollection.insertOne(payment);
  
        const gatewayUrl= iniRespose?.data?.GatewayPageURL
  
        console.log(gatewayUrl, "gatewayUrl");
  
        res.send({gatewayUrl});
      }
      


    });    
    
    app.post("/success-payment", async(req,res)=>{
      const paymentSuccess=req.body;
      // console.log("paymentSuccess info", paymentSuccess);

      // validation
      const {data} = await axios.get(`https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${paymentSuccess.val_id}&store_id=bistr67b571378e8b9&store_passwd=bistr67b571378e8b9@ssl&format=json`);

      console.log("isValidPayment", data);
      // console.log("data.status", data.status);

      if(data.status !== 'VALID'){
        return res.send({message: "Invalid payment"});
      }

      // update the payment
      const updatePayment = await paymentCollection.updateOne(
        {transactionId: data.tran_id},
        {
        $set: {
          status: "success",
        },
      });

      const payment =await paymentCollection.findOne({
        transactionId: data.tran_id,
      })

      console.log("payment", payment);

            // carefully delete each item from the cart
            console.log('payment info', payment);
            const query ={_id:{
              $in: payment.cartIds.map(id=> new ObjectId(id))
            }};
      
            const deleteResult =await cartCollection.deleteMany(query);

            console.log("deleteResult",deleteResult)

      res.redirect('http://localhost:5173/dashboard/paymentHistory');

      console.log(updatePayment, "updatePayment");

      console.log("isValidPayment", data);

      });

    // stats or analyties
    app.get('/admin-stats', verifyToken, verifyAdmin, async(req,res)=>{
      const users = await userCollection.estimatedDocumentCount();
      const menuItems = await menuCollection.estimatedDocumentCount();
      const orders =await paymentCollection.estimatedDocumentCount();

      // this is not the best way
      // const payments = await paymentCollection.find().toArray();
      // const revenue= payments.reduce((total, payment)=> total+ payment.price, 0);

      const result =await paymentCollection.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: '$price'
            }
          }
        }
      ]).toArray();

      const revenue= result.length> 0 ? result[0].totalRevenue : 0;

      res.send({
        users,
        menuItems,
        orders,
        revenue
      })
    })

    // using aggregate pipeline
    app.get('/order-stats', verifyToken, verifyAdmin, async(req,res)=>{
      const result= await paymentCollection.aggregate([
        {
          $unwind: '$menuItemIds'
        },
        {
          $lookup: {
            from: 'menu',
            localField: 'menuItemIds',
            foreignField: '_id',
            as: 'menuItems'
          }
        },
        {
          $unwind: '$menuItems'
        },
        {
          $group:{
            _id: '$menuItems.category',
            quantity:{$sum: 1},
            revenue: {$sum: '$menuItems.price'}
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            quantity: '$quantity',
            revenue: '$revenue'
          }
        }
      ]).toArray();

      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('boss is sitting')
})

app.listen(port,()=>{
    console.log(`Bistro boss is sitting on port ${port}`);
})