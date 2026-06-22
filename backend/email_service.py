import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _send(to: str, subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"HireAI <{EMAIL_FROM}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_FROM, to, msg.as_string())


def _base_template(content: str, preheader: str = "") -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>HireAI</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  {f'<div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>' if preheader else ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:16px 16px 0 0;padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-flex;align-items:center;gap:10px;">
                    <span style="background:rgba(255,255,255,0.2);border-radius:8px;padding:6px 10px;font-size:14px;font-weight:800;color:#fff;letter-spacing:0.5px;">AI</span>
                    <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">HireAI</span>
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
            {content}
            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:24px;">
              <tr>
                <td align="center">
                  <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">This email was sent by HireAI Recruitment Platform</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;">If you did not expect this, please ignore it.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ── Forgot Password ────────────────────────────────────────────────────────
def send_password_reset_email(to: str, name: str, reset_token: str):
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    content = f"""
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Reset your password</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">Hi {name}, we received a request to reset the password for your HireAI account.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <a href="{reset_link}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Or copy this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:12px;color:#6366f1;word-break:break-all;">{reset_link}</p>
    <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#92400e;">⏱ This link expires in <strong>30 minutes</strong>. If you did not request a reset, you can safely ignore this email.</p>
    </div>
    """
    _send(to, "Reset your HireAI password", _base_template(content, "Reset your HireAI password — link expires in 30 minutes"))


# ── Selection / Offer ─────────────────────────────────────────────────────
def send_selection_email(to: str, name: str, job_title: str, company: str):
    content = f"""
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#ecfdf5;border-radius:50%;padding:16px;margin-bottom:12px;">
        <span style="font-size:36px;">🎉</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;">Congratulations, {name}!</h2>
      <p style="margin:0;font-size:16px;color:#10b981;font-weight:600;">You've been selected!</p>
    </div>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">
      We are thrilled to inform you that after a thorough review of your application, you have been <strong style="color:#0f172a;">selected</strong> for the position of
      <strong style="color:#6366f1;">{job_title}</strong> at <strong style="color:#0f172a;">{company}</strong>.
    </p>
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;"><span style="font-size:13px;color:#166534;font-weight:600;">📌 Position</span></td>
          <td style="padding:6px 0;text-align:right;"><span style="font-size:13px;color:#0f172a;font-weight:700;">{job_title}</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><span style="font-size:13px;color:#166534;font-weight:600;">🏢 Company</span></td>
          <td style="padding:6px 0;text-align:right;"><span style="font-size:13px;color:#0f172a;font-weight:700;">{company}</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><span style="font-size:13px;color:#166534;font-weight:600;">✅ Status</span></td>
          <td style="padding:6px 0;text-align:right;"><span style="font-size:13px;color:#10b981;font-weight:700;">Selected / Offer Stage</span></td>
        </tr>
      </table>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
      Our HR team will reach out to you shortly with the next steps, including offer details and onboarding information. Please keep an eye on your inbox.
    </p>
    <p style="margin:0;font-size:14px;color:#64748b;">Best wishes,<br/><strong style="color:#0f172a;">The {company} Hiring Team</strong></p>
    """
    _send(to, f"🎉 You've been selected — {job_title} at {company}", _base_template(content, f"Great news! You've been selected for {job_title} at {company}"))


# ── Rejection ─────────────────────────────────────────────────────────────
def send_rejection_email(to: str, name: str, job_title: str, company: str):
    content = f"""
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Application Update</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">Hi {name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">
      Thank you for your interest in the <strong style="color:#0f172a;">{job_title}</strong> position at <strong style="color:#0f172a;">{company}</strong> and for the time you invested in your application.
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">
      After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current requirements. This was a very competitive process and we truly appreciate your interest.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#991b1b;">A few encouraging words</p>
      <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
        This decision does not reflect on your skills or potential. We encourage you to continue applying and exploring other opportunities that match your strengths.
      </p>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
      We will keep your profile on file and may reach out if a more suitable role becomes available in the future.
    </p>
    <p style="margin:0;font-size:14px;color:#64748b;">Warm regards,<br/><strong style="color:#0f172a;">The {company} Hiring Team</strong></p>
    """
    _send(to, f"Your application for {job_title} at {company}", _base_template(content, f"An update on your application for {job_title} at {company}"))


# ── Interview Schedule ─────────────────────────────────────────────────────
def send_interview_schedule_email(
    to: str,
    name: str,
    job_title: str,
    company: str,
    scheduled_at,  # datetime object
    location: str,
    meet_link: str | None,
    notes: str | None,
):
    from datetime import datetime, timezone

    if isinstance(scheduled_at, str):
        scheduled_at = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))

    date_str = scheduled_at.strftime("%A, %B %d, %Y")
    time_str = scheduled_at.strftime("%I:%M %p")
    # try to show timezone if available
    tz_str = scheduled_at.strftime("%Z") if scheduled_at.tzinfo else "UTC"

    meet_row = ""
    if meet_link:
        meet_row = f"""
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:13px;color:#475569;font-weight:600;">🔗 Meet Link</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
            <a href="{meet_link}" style="font-size:13px;color:#6366f1;font-weight:700;text-decoration:none;">{meet_link}</a>
          </td>
        </tr>
        """

    notes_block = ""
    if notes:
        notes_block = f"""
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Notes from Recruiter</p>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">{notes}</p>
        </div>
        """

    join_button = ""
    if meet_link:
        join_button = f"""
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td align="center">
              <a href="{meet_link}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;">
                Join Interview →
              </a>
            </td>
          </tr>
        </table>
        """

    content = f"""
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#eef2ff;border-radius:50%;padding:16px;margin-bottom:12px;">
        <span style="font-size:36px;">📅</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;">Interview Scheduled!</h2>
      <p style="margin:0;font-size:15px;color:#6366f1;font-weight:600;">You have an upcoming interview</p>
    </div>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">
      Hi {name}, your interview for the <strong style="color:#0f172a;">{job_title}</strong> position at <strong style="color:#0f172a;">{company}</strong> has been scheduled. Here are the details:
    </p>
    <div style="background:linear-gradient(135deg,#f0f4ff,#eef2ff);border:1px solid #c7d2fe;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:13px;color:#475569;font-weight:600;">📌 Position</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
            <span style="font-size:13px;color:#0f172a;font-weight:700;">{job_title}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:13px;color:#475569;font-weight:600;">🏢 Company</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
            <span style="font-size:13px;color:#0f172a;font-weight:700;">{company}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:13px;color:#475569;font-weight:600;">📅 Date</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
            <span style="font-size:13px;color:#0f172a;font-weight:700;">{date_str}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:13px;color:#475569;font-weight:600;">⏰ Time</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
            <span style="font-size:13px;color:#0f172a;font-weight:700;">{time_str} {tz_str}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;{'border-bottom:1px solid #e2e8f0;' if meet_link else ''}">
            <span style="font-size:13px;color:#475569;font-weight:600;">📍 Location</span>
          </td>
          <td style="padding:8px 0;{'border-bottom:1px solid #e2e8f0;' if meet_link else ''}text-align:right;">
            <span style="font-size:13px;color:#0f172a;font-weight:700;">{location}</span>
          </td>
        </tr>
        {meet_row}
      </table>
    </div>
    {notes_block}
    {join_button}
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        💡 <strong>Tip:</strong> Make sure to test your audio/video setup before the interview. Prepare your questions and join the call 2–3 minutes early.
      </p>
    </div>
    <p style="margin:0;font-size:14px;color:#64748b;">Good luck!<br/><strong style="color:#0f172a;">The {company} Hiring Team via HireAI</strong></p>
    """
    _send(
        to,
        f"📅 Interview Scheduled — {job_title} at {company}",
        _base_template(content, f"Your interview for {job_title} at {company} is on {date_str} at {time_str}"),
    )
