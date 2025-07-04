const express = require('express')
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'coursevideo/'); // Store images in uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|pdf|doc/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only video are allowed'));
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 400 * 1024 * 1024, // 5MB limit for files
    fieldSize: 400 * 1024 * 1024 // 10MB limit for non-file fields
  }, // 5MB limit
  fileFilter: fileFilter
});


const coursesyllabus = require('../../models/coursemodel/coursesyllab')






router.post('/coursesyllabus', upload.single('coursecontent'), async (req, res) => {
  try {
    const { section, lesson, courseid } = req.body;
    const lessonduration = Number(req.body.lessonduration);
    const coursecontent = req.file?.path || "";

    const data = await coursesyllabus.findOne({ courseid });
    if (!data) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Ensure totalduration is valid
    let totalduration = data.totalduration || 0;
    totalduration += lessonduration;

    // Initialize syllabus if missing
    let syllabus = data.syllabus || [];

    // Find section
    const sectionIndex = syllabus.findIndex(sec => sec.section === section);

    if (sectionIndex === -1) {
      // Create new section
      syllabus.push({
        section,
        lessons: [{ lesson, coursecontent, lessonduration }]
      });
    } else {
      // Push to existing section
      if (!Array.isArray(syllabus[sectionIndex].lessons)) {
        syllabus[sectionIndex].lessons = [];
      }

      syllabus[sectionIndex].lessons.push({ lesson, coursecontent, lessonduration });
    }

    // Reassign back to document fields
    data.syllabus = syllabus;
    data.totalduration = totalduration;

    await data.save();

    res.status(200).json({ message: 'Syllabus updated successfully', syllabus: data.syllabus });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


router.post('/syllabusindiviualget', async (req, res) => {
  const { courseid } = req.body;

  try {
    const data = await coursesyllabus.findOne({ courseid: courseid })

    if (data) {
      console.log(data);
      res.status(201).json(data);

    }
    else {
      res.status(200).send('no data')
    }
  }
  catch (err) {
    res.status(404).json(err)
  }
})

module.exports = router;
