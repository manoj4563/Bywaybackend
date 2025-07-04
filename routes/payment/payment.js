const express = require('express')
const router = express.Router();






const logindetail = require('../../models/usermodel/userlogin');
const coursedetail = require('../../models/coursemodel/coursedetail')
const Indiviuallearning = require('../../models/usermodel/Indiviuallearning')
const coursesyllab = require('../../models/coursemodel/coursesyllab');
const indiviuallearning = require('../../models/usermodel/Indiviuallearning');


router.post('/create-order', async (req, res) => {
  const { username, courseid, amount } = req.body;

  const order_id = 'ORDER_' + Date.now();

  try {
    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      {
        order_id,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: username,
          customer_email: `${username}@yourapp.com`, // mock email
          customer_phone: '9999999999',
          customer_name: username
        },
        order_tags: { courseid }
      },
      {
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ payment_session_id: response.data.payment_session_id });
  } catch (err) {
    res.status(500).json({ error: 'Cashfree order failed' });
  }
});


router.post('/payment-webhook', express.json(), async (req, res) => {
  const event = req.body;

  try {
    if (
      event.event === 'PAYMENT_SUCCESS_WEBHOOK' &&
      event.data.payment.payment_status === 'SUCCESS'
    ) {
      const username = event.data.customer_details.customer_name;
      const holdername = username;
      const courseid = event.data.order.order_tags.courseid;

      const user = await logindetail.findOne({ username });
      if (!user) return res.status(404).send('User not found');

      if (!user.courses.includes(courseid)) {
        user.courses.push(courseid);
        await user.save();

        const course = await coursedetail.findOne({ courseid });
        if (course) {
          course.totalbuy += 1;
          await course.save();
        }

        const coursedata = await coursesyllab.findOne({ courseid });
        if (!coursedata) return res.status(404).json({ error: 'Course not found' });

        const data1 = coursedata.syllabus.flatMap((section) =>
          section.lessons.map((lesson) => ({
            section: section.section,
            lesson: lesson.lesson,
            coursecontent: lesson.coursecontent,
            completed: false,
          }))
        );

        const existing = await Indiviuallearning.findOne({ holdername });

        const newcourse = {
          courseid,
          coursestatus: data1,
        };

        if (existing) {
          const idx = existing.courses.findIndex((c) => c.courseid === courseid);
          if (idx !== -1) {
            existing.courses[idx] = newcourse;
          } else {
            existing.courses.push(newcourse);
          }
          await existing.save();
        } else {
          const newData = new Indiviuallearning({
            holdername,
            courses: [newcourse],
          });
          await newData.save();
        }

        console.log(`✅ Enrolled ${username} to ${courseid}`);
      }

      return res.status(200).send('Webhook processed');
    }

    return res.status(200).send('Ignored');
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return res.status(500).send('Webhook failed');
  }
});


module.exports = router