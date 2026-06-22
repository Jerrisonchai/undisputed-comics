"""
MANDATE
  WHO: OpenClaw cron — Phase 6 Email Notifications
  WHEN: Every 5 minutes (cron)
  PURPOSE: Reads notification_logs (Supabase) where status='pending', sends via Gmail SMTP, marks as sent
  WHAT: Email notification sender for UndisputedComics
  IMPROVEMENT: Multi-recipient batch, rate limiting, failure logging
  HISTORY: Created 2026-06-22 for UndisputedComics Phase 6
"""

import os, sys, json, smtplib, time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from pathlib import Path

# ── Supabase client ──────────────────────────────────
try:
    from supabase import create_client, Client
except ImportError:
    print("[NOTIF] supabase-py not installed. Run: pip install supabase")
    sys.exit(1)

# ── Config ───────────────────────────────────────────
SUPABASE_URL = "https://fdusyudelkhoomakdfel.supabase.co"
SUPABASE_KEY = "sb_publishable_hMpj6OKgcZno6jUBEm4xSg_lRDVe9Vf"  # public anon key (read-only for logs + subscribers)

# Gmail SMTP
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "jerrcoc1@gmail.com"
SMTP_PASS = os.environ.get("GMAIL_APP_PASSWORD", "")

# Sender info
FROM_EMAIL = "jerrcoc1@gmail.com"
FROM_NAME = "金牌漫画 UndisputedComics"

# Limits
MAX_PER_RUN = 20       # Don't send too many in one 5-min window
BATCH_DELAY = 2.0      # Seconds between emails (Gmail rate limit)
DRY_RUN = False        # Set True to test without sending

# ── Email template ───────────────────────────────────
def build_email(subject, body_html, recipient_email):
    """Wrap plain/html content in brand template"""
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = recipient_email
    msg["Subject"] = subject

    # Plain text fallback
    plain = body_html.replace("<br>", "\n").replace("</p>", "\n")
    import re
    plain = re.sub(r"<[^>]+>", "", plain)

    html = f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF6B6B,#A78BFA);padding:32px 24px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#ffffff;margin-bottom:4px;">🏆 金牌漫画</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.85);">品质漫画，金牌之选</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;font-size:16px;line-height:1.8;color:#2D3748;">
              {body_html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:20px 24px;text-align:center;font-size:12px;color:#718096;">
              📬 金牌漫画 UndisputedComics<br>
              如有任何问题，请通过 WhatsApp 联系我们。<br>
              <br>
              <span style="color:#CBD5E0;">此邮件由系统自动发送。</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))
    return msg


def send_via_smtp(msg):
    """Send email via Gmail SMTP"""
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[NOTIF] SMTP error: {e}")
        return False


def main():
    if not SMTP_PASS:
        print("[NOTIF] ⚠️ GMAIL_APP_PASSWORD not set. Set env var or hardcode for testing.")
        print("[NOTIF] No emails sent. Exiting.")
        return

    print(f"[NOTIF] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} — Starting notification sender")

    # Connect to Supabase
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[NOTIF] Supabase connection failed: {e}")
        return

    # Fetch pending notifications (oldest first)
    try:
        resp = supabase.table("notification_logs") \
            .select("*") \
            .eq("status", "pending") \
            .order("created_at") \
            .limit(MAX_PER_RUN) \
            .execute()
        pending = resp.data or []
    except Exception as e:
        print(f"[NOTIF] Error fetching pending notifications: {e}")
        return

    if not pending:
        print("[NOTIF] No pending notifications. Done.")
        return

    print(f"[NOTIF] Found {len(pending)} pending notification(s).")

    sent = 0
    failed = 0

    for entry in pending:
        log_id = entry["id"]
        recipient = entry["recipient_email"]
        subject = entry.get("subject", "金牌漫画通知")
        body = entry.get("body_html", "")

        print(f"[NOTIF]   → {recipient} | {subject[:40]}...")

        if DRY_RUN:
            print(f"[NOTIF]   (DRY RUN — not actually sent)")
            sent += 1
            continue

        msg = build_email(subject, body, recipient)
        success = send_via_smtp(msg)

        if success:
            # Mark as sent
            try:
                supabase.table("notification_logs") \
                    .update({"status": "sent", "sent_at": datetime.now(timezone.utc).isoformat()}) \
                    .eq("id", log_id) \
                    .execute()
            except Exception as e:
                print(f"[NOTIF]   ⚠️ Failed to update sent status: {e}")
            sent += 1
            print(f"[NOTIF]   ✅ Sent")
        else:
            # Mark as failed
            try:
                supabase.table("notification_logs") \
                    .update({"status": "failed", "error_message": "SMTP send failed"}) \
                    .eq("id", log_id) \
                    .execute()
            except:
                pass
            failed += 1
            print(f"[NOTIF]   ❌ Failed")

        # Rate limit
        if len(pending) > 1:
            time.sleep(BATCH_DELAY)

    print(f"[NOTIF] Done. Sent: {sent}, Failed: {failed}")


if __name__ == "__main__":
    main()
