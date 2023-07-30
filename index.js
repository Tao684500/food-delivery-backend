const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { cast } = require("mongoose/lib/schematype");
const dotenv = require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

//mongodb connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to Databse"))
  .catch((err) => console.log(err));

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true, // ไม่ให้ซ้ำ
  },
  password: String,
  confirmPassword: String,
  image: String,
});

//model
const userModel = mongoose.model("user", userSchema);

//api
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/signup", async (req, res) => {
  try {
    // ดักไว้เวลามี error จะไม่ทำให้ app พัง
    console.log("42", req.body);
    const { email } = req.body; // body ที่ส่งเข้ามา
    // find หา email ก่อน
    const user = await userModel.findOne({ email }).lean();
    if (user)
      return res
        .status(999)
        .send({ massage: "มีบัญชีผู้ใช้แล้ว", alert: false }); // ถ้ามี user แล้วให้ออก error
    const save = await userModel.insertMany([req.body]); // save ข้อมูลลง db
    console.log("48", save); // ผล
    res.status(200).send({ massage: "บันทึกข้อมูลสำเร็จ", alert: true });
  } catch (error) {
    console.log(error);
  }
});

//api login
app.post("/login", async (req, res) => {
  try {
    console.log("57", req.body);
    const { email } = req.body;
    const user = await userModel.findOne({ email }).lean();
    if (user) {
        // console.log("67",user)
        const dataSend = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
        } 
        console.log("75",dataSend)
        return res
        .status(200)
        .send({ massage: "Login is successfully" ,alert : true , data : dataSend})   
    }else{
        return res
        .status(999)
        .send({ massage: "Email is not available, please sign up " ,alert : false}) 
    }
  } catch {error}
  console.log(error)
});

//product schemaProduct
const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product",schemaProduct)

//save product in data
//api
app.post("/uploadProduct", async (req,res)=>{
  console.log(req.body)
  const data = await productModel(req.body)
  const datavave = await data.save()
  res.send({message : "Upload successfully"})
})

//
app.get("/product",async (req,res)=>{
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})


//server is ruuning
app.listen(PORT, () => console.log("Server is running at port : " + PORT));
