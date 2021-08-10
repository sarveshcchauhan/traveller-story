const express = require('express')
const router = express.Router()
const Story = require('../models/Story')
const store = require('../middleware/multer')
const StoryImage = require('../models/StoryImage')
//files
const fs = require('fs')
//Authorization Middleware
const {ensureAuth, ensureGuest} = require('../middleware/auth')
//Image Storage Middleware
const User = require('../models/User')


//@des  Login/Landing Page
//@route Get /
router.get('/', ensureGuest, (req,res) => {
    //use render to display the hbs design
    //pass object to use the layouts
    res.render('login',{
        layout: 'login'
    })
})

//@des  Dashboard
//@route Get /
router.get('/dashboard', ensureAuth, async (req,res) => {
    try{
        //lean() gives plain js object not mongoose object
        const stories = await Story.find({user:req.user.id}).lean()
        res.render('dashboard', {
            name: req.user.firstName,
            stories
        })
    }catch(err){
        console.log(err)
        res.render('error/500')
    }
})

//@des  add new stories
//@route Get /stories/add
router.get('/stories/add', ensureAuth, (req,res) => {
  res.render('stories/add')  
})

//@des  save stories
//@route POST /stories/add
router.post('/stories/add', [ensureAuth,store.array('images')], async(req,res) => {
    try{
        const images = req.files
        const {title, desc, status} = req.body

        if(!images){
            console.log('err');
        }
        req.body.user = req.user.id
    
        const story = await Story.create(req.body)
        //convert image to base64 encoding
        let imageArray = images.map(image => {
            let img = fs.readFileSync(image.path)
            let encoded_img = img.toString('base64')
            let imageData = {
                filename: image.originalname,
                contentType: image.mimetype,
                imageBase64: encoded_img,
                story: story.id
            }
            StoryImage.create(imageData)
        })

        res.redirect('/dashboard')
    }catch(err){
        res.render('error/500')
    }
})

//@des get all stories
//@route GET /allStories
router.get('/stories', ensureAuth, async(req,res) => {
    try{
        const stories = await Story.find({status:'public'}).populate('user').sort({createdAt:'desc'}).lean()
        res.render('stories/index',{
            stories
        })   
    }catch(err){
        res.render('error/500')
    }
})

//@des get single stories
//@route POST /stories/edit/id
router.get('/stories/edit/:id', ensureAuth, async(req,res) => {
    try{
        const editStories = await Story.findOne({_id:req.params.id}).lean()
        console.log(editStories)
        if(!editStories){
            res.render('error/404')
        }
        
        if(editStories.user != req.user.id){
            res.redirect('/stories')
        }
        else{
            res.render('stories/edit',{
                editStories
            })
        }
    }catch(err){
        res.render('error/500')
    }
})

//@des update single data
//@route PUT /stories/edit/
router.put('/stories/edit/:id', ensureAuth, async(req,res) => {
    let checkStories = await Story.findOne({_id:req.params.id}).lean()
    console.log(checkStories)
    if(!checkStories){
        res.render('error/404')
    }

    if(checkStories.user != req.user.id){
        res.redirect('/stories')
    }else{
        //{new:true, runValidators:true} 
        //new:true will insert the data if not exists
        //runValidators: true will check if the datatype are correct or not 
        checkStories = await Story.findOneAndUpdate({_id:req.params.id}, req.body, {new:true, runValidators:true})
        res.redirect(`/stories/${checkStories._id}`)
    }
})

//Remove the stories
router.delete('/stories/my/:id', async(req,res) => {
    let checkStories = await Story.findOne({_id:req.params.id})
    if(!checkStories){
        res.render('error/404')
    }

    if(checkStories.user != req.user.id){
        res.redirect('/dashboard')
    }else{
        await Story.deleteOne({_id:req.params.id})
        res.redirect('/dashboard')
    }
})

//get user all stories
router.get('/stories/user/:id', async(req,res) => {
    //get stories with the user
    let userStories = await Story.find({user:req.params.id,status:'public'}).populate('user').lean()
    if(!userStories){
        res.render('error/404')
    }else{
        //get user details
        let userDetails = await User.findOne({_id:req.params.id}).lean()
        res.render('stories/user/index',{userStories,userDetails})
    }
})

//view user stories
router.get('/stories/:id', async(req,res) => {
    //get stories with the user
    let userStories = await Story.findById({_id:req.params.id}).populate('user').lean()

    if(!userStories){
        res.render('error/404')
    }else{
        let travelImage = await StoryImage.find({story:userStories._id}).lean()
        res.render('stories/user/view',{userStories,travelImage})
    }
})

module.exports = router