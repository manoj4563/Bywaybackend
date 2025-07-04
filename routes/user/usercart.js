const express = require('express');
const router = express.Router();
const logindetail = require('../../models/usermodel/userlogin');
const coursedetail = require('../../models/coursemodel/coursedetail');
const instructordetail = require('../../models/Instructormodel/instructordetail')


router.post('/cartdetail', async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user by username
    const data = await logindetail.findOne({ username });
    console.log(data);
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    const arr = data.carddata || []; // Corrected to cartdata
    const final = [];
    console.log(arr)

    // Fetch course and instructor details for each courseid in cartdata
    for (let i = 0; i < arr.length; i++) {
      const courseData = await coursedetail.findOne({ courseid: arr[i] });
      if (courseData) {
        console.log(courseData.instructorid)
        // Fetch instructor details
        const instructorData = await instructordetail.findOne({ id: courseData.instructorid }); // Use 'id' from schema
        if (instructorData) {
          // Combine course data with only instructor name
          final.push({
            ...courseData.toObject(), // Convert Mongoose document to plain object
            instructorName: instructorData.name || 'Unknown Instructor',
          });
        } else {
          // If instructor not found, include course data with fallback name
          final.push({
            ...courseData.toObject(),
            instructorName: 'Unknown Instructor',
          });
        }
      }
    }

    res.json(final);
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;