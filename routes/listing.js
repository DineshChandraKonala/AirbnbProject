const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedin,isOwner,validateListing } = require("../middleware.js");
const  listingController  = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage });
//INDEX PAGE & CREATE ROUTE
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedin,
        upload.single('listing[image]'),
        wrapAsync(listingController.createListing));
    

//NEW ROUTE
router.get("/new",isLoggedin,(listingController.renderNewForm))

//SEARCH ROUTE
router.get("/search", wrapAsync(listingController.searchListings));

//SHOW  & UDATE  & DELETE
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedin,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedin,isOwner,wrapAsync(listingController.deleteListing))

//EDIT ROUTE
router.get("/:id/edit",isLoggedin,isOwner,wrapAsync(listingController.editListing));


module.exports = router;