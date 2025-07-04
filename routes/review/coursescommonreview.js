const express = require('express');
const router = express.Router();
const logindetail = require('../../models/usermodel/userlogin');
const coursedetail = require('../../models/coursemodel/coursedetail');
const coursereview = require('../../models/coursemodel/coursereview');
const coursecommonreview = require('../../models/review/coursescommonreview');
const Counter = require('../../models/review/counter');



router.get('/getall',async(req,res)=>{
  const data=await coursecommonreview.find();
  if(data){
    res.status(200).json(data)
  }
  res.status(200).json('no review')
})

router.post('/setreview', async (req, res) => {
  const { username, message, rating, courseid } = req.body;

  if (!username || !courseid || !message || !rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Generate auto-increment reviewid
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'review' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const reviewid = 'REV-' + counter.seq.toString().padStart(3, '0');

    // 2. Create and save the review
    const newReview = new coursecommonreview({
      reviewid,
      holdername: username,
      courseid,
      review: message, // ensure this matches your schema
      rating: Number(rating)
    });
    await newReview.save();

    // 3. Update user's review list
    const login = await logindetail.findOne({ username });
    if (!login) return res.status(404).json({ error: 'User not found' });

    login.myreview = login.myreview || [];
    login.myreview.push(reviewid);
    await login.save();

    // 4. Update course's review list
    const course = await coursereview.findOne({ courseid });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.coursereview = course.coursereview || [];
    course.coursereview.push(reviewid);
    await course.save();

    // 5. Update overall course rating and review count
    const coursedet = await coursedetail.findOne({ courseid });
    if (!coursedet) return res.status(404).json({ error: 'Course detail not found' });

    const newTotalReview = (coursedet.totalreview || 0) + 1;
    const newTotalRating = (coursedet.totalrating || 0) + Number(rating);
    const avgRating = newTotalRating / newTotalReview;

    coursedet.totalreview = newTotalReview;
    coursedet.totalrating = newTotalRating;
    coursedet.rating = avgRating;
    await coursedet.save();

    // 6. Done
    return res.status(201).json({ message: 'Review submitted', reviewid });
  } catch (err) {
    console.error('Error setting review:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/myreview', async (req, res) => {
  try {
    const { holdername } = req.body;
    console.log(holdername);

    const user = await logindetail.findOne({ username: holdername });
    if (!user || !user.myreview || user.myreview.length === 0) {
      return res.status(200).json([]); // No reviews
    }

    const fin = [];
    for (let i = 0; i < user.myreview.length; i++) {
      const review = await coursecommonreview.findOne({ reviewid: user.myreview[i] });
      if (review) {
        const course = await coursedetail.findOne({ courseid: review.courseid });
        const coursename = course ? course.coursename : 'Unknown Course';
        fin.push({ ...review._doc, coursename });
      }
    }

    res.status(200).json(fin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
