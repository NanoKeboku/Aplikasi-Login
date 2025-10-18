import nodemailer from 'nodemailer';

export type MailParams = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendMail(params: MailParams) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || 'no-reply@kumpul.in';

  if (!host || !user || !pass) {
    console.log('[mailer] SMTP not configured, skipping send:', params.subject);
    return { skipped: true } as const;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, ...params });
  return { skipped: false } as const;
}
