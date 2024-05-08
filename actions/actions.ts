"use server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

export const handleSubmit = async (formData: FormData) => {
  const name = formData.get("Name") as string;
  const email = formData.get("Email") as string;
  const phone = formData.get("Phone") as string;
  const message = formData.get("Message") as string;

  // console.log(name, subject, message);

  try {
    try {
      sendEmail(name, email, phone, message);
      console.log("Success");
    } catch (error) {
      console.log("Error");
    }

    const serviceAccountAuth = new JWT({
      // env var values here are copied from service account credentials generated by google
      // see "Authentication" section in docs for more info
      email: process.env.CHRIS_GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.CHRIS_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(
      process.env.CHRIS_GOOGLE_SHEETS_ID!,
      serviceAccountAuth
    );

    await doc.loadInfo(); // loads document properties and worksheets
    // const sheet = await doc.addSheet({ headerValues: ["name", "email"] });

    const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`

    const formatDate = () => {
      const now = new Date();
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthName = months[now.getMonth()]; // Get month name from array
      const day = now.getDate(); // Get day of the month
      const year = now.getFullYear(); // Get full year
      return `${monthName} ${day}, ${year}`; // Format the date string
    };

    const addRow = await sheet.addRows([
      {
        Name: name,
        Email: email,
        Phone: phone,
        Message: message,
        Date: formatDate(),
      },
    ]);
  } catch {
    console.log("Google api error");
  }

  console.log("on the server");
};

export const sendEmail = async (
  name: string,
  email: string,
  phone: string,
  message: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.OFFICE365_SMTP_USER,
      pass: process.env.OFFICE365_SMTP_PASS,
    },
  });

  const emailBody = `
    <h1>New Inquiry from Website</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"The Ohio Tint & Vinyl Company" <chris@theohtv.com>',
      to: process.env.OFFICE365_SMTP_USER,
      replyTo: email,
      subject: `New Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      html: emailBody,
    });

    console.log("Message sent");
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};