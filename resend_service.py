import os
from dotenv import load_dotenv
import resend

# Load environment variables from .env file
# The .env file is added to .gitignore to keep keys secured
load_dotenv()

# Set up Resend API key
resend_api_key = os.getenv("RESEND_API_KEY")

if not resend_api_key:
    raise ValueError("RESEND_API_KEY not found in environment variables")

resend.api_key = resend_api_key

def send_email(to, subject, html, from_email="Brickshare <onboarding@resend.dev>"):
    """
    Sends an email using the Resend platform.
    """
    params = {
        "from": from_email,
        "to": to,
        "subject": subject,
        "html": html,
    }
    
    try:
        email = resend.Emails.send(params)
        return email
    except Exception as e:
        print(f"Error sending email: {e}")
        return None

if __name__ == "__main__":
    # Example usage
    test_email = send_email(
        to="hola@brickshare.es",
        subject="Resend Python Service Ready",
        html="<strong>El servicio de Resend para Python ha sido configurado correctamente.</strong>"
    )
    if test_email:
        print("Test email sent successfully!")
