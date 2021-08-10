const multer = require("multer")

//set Storage
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,'public/uploads')
    },
    filename: function(req, file, cb){
        //get ext
        //this will get the ext of image like image.jpg => jpg
        let ext = file.originalname.substr(file.originalname.lastIndexOf('.'))

        cb(null,file.fieldname+'-'+Date.now()+ext)
    }
})

const filerFilter = (req, file, cb) => {
    cb(null,true)
}

store = multer({storage:storage, fileFilter: filerFilter})

module.exports = store;