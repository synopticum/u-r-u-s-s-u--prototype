var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

// Dot
var DotSchema = new Schema({
    id : {
        type : String,
        unique : true,
        required : true
    },
    created : {
        type : Date,
        default : Date.now
    },
    icon : {
        type : String,
        required : true
    },
    position : {
        type : Array,
        required : true
    },
    layer : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    text : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    street : {
        type : String,
        required : true
    },
    house : {
        type : String,
        required : true
    },
    homePhone : {
        type : String,
        required : true
    },
    mobilePhone : {
        type : String,
        required : true
    },
    gallery : {
        type : Array,
        required : false
    }
});

// User
var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    displayName: {
        type: String,
        unique: false,
        required: true
    },
    vkontakteId : {
        type: String,
        unique: true
    }
});

// User
var MessageSchema = new Schema({
    messageId: {
        type: String,
        unique: true,
        required: true
    },
    dotId: {
        type: String,
        unique: false,
        required: true
    },
    name: {
        type: String,
        unique: false,
        required: true
    },
    link: {
        type: String,
        unique: false,
        required: true
    },
    text : {
        type: String,
        unique: false,
        required: true
    },
    approved : {
        type: Boolean,
        unique: false,
        required: true
    },
    created : {
        type : Date,
        default : Date.now
    }
});

exports.Dot = mongoose.model('Dot', DotSchema);
exports.User = mongoose.model('User', UserSchema);
exports.Message = mongoose.model('Message', MessageSchema);