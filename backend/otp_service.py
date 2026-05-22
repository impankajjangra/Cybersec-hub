import random
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path


def _load_env():
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ[key] = value


_load_env()


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


async def send_email_otp(to_email: str, otp: str, purpose: str = "verification") -> bool:

    smtp_email = os.environ.get("SMTP_EMAIL", "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "").strip()

    if not smtp_email or not smtp_password:
        print(f"[OTP FALLBACK] SMTP not set — OTP for {to_email}: {otp}")
        return True

    subject = "CyberSec Hub – Your Verification OTP"
    heading = "Email Verification"
    subtext = "Use the OTP below to verify your email address."

    if purpose == "reset":
        subject = "CyberSec Hub – Password Reset OTP"
        heading = "Password Reset"
        subtext = "Use the OTP below to reset your password."

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"CyberSec Hub <{smtp_email}>"
        msg["To"] = to_email

        html_body = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#111111;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#0a0a0a;border:1px solid #222;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:2px solid #ef4444;">
              <span style="font-size:22px;font-weight:bold;letter-spacing:3px;color:#ef4444;">CYBER</span>
              <span style="font-size:22px;font-weight:bold;letter-spacing:3px;color:#ffffff;">SEC HUB</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#aaaaaa;font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:2px;">{heading}</p>
              <p style="color:#ffffff;font-size:16px;margin:0 0 28px;">{subtext}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#111;border:1px solid #333;border-radius:6px;padding:24px 0;">
                    <span style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#ef4444;font-family:'Courier New',monospace;">
                      {otp}
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color:#555555;font-size:12px;margin:20px 0 0;text-align:center;">
                This OTP expires in <strong style="color:#888;">10 minutes</strong>.
                Do not share it with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#080808;padding:16px 40px;border-top:1px solid #1a1a1a;">
              <p style="color:#444444;font-size:11px;margin:0;text-align:center;">
                &copy; 2025 CyberSec Hub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        """

        msg.attach(MIMEText(html_body, "html"))

        # FIX: Use port 587 with STARTTLS — Railway blocks port 465 (SSL)
        print(f"[OTP] Connecting to smtp.gmail.com:587 ...")
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())

        print(f"[OTP] Email sent to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"[OTP ERROR] Auth failed: {e}")
        print(f"[OTP FALLBACK] OTP for {to_email}: {otp}")
        return True

    except Exception as e:
        print(f"[OTP ERROR] {type(e).__name__}: {e}")
        print(f"[OTP FALLBACK] OTP for {to_email}: {otp}")
        return True
