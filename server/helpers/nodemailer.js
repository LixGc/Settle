const nodemailer = require("nodemailer");
const totalNightConverter = require("./totalNightConverter");

// Sends emails from the Gmail account in .env
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Emails the 4-digit login code
async function sendOTPByEmail(email, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Settle login code",
        text: `Your Settle login code is: ${otp}`,
    });
}

// Shows prices like $1,234.00
const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
};

// Bookings are saved at midnight UTC, so show them in UTC to keep the same day
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

// Place names are typed by hosts, so stop them from adding their own HTML to the email
const escapeHtml = (text) => {
    return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
};

// Emails the invoice after a booking is paid
// booking needs its Property and User included
async function sendInvoiceEmail(booking, paymentId) {
    const nights = totalNightConverter(booking.startDate, booking.endDate);
    const invoiceNumber = "SET-" + String(booking.id).padStart(5, "0");
    // Each line of the invoice: label, value
    const rows = [
        ["Invoice number", invoiceNumber],
        ["Paid on", formatDate(new Date())],
        ["Place", booking.Property ? `${booking.Property.name}, ${booking.Property.location}` : "Settle booking"],
        ["Check-in", formatDate(booking.startDate)],
        ["Check-out", formatDate(booking.endDate)],
        ["Price", `${formatPrice(booking.totalPrice / nights)} x ${nights} ${nights === 1 ? "night" : "nights"}`],
        ["Payment reference", paymentId],
    ];
    const tableRows = rows.map(([label, value]) => `<tr><td style="padding:6px 0;color:#6B7A75">${label}</td><td style="padding:6px 0;text-align:right">${escapeHtml(value)}</td></tr>`).join("");

    await transporter.sendMail({
        from: `"Settle" <${process.env.EMAIL_USER}>`,
        to: booking.User.email,
        subject: `Your Settle invoice ${invoiceNumber}`,
        text: `Hi ${booking.User.fullName}, thanks for your booking.\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\nTotal paid: ${formatPrice(booking.totalPrice)}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1E2A27">
                <h2 style="color:#1F6F5C">Settle</h2>
                <p>Hi ${escapeHtml(booking.User.fullName)}, thanks for your booking. Here is your invoice.</p>
                <table style="width:100%;border-collapse:collapse">${tableRows}
                    <tr><td style="padding:12px 0;border-top:1px solid #E6ECEA;font-weight:bold">Total paid</td>
                    <td style="padding:12px 0;border-top:1px solid #E6ECEA;text-align:right;font-weight:bold;color:#1F6F5C">${formatPrice(booking.totalPrice)}</td></tr>
                </table>
                <p style="color:#6B7A75;font-size:13px">You can see this booking any time in the Bookings tab of the Settle app.</p>
            </div>`,
    });
}

// Random 4-digit code, like 0427
function generateOTP() {
    let otp = "";
    for (let i = 0; i < 4; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

module.exports = { generateOTP, sendOTPByEmail, sendInvoiceEmail };