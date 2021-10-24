const express = require('express');
const router = express.Router();
const User = require('../models/user')
const multer = require('multer')
const fs = require('fs')

//image upload
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// Get's and render's homepage with users from database
router.get('/', (req, res) => {
    User.find().exec((err, users) => {
        if(err){
            res.json({
                message: err.message,
            })
        } else{
            res.render('index.ejs', { 
                title: " Home Page ",
                users: users
            })
        }
    })
});
// Get users information and send to ejs template
router.get('/add', (req, res) => {
    res.render('add_users', {title: "Add Users"})
})
// Post a user to the database
router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    // Saves user model to mongodb
    user.save((error) => {
        if(error) {
            res.json({message: err.message, type: "danger"})
        } else {
            req.session.message = {
                type: "success",
                message: "User added successfully"
            };
            res.redirect('/');
        }
    })
})

// Edit an user 
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if(err){
            res.redirect('/')
        } else{
            if(user == ''){
                res.redirect('/')
            } else{
                res.render('edit_users', {
                    title: "Edit User",
                    user: user,
                })
            }
        }
    })
})

// Update user route
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = ''
    if(req.file) {
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./uploads/'+req.body.old_image)
        } catch(err) {
            console.log(err)
        }
    }else{
      new_image = req.body.old_image  
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }, (err, result) => {
        if(err){
            res.json({
                message: err.message, type:'danger'
            })
        }else{
            req.session.meaage = {
                type:'success',
                message: 'user updated successfully'
            };
            res.redirect('/')
        }
    })
});

//Delete User route
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => {
        if(result.image != '') {
            try{
                fs.unlinkSync('./uploads/' + result.image);
            } catch(err){
                console.log(err)
            }
        }
        if(err) {
            res.json({
                messgae: err.message,
            });
        } else{
            req.session.message = {
                type: 'info',
                message: 'User deleted successfully'
            };
            res.redirect('/')
        }
    })
})
module.exports = router;