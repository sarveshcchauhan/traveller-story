const mongoose = require('mongoose')

const StoryImageSchema = mongoose.Schema({
    filename:{
        type:String,
        unique:true,
        required:true
    },
    contentType:{
        type:String,
        required: true
    },
    imageBase64:{
        type:String,
        required:true
    },
    story:{
        type:mongoose.Schema.Types.ObjectID,
        ref:'Story'
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
})

module.exports = mongoose.model('StoryImage',StoryImageSchema)