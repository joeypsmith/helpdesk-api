const User = require('../models/User')
const Ticket = require('../models/Ticket')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find({}).select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }
    res.json(users)
})

// @desc Create new users
// @route POST /users
// @access Private

const createNewUser = asyncHandler(async(req, res) => {
    const { username, password, roles } = req.body

    // Confirming data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'Please provide all required fields' })
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10) // 10 is the number of rounds

    const userObject = {
        username,
        password: hashedPassword,
        roles
    }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({ message: `User ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})

// @desc Update a user
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async(req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== "boolean") {
        return res.status(400).json({ message: 'Please provide all required fields' })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
        // Allow updates to original user
    if (duplicate && duplicate ?._id.toString() != id) {
        return res.status(409).json({ message: 'User already exists' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        // Hashing password
        user.password = await bcrypt.hash(password, 10) // 10 rounds
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated`})
})

// @desc Delete a user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async(req, res) => {
    const {id} = req.body

    if(!id) {
        return res.status(400).json({ message: 'User ID Required'})
    }

    const ticket = await Ticket.findOne({ user: id }).lean().exec()
    if(ticket) {
        return res.status(400).json({ message: 'User has assigned tickets'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found'})
    }

    await user.deleteOne()

    const reply = `Username ${user.username} with ID ${user._id} deleted`

    res.json({message : reply})
})

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }