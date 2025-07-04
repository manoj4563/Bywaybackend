const express = require('express')
const router = express.Router();
const multer = require('multer');
const path = require('path');

const coursedetail = require('../../models/coursemodel/coursedetail')
const coursesyllabus = require('../../models/coursemodel/coursesyllab')
const coursereview = require('../../models/coursemodel/coursereview')
const instructordetail = require('../../models/Instructormodel/instructordetail')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'coursethumbnail/'); // Store images in uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for files
    fieldSize: 10 * 1024 * 1024 // 10MB limit for non-file fields
  }, // 5MB limit
  fileFilter: fileFilter
});

router.post('/courseadd', upload.single('coursethumbnail'), async (req, res) => {
  try {
    const formdata = req.body;


    if (req.file) {
      formdata.coursethumbnail = req.file.filename; // or req.file.path if full path needed
    }

    const data = new coursedetail(formdata);
    await data.save();
    const syllabus = new coursesyllabus({
      courseid: formdata.courseid

    })

    const review = new coursereview({
      courseid: formdata.courseid
    })
    const instructor=await instructordetail.findOne({id:formdata.instructorid})
    instructor.courses.push(formdata.courseid)
    await instructor.save();
    await syllabus.save();
    await review.save();

    res.status(201).json({ message: 'Course added successfully', data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.get('/coursedetail', async (req, res) => {
  try {
    const data = await coursedetail.find(); // All course data
    const instructors = await instructordetail.find(); // All instructor data

    // Create a map for quick instructor lookup by ID
    const instructorMap = {};
    for (const ins of instructors) {
      instructorMap[ins.id] = ins.name; // or ins.fullname or ins.username etc.
    }

    // Add instructor name to each course
    const updatedData = data.map(course => {
      return {
        ...course._doc, // to spread MongoDB document fields properly
        instructorname: instructorMap[course.instructorid] || 'Unknown Instructor'
      };
    });

    if (updatedData.length > 0) {
      res.status(200).json(updatedData);
    } else {
      res.status(200).json('no data');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});




router.post('/courseindiviual',async(req,res)=>{
  const {courseid}=req.body
  const data=await coursedetail.findOne({courseid:courseid});
  if(data){

    res.status(200).json(data)
  }
  res.status(404).json('no data')
})

module.exports = router;