const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt=require("jsonwebtoken")
const JWT_SECRET_KEY='fuhoijltuisyrdfuyikhi,hyujdtrgfdyjkiuiolsdhkjs';

mongoose.connect('mongodb://localhost:27017/?readPreference=primary&ssl=false', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
})
const app= express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

app.post('/api/login', async(req, res) => {
    const {username, password} = req.body
    const user = await User.findOne({ username, password }).lean()

    if(!user){
        return res.json({ status: 'error', error:'Invalid Username/Password'})
    }

    // 2 password ko match krna(if they are same or not)
    // this will not directly compare the hashing values, instead of it it will compare the string with the possibility that can be hashed
    if(await bcrypt.compare(password, user.password)){
        // username, password combination is successful

        //Using JWT TOKEN
        const token= jwt.sign({ 
            id: user._id, 
            username: user.username
        },
        JWT_SECRET_KEY
        )

        return res.json({ status: 'ok', data: token})  // data will be the token that will come here
    }

    res.json({status: 'error', error:'Invalid Username/Password'})
})


// ROUTING
// async- bcs we will make bunch of database calls here
// req.body - empty bcs by default express does not parse the JSON which is being send in the request, so for this we will install body-parser

app.post('/api/register', async (req, res) => {
    console.log(req.body)

    // HASHING the passwords

    const{username, password: plainTextPassword} = req.body

    if (!username || typeof username !== 'string'){
        return res.json({ status : 'error', error: 'Invalid username'})
    }

    if (!plainTextPassword || typeof plainTextPassword !== 'string'){
        return res.json({ status : 'error', error: 'Invalid password'})
    }

    if (plainTextPassword.length < 8){
        return res.json({ status : 'error', error: 'Password too small. Should be atleast 8 characters'})
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try{
        const response = await User.create({
            username,
            password
        })
        console.log('User created successfully:' , response)
    } catch(error){
        if(error.code === 1100){
            // duplicate key
            return res.json({ status: 'error', error: 'Username already in use'})
        }
        throw error
    }
    res.json({status: 'ok'})
})

app.listen(9999, () => {
    console.log('Server up at 9999')
})