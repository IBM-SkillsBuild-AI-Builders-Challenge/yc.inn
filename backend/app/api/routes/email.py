from __future__ import annotations

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter
from loguru import logger
from pydantic import BaseModel

router = APIRouter(prefix="/email", tags=["email"])


class EmailRequest(BaseModel):
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    use_tls: bool = True
    to: str
    subject: str = ""
    body: str = ""


class EmailResponse(BaseModel):
    success: bool
    message: str


def _compose_msg(smtp_user: str, to: str, subject: str, body: str) -> str:
    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))
    return msg.as_string()


@router.post("/send", response_model=EmailResponse)
def send_email(payload: EmailRequest) -> EmailResponse:
    logger.info(f"Email send requested to {payload.to}")

    if not payload.to:
        return EmailResponse(success=False, message="Recipient address is required.")

    if not payload.smtp_user or not payload.smtp_pass:
        logger.warning("SMTP credentials not provided — logging email instead")
        logger.info(f"  To: {payload.to}")
        logger.info(f"  Subject: {payload.subject}")
        logger.info(f"  Body: {payload.body[:200]}")
        return EmailResponse(success=True, message="Email logged (no SMTP credentials configured).")

    server = None
    try:
        msg_str = _compose_msg(payload.smtp_user, payload.to, payload.subject, payload.body)
        context = ssl.create_default_context()

        server = smtplib.SMTP(payload.smtp_host, payload.smtp_port, timeout=15)
        server.ehlo()
        if payload.use_tls:
            server.starttls(context=context)
            server.ehlo()
        server.login(payload.smtp_user, payload.smtp_pass)
        server.sendmail(payload.smtp_user, payload.to, msg_str)

        logger.info(f"Email sent successfully to {payload.to}")
        return EmailResponse(success=True, message=f"Email sent to {payload.to}.")

    except smtplib.SMTPAuthenticationError:
        return EmailResponse(success=False, message="SMTP authentication failed. Check username/password.")
    except smtplib.SMTPResponseException as e:
        logger.warning(f"SMTP response code {e.smtp_code}: {e.smtp_error}")
        if 200 <= e.smtp_code < 300:
            return EmailResponse(success=True, message=f"Email sent (SMTP {e.smtp_code}).")
        if e.smtp_code == 553:
            hint = "Gmail requires the FROM address to match your authenticated account. If using 2FA, create an App Password at https://myaccount.google.com/apppasswords"
            return EmailResponse(success=False, message=f"{e.smtp_error.decode() if isinstance(e.smtp_error, bytes) else e.smtp_error}. {hint}")
        return EmailResponse(success=False, message=f"SMTP error ({e.smtp_code}): {e.smtp_error}")
    except smtplib.SMTPException as e:
        return EmailResponse(success=False, message=f"SMTP error: {e}")
    except TimeoutError:
        return EmailResponse(success=False, message="SMTP connection timed out. Check host/port.")
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return EmailResponse(success=False, message=str(e))
    finally:
        if server is not None:
            try:
                server.quit()
            except Exception:
                pass
