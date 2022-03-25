 const express = require('express');
 const router = express.Router();




 router.get('/campgrounds', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new.ejs')
})

router.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) =>{ 
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    // const campgroundSchema = Joi.object({
    //     campground: Joi.object({

    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0),
    //         image: Joi.string().required(),
    //         location: Joi.string().required(),
    //         description: Joi.string().required(),

    //     }).required()
    // })
    // const { error } = campgroundSchema.validate(req.body);
    // if(error){
    //     const msg = error.details.map(el => el.message).join(',')
    //     throw new ExpressError(msg, 400)
    // }
    // console.log(result)

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
    
}))

router.get('/campgrounds/:id', catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

router.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

router.put('/campgrounds/:id', validateCampground ,catchAsync(async (req, res) =>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

router.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
   await review.save();
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) =>{
    const{ id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

router.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

module.exports = router;