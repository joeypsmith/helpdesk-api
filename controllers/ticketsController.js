const User = require('../models/User')
const Ticket = require('../models/Ticket')
const asyncHandler = require('express-async-handler')

// @desc Get all tickets
// @route GET /tickets
// @access Private

const getAllTickets = asyncHandler(async(req, res) => {
    const tickets = await Ticket.find({}).lean()
    if(!tickets?.length) {
        return res.status(400).json({message: 'No tickets found'})
    }

    const ticketsWithUser = await Promise.all(tickets.map(async (ticket) => {
        const user = await User.findById(ticket.user).lean().exec()
        const assignedUser = await User.findById(ticket.assignedUser).lean().exec()
        if(!assignedUser) {
            return { ...ticket, username: user.username }
        } 
        return { ...ticket, username: user.username, assignedUsername: assignedUser.username }
    }))

    res.json(ticketsWithUser)
})

// @desc Create new ticket
// @route POST /tickets
// @access Private

const createNewTicket = asyncHandler(async(req, res) => {
    const { user, title, body } = req.body

    if(!user || !title || !body) {
        return res.status(400).json({ message: "Please provide all required fields" })
    }

    const ticket = await Ticket.create({user, title, body})

    if(ticket) {
        res.status(201).json({ message: `Ticket #${ticket.ticketId} created`})
    } else {
        res.status(400).json({ message: 'Invalid ticket data received' })
    }
})

// @desc Update ticket
// @route PATCH /tickets
// @access Private

const updateTicket = asyncHandler(async(req, res) => {
    const { id, contact, title, body, status, type, category, assignedTo } = req.body
    if(!id || !contact || !title || !body || !status || !type || !category || !assignedTo) {
        return res.status(400).json({ message: 'Please provide all required fields'})
    }

    const ticket = await Ticket.findById(id).exec()
    if(!ticket) {
        return res.status(400).json({ message: 'Ticket not found'})
    }

    ticket.contact = contact
    ticket.title = title
    ticket.body = body
    ticket.status = status
    ticket.type = type
    ticket.category = category
    ticket.assignedTo = assignedTo

    const updatedTicket = await ticket.save()

    res.json({ message: `Ticket #${ticket.ticketId} updated`})

})

// @desc Delete ticket
// @route GET /tickets
// @access Private

const deleteTicket = asyncHandler(async(req, res) => {
    const {id} = req.body

    if(!id) {
        return res.status(400).json({ message: 'Ticket ID Required'})
    }

    const ticket = await Ticket.findById(id).exec()

    if(!ticket) {
        return res.status(400).json({ message: 'Ticket not found'})
    }

    await ticket.deleteOne()

    res.json({ message: `Ticket #${ticket.ticketId} deleted`})
}) 

module.exports = { getAllTickets, createNewTicket, updateTicket, deleteTicket }