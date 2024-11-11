import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.me.com',
  port: 587,
  secure: false,
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Verify email configuration
transporter.verify((error) => {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('SMTP server is ready');
  }
});

// Handle new recruiter signups
export const onRecruiterSignup = functions.auth.user().onCreate(async (user) => {
  const { customClaims } = await admin.auth().getUser(user.uid);
  
  // Only process recruiter signups
  if (!customClaims?.userType || customClaims.userType !== 'recruiter') {
    return;
  }

  const { candidateEmail } = customClaims;
  if (!candidateEmail) {
    console.error('No candidate email provided for recruiter signup');
    return;
  }

  try {
    // Create approval request
    const approvalRef = admin.firestore().collection('recruiterApprovals').doc();
    await approvalRef.set({
      recruiterId: user.uid,
      recruiterEmail: user.email,
      candidateEmail,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send approval request email
    await transporter.sendMail({
      from: `"Interactive CV" <${functions.config().email.user}>`,
      to: candidateEmail,
      subject: 'New Recruiter Access Request',
      html: `
        <h2>New Recruiter Access Request</h2>
        <p>A recruiter has requested access to view CV profiles:</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
        </ul>
        <p>
          <a href="${functions.config().app.url}/approve-recruiter/${approvalRef.id}">
            Click here to approve or deny this request
          </a>
        </p>
      `
    });

    console.log('Recruiter approval request sent successfully');
  } catch (error) {
    console.error('Error processing recruiter signup:', error);
  }
});

// Handle recruiter approval
export const approveRecruiter = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to approve recruiters'
    );
  }

  const { approvalId, approved } = data;

  try {
    const approvalRef = admin.firestore().collection('recruiterApprovals').doc(approvalId);
    const approval = await approvalRef.get();

    if (!approval.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Approval request not found'
      );
    }

    const approvalData = approval.data();
    if (approvalData?.candidateEmail !== context.auth.token.email) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only the candidate can approve this request'
      );
    }

    if (approved) {
      // Update recruiter's claims
      await admin.auth().setCustomUserClaims(approvalData.recruiterId, {
        userType: 'recruiter',
        approved: true
      });

      // Send approval notification
      await transporter.sendMail({
        from: `"Interactive CV" <${functions.config().email.user}>`,
        to: approvalData.recruiterEmail,
        subject: 'Recruiter Access Approved',
        html: `
          <h2>Access Approved</h2>
          <p>Your request for recruiter access has been approved.</p>
          <p>
            <a href="${functions.config().app.url}/login">
              Click here to log in
            </a>
          </p>
        `
      });
    }

    // Update approval status
    await approvalRef.update({
      status: approved ? 'approved' : 'denied',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing recruiter approval:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to process approval'
    );
  }
});