const express = require('express');
const router = express.Router();
const InstructorMessage = require('../../models/Instructormodel/instructormessage'); 

router.post('/addInstructorMessage', async (req, res) => {
  const { id, username, message } = req.body;

  if (!id || !username || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const currentDate = new Date().toISOString(); // or use Date.now() if you prefer a timestamp

  try {
    // Check if instructor exists
    let instructor = await InstructorMessage.findOne({ id });

    if (!instructor) {
      // Create new instructor with message
      const newInstructor = new InstructorMessage({
        id,
        messages: [
          {
            username,
            messagedetail: [{ message, data: currentDate }]
          }
        ]
      });

      await newInstructor.save();
      return res.status(201).json({ message: 'New instructor and message added.' });
    }

    // Instructor exists, check if user exists in messages array
    const userMessage = instructor.messages.find(msg => msg.username === username);

    if (userMessage) {
      // Add message to existing user's message list
      userMessage.messagedetail.push({ message, data: currentDate });
    } else {
      // Add new user message block
      instructor.messages.push({
        username,
        messagedetail: [{ message, data: currentDate }]
      });
    }

    await instructor.save();
    return res.status(200).json({ message: 'Message added successfully.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
