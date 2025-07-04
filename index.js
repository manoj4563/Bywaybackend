const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const multer = require('multer');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
dotenv.config();
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use('/userprofile', express.static('userprofile'));
app.use('/instructorprofile',express.static('instructorprofile'))
app.use('/coursethumbnail',express.static('coursethumbnail'))
app.use('/coursevideo',express.static('coursevideo'))
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const sanitizeHtml = require('sanitize-html');


connectDB()
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use('/userprofile', express.static(path.join(__dirname, 'userprofile')));



app.post('/certificate/generate', async (req, res) => {
  try {
    const { courseId, username, courseName } = req.body;

    if (!courseId || !username || !courseName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Load and encode the signature image in base64
    const fs = require('fs');
    const signaturePath = path.join(__dirname, 'userprofile', 'signature.png');
    const imageData = fs.readFileSync(signaturePath).toString('base64');
    const signatureUrl = `data:image/png;base64,${imageData}`;

    // Sanitize inputs and pass to EJS
    const sanitizedData = {
      name: sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} }),
      course: sanitizeHtml(courseName, { allowedTags: [], allowedAttributes: {} }),
      signatureUrl: signatureUrl, // now base64 image
    };

    // Render EJS template to HTML
    const templatePath = path.join(__dirname, 'views', 'certificate.ejs');
    const html = await ejs.renderFile(templatePath, sanitizedData);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    // Send PDF file to client
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${courseName.replace(/\s+/g, '_')}_Certificate.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






// routes import 

const usercredential=require('./routes/user/usercredential');
const productdata=require('./routes/course/courseedetail')
const syllabus=require('./routes/course/coursesyllabus')
const instructor=require('./routes/instructor/instructorget')
const indiviuallearning=require('./routes/user/userlearning')
const cart=require('./routes/user/usercart')
const message=require('./routes/user/usermessage')
const instructormessage=require('./routes/instructor/instructormessage')
const payment=require('./routes/payment/payment')
//routes defining
const review =require('./routes/review/coursescommonreview')
app.use('/user',usercredential);
app.use('/course',productdata)
app.use('/syllabus',syllabus)
app.use('/instructor',instructor);
app.use('/learning',indiviuallearning);
app.use('/cart',cart);
app.use('/message',message);
app.use('/instructormess',instructormessage)
app.use('/review',review);
app.use('/payment',payment);





app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Multer error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});