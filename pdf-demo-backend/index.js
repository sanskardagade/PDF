require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const ConvertApi = require('convertapi')(process.env.CONVERTAPI_SECRET);


const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.send('PDF demo backend running');
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file');
  res.setHeader('Content-Type', 'application/pdf');
  res.send(req.file.buffer);
});

app.post('/api/merge', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).send('Upload at least 2 PDFs');
    }

    const mergedPdf = await PDFDocument.create();

    for (const f of req.files) {
      const pdf = await PDFDocument.load(f.buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((p) => mergedPdf.addPage(p));
    }

    const mergedBytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(Buffer.from(mergedBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error merging PDFs');
  }
});

app.post('/api/convert/pdf-to-docx', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file');

    const tmpPath = path.join(__dirname, 'tmp-' + Date.now() + '.pdf');
    fs.writeFileSync(tmpPath, req.file.buffer);

    const result = await ConvertApi.convert('docx', { File: tmpPath }, 'pdf');
    const savedFiles = await result.saveFiles(__dirname);

    const docxPath = savedFiles[0];
    const fileStream = fs.createReadStream(docxPath);
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=converted.docx'
    );
    fileStream.pipe(res);

    fileStream.on('close', () => {
      fs.unlinkSync(tmpPath);
      fs.unlinkSync(docxPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error converting file');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on port', PORT));
