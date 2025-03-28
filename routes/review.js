const express = require("express");
const router = express.Router({mergeParams : true});
const {reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedin,isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");
//POST REVIEW ROUTE
router.post("/:id/reviews",isLoggedin,validateReview,wrapAsync(reviewController.createReview))

//POST DELETE ROUTE
router.delete("/:id/reviews/:reviewId",isLoggedin,isReviewAuthor,
    wrapAsync(reviewController.deleteReview));

module.exports = router;