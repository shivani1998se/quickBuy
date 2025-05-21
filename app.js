const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");


// const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
let uri = "mongodb+srv://sr3107743:0l26dKifErX24wPo@cluster0.k1znr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"



main()
 .then(() =>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(uri);
    
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); // for static files




app.get("/",(req,res) =>{
    res.send("hi,I am shivani")
});

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    
    if(error){
     throw new ExpressError(400,error);
    }else{
        next();
    }
}


app.get("/testListing",(req,res) => {
    let sampleListing = new Listing({
        title: "Sample Listing",
    })
})


// Index Route
app.get("/listings",wrapAsync(async(req,res)=>{
 const allListings = await Listing.find({});
 res.render("listings/index.ejs",{allListings});
   
        // console.log(res);
    }));


// New Route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");

});

// Show Route

app.get ("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

// Create Route
app.post("/listings",validateListing,
    wrapAsync(async(req,res,next)=>{
     
        const newListing = new Listing(req.body.listing);
         await newListing.save();
        res.redirect("/listings");
    
    })
  
);



// Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);  
    res.render("listings/edit.ejs",{listing});
}));


// Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req,res) => {
    
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));



// Delete Route
app.delete("/listings/:id",wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));



// app.get("/testListing",async(req,res) => { 
//     let sampleListing = new Listing({
//         title: "Sample Listing",
//         description:"By the beach",
//         price: 10000,
//         location: "Mumbai",
//         // image: "https://images.unsplash.com/photo-1518791843207-8199c",
//         rating: 4.5,
//         country:"India"

//     });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("my name is shivani");

app.all("*", (req,res,next)=>{
   next(new ExpressError(404,"Page Not Found !"));
});


  
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!"} = err;
    // res.status(statusCode).render("error.ejs",{message});
    // res.render("error.ejs",{err});

   res.status(statusCode).send(message);
});


app.listen(3000,() =>{
    console.log("Server is running on port 3000");
});

// app.listen(8080, () => {
//     console.log("Server is running on port 8000");
// });

