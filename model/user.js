const mongoose = require('mongoose')
const { type } = require('os')

// Create a new User Schema
const UserSchema = new mongoose.Schema({
    username: {type: String, required:true, unique: true},
    password: {type: String, required:true},
},
{
    collection: 'users'
}
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports= model