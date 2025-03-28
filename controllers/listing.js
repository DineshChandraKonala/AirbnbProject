const geocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
//INDEX ROUTE
module.exports.index =  async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

//RENDER NEWFORM
module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

//SHOW ROUTE
module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id) //NESTED FUNCTION
    .populate({path : "reviews",
        populate : {
            path : "author"
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error","No Listing Exists");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}

//CREATE ROUTE
module.exports.createListing = async (req,res,next)=>{
        // let {title,description,image,price,location,country} = req.body;
        let response = await geocodingClient.forwardGeocode({
            query : req.body.listing.location,
            limit : 1,
        })
        .send();
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url,"...",filename);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry = response.body.features[0].geometry;
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success","New Listing Added");
        res.redirect("/listings");
}

//EDIT ROUTE
module.exports.editListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    const coordinates = listing.geometry.coordinates;
    let originalImgUrl = listing.image.url;
    originalImgUrl.replace = ("/upload","/upload/w_250"); 
    res.render("listings/edit.ejs",{listing,originalImgUrl,coordinates});
}
//SEARCH ROUTE 
module.exports.searchListings = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        // Validate search query
        if (!q) {
            req.flash("error", "Please enter a search term");
            return res.redirect("/listings");
        }

        // Perform search with MongoDB
        const listings = await Listing.find({
            $or: [
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } },
                { title: { $regex: q, $options: "i" } }
            ]
        }).populate("owner");

        // Handle no results
        if (listings.length === 0) {
            req.flash("error", `No listings found for "${q}"`);
            return res.redirect("/listings");
        }

        // Render results
        res.render("listings/index.ejs", { 
            allListings: listings,
            searchQuery: q 
        });

    } catch (err) {
        // Pass error to error handler
        next(new Error("Search failed: " + err.message));
    }
};

//UPDATE ROUTE
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    // const listing = await Listing.findById(id);
    
    // Get coordinates for new location if location changed
    if (req.body.listing.location) {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        if (response.body.features.length > 0) {
            req.body.listing.geometry = response.body.features[0].geometry;
        }
    }
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing },{ new: true });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url,filename };
        console.log(listing.image.url);
        await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}

//DELETE ROUTER
module.exports.deleteListing = async (req,res)=>{
    let {id} = req.params;
    const deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
    }
