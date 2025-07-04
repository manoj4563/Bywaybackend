const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const logindetail = require('../../models/usermodel/userlogin');
const indiviualprofile = require('../../models/usermodel/indiviualprofile');
const IndiviualMessage = require('../../models/usermodel/indiviualmessage');
const indiviuallearning = require('../../models/usermodel/Indiviuallearning');
const coursedetail = require('../../models/coursemodel/coursedetail')
const Instructordetail = require('../../models/Instructormodel/instructordetail');
const instructordetail = require('../../models/Instructormodel/instructordetail');



// Fix your GET route to use POST and properly check username
router.post('/username', async (req, res) => {
  try {
    const { username } = req.body;
    const exists = await logindetail.findOne({ username });
    if (exists) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;

    const data = new logindetail({
      firstname,
      lastname,
      username,
      email,
      password
    });
    await data.save();
    const userprofile = new indiviualprofile({
      holdername: username
    })
    const usermessage = new IndiviualMessage({
      holdername: username
    })
    const userlearning = new indiviuallearning({
      holdername: username
    })
    await userprofile.save();
    await usermessage.save();
    await userlearning.save();
    const userdetail = await logindetail.findOne({ email: email })
    const learning = await indiviuallearning.findOne({ holdername: username })
    res.status(200).json({ message: 'User registered successfully', data: userdetail, datalearn: learning });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { userdetail, password } = req.body;

    let user = await logindetail.findOne({ email: userdetail });
    if (!user) {
      user = await logindetail.findOne({ username: userdetail });
    }

    if (!user) {
      return res.status(404).json({ message: 'No user found' });
    }

    if (user.password === password) {
      const learning = await indiviuallearning.findOne({ holdername: user.username });
      return res.status(200).json({
        message: 'Login success',
        data: user,
        datalearn: learning || null
      });
    } else {
      return res.status(401).json({ message: 'User credential mismatch' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'userprofile/'); // Store images in uploads folder
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


router.post('/profile', upload.single('image'), async (req, res) => {
  const formdata = req.body;
  const updateData = {};

  if (formdata.holdername) updateData.holdername = formdata.holdername;
  else return res.status(400).send('No holdername provided');

  if (formdata.headline) updateData.headline = formdata.headline;
  if (formdata.description) updateData.description = formdata.description;
  if (formdata.language) updateData.language = formdata.language;
  if (formdata.links) updateData.links = formdata.links;


  if (req.file) {
    updateData.image = req.file.path;
  }

  try {
    const existingUser = await indiviualprofile.findOne({ holdername: formdata.holdername });

    if (existingUser) {
      await indiviualprofile.updateOne({ holdername: formdata.holdername }, { $set: updateData });
      return res.status(200).json({ message: "Profile updated successfully" });
    } else {
      const newUser = new indiviualprofile(updateData);
      await newUser.save();
      return res.status(201).json({ message: "Profile created successfully" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});


router.post('/userget', async (req, res) => {
  const { username } = req.body;

  try {
    const data = await logindetail.findOne({ username: username });

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/profileget', async (req, res) => {
  const { username } = req.body;

  try {
    const data = await indiviualprofile.findOne({ holdername: username });

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/userteacher', async (req, res) => {
  const { username } = req.body;

  try {

    const userData = await indiviuallearning.findOne({ holdername: username });
    console.log(userData);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    const courseArr = userData.courses;
    const courseid = []
    for (let i = 0; i < courseArr.length; i++) {
      courseid.push(courseArr[i].courseid)
    }
    console.log(courseid);

    const courseDetails = await coursedetail.find({ courseid: { $in: courseid } });

    const instructorIds = courseDetails.map(course => course.instructorid);
    const uniqueInstructorIds = [...new Set(instructorIds)];


    const instructors = await Instructordetail.find({ id: { $in: uniqueInstructorIds } });
    console.log(instructors);
    return res.json(instructors);

  } catch (error) {
    console.error('Error fetching instructor details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/cart', async (req, res) => {
  const { courseid, username } = req.body;

  if (!courseid || !username) {
    return res.status(400).json({ error: 'Missing courseid or username' });
  }

  try {
    const user = await logindetail.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!Array.isArray(user.carddata)) {
      user.carddata = [];
    }

    // Avoid duplicate entries
    if (!user.carddata.includes(courseid)) {
      user.carddata.push(courseid);
      await user.save();
    }

    return res.status(200).json({ message: 'Course added to cart' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/wishlistadd', async (req, res) => {
  const { username, courseid } = req.body;

  if (!username || !courseid) {
    return res.status(400).json({ error: 'Missing username or courseid' });
  }

  try {
    const user = await logindetail.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!Array.isArray(user.whisliste)) {
      user.whisliste = [];
    }

    if (!user.whisliste.includes(courseid)) {
      user.whisliste.push(courseid);
      await user.save();
    }

    return res.status(200).json({ message: 'Course added to wishlist' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/cartremove', async (req, res) => {
  const { username, courseid } = req.body;

  if (!username || !courseid) {
    return res.status(400).json({ error: 'Missing username or courseid' });
  }

  try {
    const user = await logindetail.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.carddata = user.carddata.filter(id => id !== courseid);
    await user.save();

    return res.status(200).json({ message: 'Course removed from cart' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/wishlistget', async (req, res) => {
  const { username } = req.body;
  console.log("Fetching wishlist for:", username);

  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  try {
    const user = await logindetail.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const courses = user.whisliste || [];
    if (courses.length === 0) {
      return res.status(200).json([]);  // Return empty if no wishlist
    }

    const final = await Promise.all(
      courses.map(async (courseId) => {
        const course = await coursedetail.findOne({ courseid: courseId });
        if (!course) return null;

        const instructor = await instructordetail.findOne({ id: course.instructorid });
        return {
          ...course.toObject(),
          instructorName: instructor?.name || 'Unknown Instructor',
        };
      })
    );

    const filteredFinal = final.filter(item => item !== null); // remove nulls if any course is missing
    return res.status(200).json(filteredFinal);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/cartaddwhisliste', async (req, res) => {
  const { username, courseid } = req.body;

  if (!username || !courseid) {
    return res.status(400).json({ error: 'Missing username or courseid' });
  }

  try {
    const user = await logindetail.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure carddata exists
    if (!Array.isArray(user.carddata)) {
      user.carddata = [];
    }

    // Add to cart if not already there
    if (!user.carddata.includes(courseid)) {
      user.carddata.push(courseid);
    }

    // Remove from wishlist if it exists
    if (Array.isArray(user.whisliste)) {
      user.whisliste = user.whisliste.filter(id => id !== courseid);
    }

    await user.save();

    return res.status(200).json({ message: 'Course moved to cart from wishlist' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/wishlistremove', async (req, res) => {
  const { username, courseid } = req.body;

  if (!username || !courseid) {
    return res.status(400).json({ error: 'Missing username or courseid' });
  }

  try {
    const user = await logindetail.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Make sure wishlist exists
    if (!Array.isArray(user.whisliste)) {
      user.whisliste = [];
    }

    // Remove course from wishlist
    user.whisliste = user.whisliste.filter(id => id !== courseid);

    await user.save();

    return res.status(200).json({ message: 'Course removed from wishlist' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});










module.exports = router;