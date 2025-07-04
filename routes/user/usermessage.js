const express=require('express')
const router = express.Router();

const IndiviualMessage=require('../../models/usermodel/indiviualmessage')
const indiviualprofile=require('../../models/usermodel/indiviualprofile')
const instructordetail=require('../../models/Instructormodel/instructordetail')



const InstructorMessage = require('../../models/Instructormodel/instructormessage');

router.post('/getConversation', async (req, res) => {
  const { holdername, instructorid } = req.body;

  if (!holdername || !instructorid) {
    return res.status(400).json({ error: 'Missing holdername or instructorid' });
  }

  try {
    const result = [];

    // ✅ Messages from instructor to holder (label as "res")
    const indiviualData = await IndiviualMessage.findOne({ holdername });
    if (indiviualData) {
      const instructorBlock = indiviualData.messagearray.find(
        entry => entry.instructorid === instructorid
      );

      if (instructorBlock) {
        instructorBlock.messagedetail.forEach(msg => {
          result.push({
            message: msg.message,
            date: msg.date,
            label: 'res'
          });
        });
      }
    }

    // ✅ Messages from holder to instructor (label as "req")
    const instructorData = await InstructorMessage.findOne({ id: instructorid });
    if (instructorData) {
      const userMessageBlock = instructorData.messages.find(
        entry => entry.username === holdername
      );

      if (userMessageBlock) {
        userMessageBlock.messagedetail.forEach(msg => {
          result.push({
            message: msg.message,
            date: msg.data,
            label: 'req'
          });
        });
      }
    }

    // ✅ Sort messages by date
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});









router.post('/profileget',async(req,res)=>{
    const {username}=req.body;
    const data=await indiviualprofile.findOne({holdername:username})
    if(data){
        res.status(200).json(data);
    }
    res.status(400).json('error')
})





router.post('/addMessageFromInstructor', async (req, res) => {
  const { holdername, instructorid, message } = req.body;

  if (!holdername || !instructorid || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const currentDate = new Date().toISOString();

  try {
    // Check if user document exists
    let user = await IndiviualMessage.findOne({ holdername });

    if (!user) {
      // Create new user with instructor message
      const newUser = new IndiviualMessage({
        holdername,
        messagearray: [
          {
            instructorid,
            messagedetail: [{ message, date: currentDate }]
          }
        ]
      });

      await newUser.save();
      return res.status(201).json({ message: 'New user and instructor message added.' });
    }

    // User exists, check if instructor already exists in messagearray
    const instructorMessageBlock = user.messagearray.find(m => m.instructorid === instructorid);

    if (instructorMessageBlock) {
      // Append new message
      instructorMessageBlock.messagedetail.push({ message, date: currentDate });
    } else {
      // Add new instructor with initial message
      user.messagearray.push({
        instructorid,
        messagedetail: [{ message, date: currentDate }]
      });
    }

    await user.save();
    return res.status(200).json({ message: 'Message added successfully.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/getmessagefrominstructor', async (req, res) => {
  try {
    const { holdername } = req.body;

    const userData = await IndiviualMessage.findOne({ holdername });

    if (!userData || !userData.messagearray || userData.messagearray.length === 0) {
      return res.status(200).json([]);
    }

    // Build the array with instructorid and last message
    const fin = userData.messagearray.map((item) => ({
      instructorid: item.instructorid,
      message: item.messagedetail?.[item.messagedetail.length - 1] || null,
    }));
    console.log('fin',fin,'qallllll')
    // Append instructor name and image
    for (let i = 0; i < fin.length; i++) {
      const instructor = await instructordetail.findOne({ id: fin[i].instructorid });
      console.log(instructor)
      fin[i] = {
        ...fin[i],
        name: instructor?.name || 'Unknown',
        image: instructor?.image || null,
      };
    }
    console.log(fin)
    res.status(200).json(fin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





module.exports=router;