"use server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

export const sendToEmailAndSheets = async (
  name: string,
  email: string,
  phone: string,
  message: string
) => {
  try {
    //Send email to owner
    sendEmail(name, email, phone, message);

    // Send data to google sheets
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
};

export const sendEmail = async (
  name: string,
  email: string,
  phone: string,
  message: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const emailBody = `
    <h1>New Inquiry from ${name}</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;

  try {
    const recipient = process.env.SEND_MAIL_TO_OWNER;
    const info = await transporter.sendMail({
      from: `"The Ohio Tint & Vinyl Company" <${process.env.GMAIL_USER}>`,
      to: recipient,
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
