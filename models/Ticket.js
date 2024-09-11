const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const ticketSchema = new mongoose.Schema({
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Open'
    },
    type: {
        type: String,
        required: true,
        default: 'Issue'
    },
    category: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

ticketSchema.plugin(AutoIncrement, { inc_field: 'ticketId', id: 'ticketNum', start_seq: 0 })

module.exports = mongoose.model('Ticket', ticketSchema)