const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validate = require('mongoose-validator');
//let constantPlugin = require('mongoose-constant');

const EmailValidator = [
    validate({
        validator: 'matches',
        arguments: /^[\w.]+[@]+[a-zA-Z]+.com$/,
        message: 'Invalid email address'
    })
];

const PhoneValidator = [
    validate({
        validator: 'matches',
        arguments: /^923[1-9]{9}$/,
        message: 'its not valid phone number'
    })
];



let tempUserSchema = new Schema({
    
        firstname:   {type: String, required: true},
        lastname: {type: String, required: true},
        email: {type: String, lowercase: true, unique: true, validate: EmailValidator, required: true },
        phone: {type: Number, required: true , validate: PhoneValidator},
        password: {type: String, required: true},
        posts: [{type: Schema.Types.ObjectId, ref: 'Posts'}],
        followers: [{type: Schema.Types.ObjectId, unique: true}],
        GENERATED_VERIFYING_URL: String
    }
);

module.exports = mongoose.model('tempUsers', tempUserSchema);