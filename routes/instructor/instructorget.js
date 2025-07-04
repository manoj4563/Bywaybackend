const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const instructordetail = require('../../models/Instructormodel/instructordetail')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'instructorprofile/');
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


router.post('/instructorgetdetail', async (req, res) => {
    const {instructorid} = req.body;
     console.log(instructorid,'hello')
    const data = await instructordetail.find({ id: instructorid })
    if (data) {
        console.log(data)
        res.status(200).json(data)
        
    }
    else { res.status(200).json('no data') }
})

router.get('/allinstructor', async (req, res) => {
  try {
    const data = await instructordetail.find();
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ error: 'No instructors found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});


router.post('/instructoradd', upload.single('image'), async (req, res) => {
    const formdata = req.body;
    try {
        if (req.file) {
            formdata.image = req.file.filename;
        }
        const sanitizeAndSplit = (str) =>
            str.split(',')
                .map(s => s.trim())
                .filter(Boolean);

        const courses = sanitizeAndSplit(formdata.courses);
        const areaofexperience = sanitizeAndSplit(formdata.areaofexperience);

        formdata.courses = courses;
        formdata.areaofexperience = areaofexperience;
        const data = new instructordetail(formdata)
        await data.save();
        res.status(201).json({ message: 'Instructor added successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Server error' });
    }
})

module.exports = router;