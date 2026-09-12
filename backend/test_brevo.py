import asyncio
import sys
import os

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.notifications import send_brevo_transactional_email

async def main():
    recipient = sys.argv[1] if len(sys.argv) > 1 else settings.BREVO_SENDER_EMAIL
    if not recipient or "@" not in recipient or "your_verified_email" in recipient:
        print("❌ Please provide a valid recipient email address.")
        print("Usage: .\\venv\\Scripts\\python.exe test_brevo.py your_email@domain.com")
        return

    print("=====================================================")
    print(" 🏛️ MahaSetu — Brevo Email Live Dispatch Verification")
    print("=====================================================")
    print(f"📡 Brevo API Key: {settings.BREVO_API_KEY[:8]}... (Configured)" if settings.BREVO_API_KEY else "❌ BREVO_API_KEY is not configured in .env")
    print(f"📤 Sender Email: {settings.BREVO_SENDER_EMAIL}")
    print(f"📤 Sender Name:  {settings.BREVO_SENDER_NAME}")
    print(f"📥 Recipient:    {recipient}")
    print("-----------------------------------------------------")

    success = await send_brevo_transactional_email(
        to_email=recipient,
        to_name="MahaSetu Evaluator / Citizen",
        subject="Statutory Verification Seal — MahaSetu Test",
        body_text="Your MahaSetu Brevo transactional email integration is functioning with 100% live delivery. All application status transitions and inter-departmental consent events are now cryptographically tracked and notified to citizens."
    )

    if success:
        print("\n✅ SUCCESS: Brevo email dispatched successfully! Please check your inbox / spam folder.")
    else:
        print("\n❌ FAILED: Brevo API call did not succeed. Check your API key and verified sender in .env.")

if __name__ == "__main__":
    asyncio.run(main())
