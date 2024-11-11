"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccessGrantedEmail = exports.sendAccessRequestEmail = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();
// Initialize nodemailer with iCloud SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: functions.config().email.user,
        pass: functions.config().email.pass
    },
    tls: {
        ciphers: 'SSLv3'
    }
});
// Verify transporter configuration
transporter.verify((error) => {
    if (error) {
        console.error('SMTP configuration error:', error);
    }
    else {
        console.log('SMTP server is ready to send emails');
    }
});
exports.sendAccessRequestEmail = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to request access');
    }
    const { candidateId, recruiterEmail, recruiterName, recruiterPhone, requestDetails } = data;
    try {
        // Get candidate email from their profile
        const candidateDoc = await admin.firestore()
            .collection('users')
            .doc(candidateId)
            .get();
        if (!candidateDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Candidate profile not found');
        }
        const candidateEmail = (_a = candidateDoc.data()) === null || _a === void 0 ? void 0 : _a.email;
        if (!candidateEmail) {
            throw new functions.https.HttpsError('failed-precondition', 'Candidate email not found');
        }
        // Send email
        await transporter.sendMail({
            from: `"Interactive CV" <${functions.config().email.user}>`,
            to: candidateEmail,
            subject: 'New Access Request for Your CV Profile',
            html: `
        <h2>New Access Request</h2>
        <p>You have received a new access request from a recruiter:</p>
        <ul>
          <li><strong>Name:</strong> ${recruiterName}</li>
          <li><strong>Email:</strong> ${recruiterEmail}</li>
          ${recruiterPhone ? `<li><strong>Phone:</strong> ${recruiterPhone}</li>` : ''}
        </ul>
        <h3>Message:</h3>
        <p>${requestDetails}</p>
        <p>
          <a href="${functions.config().app.url}/manage-access">
            Click here to review the request
          </a>
        </p>
      `
        });
        console.log('Access request email sent successfully');
        return { success: true };
    }
    catch (error) {
        console.error('Error sending access request email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send access request email');
    }
});
exports.sendAccessGrantedEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to grant access');
    }
    const { recruiterEmail, candidateName, profileUrl } = data;
    try {
        await transporter.sendMail({
            from: `"Interactive CV" <${functions.config().email.user}>`,
            to: recruiterEmail,
            subject: 'Access Granted to CV Profile',
            html: `
        <h2>Access Granted</h2>
        <p>Your request to view ${candidateName}'s CV profile has been approved.</p>
        <p>
          <a href="${profileUrl}">Click here to view the profile</a>
        </p>
      `
        });
        console.log('Access granted email sent successfully');
        return { success: true };
    }
    catch (error) {
        console.error('Error sending access granted email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send access granted email');
    }
});
//# sourceMappingURL=index.js.map