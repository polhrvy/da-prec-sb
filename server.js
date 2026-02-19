const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/send", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "chca.repato.up@phinmaed.com", // CHANGE IF NEEDED
      pass: "eudealzoqoftnpye", // PUT YOUR APP PASSWORD HERE
    },
  });

  try {
    await transporter.sendMail({
      from: `"DA-PREC Contact" <chca.repato.up@phinmaed.com>`,
      to: "chca.repato.up@phinmaed.com",
      replyTo: email,
      subject: subject,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
