const express = require('express')
const router = express.Router();

const Indiviuallearning = require('../../models/usermodel/Indiviuallearning')
const coursesyllab = require('../../models/coursemodel/coursesyllab');
const indiviuallearning = require('../../models/usermodel/Indiviuallearning');
const instructordetail=require('../../models/Instructormodel/instructordetail')
const coursedetail=require('../../models/coursemodel/coursedetail')
router.post('/newcourse', async (req, res) => {
  try {
    const { courseid, holdername } = req.body;
    const instructorid= await coursedetail.findOne({instructorid:1},{courseid:courseid});
    const instructordet=await instructordetail.findOne({instructorid})
   instructordet.totalStudents = (parseInt(instructordet.totalStudents || '0') + 1).toString();

    await instructordet.save();
    const coursedata = await coursesyllab.findOne({ courseid });
    if (!coursedata) return res.status(404).json({ error: 'Course not found' });


    const data1 = coursedata.syllabus.flatMap((section) =>
      section.lessons.map((lesson) => ({
        section: section.section,
        lesson: lesson.lesson,
        coursecontent: lesson.coursecontent,
        completed: false
      }))
    );

    const holder = await Indiviuallearning.findOne({ holdername });

    const newcourse = {
      courseid: courseid,
      coursestatus: data1
    };

    if (holder) {

      const existingCourseIndex = holder.courses.findIndex(c => c.courseid === courseid);

      if (existingCourseIndex !== -1) {

        holder.courses[existingCourseIndex] = newcourse;
      } else {

        holder.courses.push(newcourse);
      }

      await holder.save();
      console.log(newcourse, 'updated holder');
    } else {

      const data = new Indiviuallearning({
        holdername: holdername,
        courses: [newcourse]
      });
      await data.save();
      console.log(data, 'new holder');
    }

    res.status(200).json({ message: 'Syllabus assigned to holder', coursedata: newcourse });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});






router.post('/courseget', async (req, res) => {
  const { username, courseid } = req.body;
  console.log(username, courseid);

  try {
    const data = await Indiviuallearning.findOne({ holdername: username });
    console.log(data, 'hello');

    if (!data || !Array.isArray(data.courses)) {
      return res.status(200).json('no data found');
    }

    const courseIndex = data.courses.findIndex((item) => item.courseid === courseid);

    if (courseIndex !== -1) {
      const courseData = data.courses[courseIndex];

      // Add view status and progress calculation
      const totalLessons = courseData.coursestatus.length;
      const completedLessons = courseData.coursestatus.filter(lesson => lesson.completed || lesson.viewed).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      res.status(200).json({
        courseid: courseData,
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: progressPercentage
        }
      });
    } else {
      res.status(200).json('no data found');
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/markVideoViewed', async (req, res) => {
  const { username, courseid, section, lesson } = req.body;

  if (!username || !courseid || !section || !lesson) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await Indiviuallearning.findOne({ holdername: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the course by courseid
    const course = user.courses.find(c => c.courseid === courseid);
    if (!course) {
      return res.status(404).json({ error: 'Course not found for this user' });
    }

    // Find the lesson by section and lesson name
    const lessonObj = course.coursestatus.find(
      l => l.section === section && l.lesson === lesson
    );

    if (!lessonObj) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Prevent re-marking
    if (lessonObj.completed || lessonObj.viewed) {
      return res.status(200).json({
        error: 'Video already marked as viewed and cannot be changed',
        isViewed: true
      });
    }

    // Mark as viewed and completed
    lessonObj.completed = true;
    lessonObj.viewed = true;
    lessonObj.viewedAt = new Date();

    await user.save(); // With sub-schemas, this will now persist!

    // Recalculate progress
    const totalLessons = course.coursestatus.length;
    const completedLessons = course.coursestatus.filter(
      l => l.completed || l.viewed
    ).length;

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    res.status(200).json({
      message: 'Video marked as viewed successfully',
      progress: {
        completed: completedLessons,
        total: totalLessons,
        percentage: progressPercentage
      },
      updatedLesson: lessonObj
    });

  } catch (err) {
    console.error('Error marking video as viewed:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});



router.post('/getCourseProgress', async (req, res) => {
  const { username, courseid } = req.body;

  try {
    const data = await Indiviuallearning.findOne({ holdername: username });

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    const course = data.courses.find((item) => item.courseid === courseid);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const totalLessons = course.coursestatus.length;
    const completedLessons = course.coursestatus.filter(lesson => lesson.viewed || lesson.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const lessonDetails = course.coursestatus.map(lesson => ({
      section: lesson.section,
      lesson: lesson.lesson,
      completed: lesson.completed || false,
      viewed: lesson.viewed || false,
      viewedAt: lesson.viewedAt || null
    }));

    res.status(200).json({
      courseid,
      progress: {
        completed: completedLessons,
        total: totalLessons,
        percentage: progressPercentage
      },
      lessons: lessonDetails
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






router.post('/coursestaken', async (req, res) => {
  try {
    const { username } = req.body;

    const userData = await indiviuallearning.findOne({ holdername: username });
    if (!userData) {
      return res.json([]);
    }

    const userCourses = userData.courses;
    const courseIds = userCourses.map(course => course.courseid);

    // Map courseid to progress percentage
    const learningstatus = userCourses.map(course => {
      const totalLessons = course.coursestatus.length;
      const completedLessons = course.coursestatus.filter(
        l => l.completed || l.viewed
      ).length;

      const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
      return {
        courseid: course.courseid,
        progress: progressPercentage
      };
    });

    // Create progress map
    const progressMap = {};
    learningstatus.forEach(item => {
      progressMap[item.courseid] = item.progress;
    });

    const courseDetails = await coursedetail.find({ courseid: { $in: courseIds } });

    const instructorIds = courseDetails.map(course => course.instructorid);
    const instructors = await instructordetail.find({ id: { $in: instructorIds } });

    const instructorMap = {};
    for (const instructor of instructors) {
      instructorMap[instructor.id] = instructor.name;
    }

    const mergedData = courseDetails.map(course => {
      const userCourseData = userCourses.find(c => c.courseid === course.courseid);
      return {
        ...course._doc,
        ...userCourseData,
        progress: progressMap[course.courseid],
        instructorname: instructorMap[course.instructorid] || 'Unknown Instructor'
      };
    });

    res.status(200).json(mergedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});





module.exports = router;