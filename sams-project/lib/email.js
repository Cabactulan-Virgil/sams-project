export async function sendAdminNewUserEmail(newUser) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

    const subject = 'New User Registered';
    const roleLabel = newUser?.role === 'teacher' ? 'Teacher' : newUser?.role === 'student' ? 'Student' : 'User';
    const bodyLines = [
      `A new ${roleLabel} has registered.`,
      newUser?.name ? `Name: ${newUser.name}` : null,
      newUser?.email ? `Email: ${newUser.email}` : null,
    ].filter(Boolean);
    const body = bodyLines.join('\n');

    if (!adminEmail) {
      console.log('[sendAdminNewUserEmail] Admin email is not configured. Set ADMIN_NOTIFICATION_EMAIL or ADMIN_EMAIL.');
      console.log('[sendAdminNewUserEmail] Would send email:', { subject, body });
      return;
    }

    console.log('[sendAdminNewUserEmail] Sending email to admin:', {
      to: adminEmail,
      subject,
      body,
    });

    // Integrate your real email service here (e.g. nodemailer, SendGrid, etc.).
  } catch (error) {
    console.error('[sendAdminNewUserEmail] Failed to prepare admin email', error);
  }
}
