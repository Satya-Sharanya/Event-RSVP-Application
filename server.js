const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/event_rsvp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define the Event model
const Event = mongoose.model('Event', new mongoose.Schema({
  id: { type: Number, unique: true, min: 1, max: 100 },
  name: String,
  date: Date,
  attendees: [{ name: String, phone: String }]
}));

// Middleware
app.use(bodyParser.json());

// Create a new event
async function createEvent(req, res) {
  const eventId = req.body.id;
  const eventName = req.body.name;
  const eventDate = req.body.date;

  // Check if event ID is already taken
  const existingEvent = await Event.findOne({ id: eventId });
  if (existingEvent) {
    res.status(400).send({ message: `Event ID ${eventId} is already taken. Please choose a different ID.` });
  } else {
    const event = new Event({
      id: eventId,
      name: eventName,
      date: eventDate
    });
    await event.save();
    res.send({ message: `Event created with ID ${eventId}` });
  }
}

// Get all events
async function getEvents(req, res) {
  const events = await Event.find();
  res.send(events);
}

// Get a single event by ID
async function getEventById(req, res) {
  const eventId = req.params.id;
  const event = await Event.findOne({ id: eventId });
  if (!event) {
    res.status(404).send({ message: 'Event not found' });
  } else {
    res.send(event);
  }
}

// RSVP to an event
async function rsvpToEvent(req, res) {
  const eventId = req.body.id;
  const name = req.body.name;
  const phone = req.body.phone;

  const event = await Event.findOne({ id: eventId });
  if (!event) {
    res.status(404).send({ message: 'Event not found' });
  } else {
    event.attendees.push({ name: name, phone: phone });
    await event.save();
    res.send({ message: `RSVP for event ID ${eventId}` });
  }
}

// Get attendees for an event
async function getAttendees(req, res) {
  const eventId = req.params.id;
  const event = await Event.findOne({ id: eventId });
  if (!event) {
    res.status(404).send({ message: 'Event not found' });
  } else {
    res.send(event.attendees);
  }
}

// Define API endpoints
app.post('/events', createEvent);
app.get('/events', getEvents);
app.get('/events/:id', getEventById);
app.post('/events/:id/rsvp', rsvpToEvent);
app.get('/events/:id/attendees', getAttendees);

// Start server
app.use(express.static('public'));
app.listen(3000, () => console.log('Server running on port 3000'));