var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        reuired: true,
    },
    email: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
});
module.exports = mongoose.model('User', UserSchema);