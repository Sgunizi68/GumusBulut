import base64
import os
from email.message import EmailMessage

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Gerekli API scope'u
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def gmail_send_message(to_email, subject, body):
    """
    Gmail API kullanarak bir e-posta oluşturur ve gönderir.
    Kimlik bilgilerini ortam değişkenlerinden (environment variables) okur.
    """
    print("[EMAIL_DEBUG] Adım 1: 'gmail_send_message' fonksiyonuna girildi.")
    creds = None
    
    # Kimlik bilgilerini ortam değişkenlerinden al
    client_id = os.environ.get('GMAIL_CLIENT_ID')
    client_secret = os.environ.get('GMAIL_CLIENT_SECRET')
    refresh_token = os.environ.get('GMAIL_REFRESH_TOKEN')
    print(f"[EMAIL_DEBUG] Adım 2: Ortam değişkenleri okundu. client_id var mı: {bool(client_id)}, client_secret var mı: {bool(client_secret)}, refresh_token var mı: {bool(refresh_token)}")

    if not (client_id and client_secret and refresh_token):
        print("[EMAIL_DEBUG] HATA: Gerekli ortam değişkenlerinden biri veya daha fazlası eksik. Fonksiyondan çıkılıyor.")
        return

    print("[EMAIL_DEBUG] Adım 3: Credentials nesnesi oluşturuluyor.")
    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES
    )

    print(f"[EMAIL_DEBUG] Adım 4: Kimlik bilgileri kontrol ediliyor. Geçerli mi: {creds.valid}, Refresh Token var mı: {bool(creds.refresh_token)}")
    if creds and not creds.valid and creds.refresh_token:
        try:
            print("[EMAIL_DEBUG] Adım 5: Kimlik bilgileri geçerli değil, yenileme denemesi yapılıyor.")
            creds.refresh(Request())
            print("[EMAIL_DEBUG] Adım 6: Yenileme başarılı.")
        except Exception as e:
            print(f"[EMAIL_DEBUG] HATA - Adım 7: Token yenileme başarısız oldu: {e}")
            return

    print(f"[EMAIL_DEBUG] Adım 8: Yenileme sonrası kimlik bilgileri kontrol ediliyor. Geçerli mi: {creds.valid}")
    if not creds or not creds.valid:
        print("[EMAIL_DEBUG] HATA - Adım 9: Kimlik bilgileri hala geçerli değil. Fonksiyondan çıkılıyor.")
        return

    try:
        print("[EMAIL_DEBUG] Adım 10: Gmail API servisi oluşturuluyor.")
        service = build('gmail', 'v1', credentials=creds)

        print("[EMAIL_DEBUG] Adım 11: E-posta mesajı oluşturuluyor ve gönderiliyor.")
        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['Subject'] = subject

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'raw': encoded_message}
        
        send_message = (
            service.users().messages().send(userId="me", body=create_message).execute()
        )
        print(f"[EMAIL_DEBUG] BAŞARILI - Adım 12: Mesaj gönderildi. Message ID: {send_message['id']}")

    except HttpError as error:
        print(f"[EMAIL_DEBUG] HATA - Adım 13: Mesaj gönderimi sırasında HttpError oluştu: {error}")
        send_message = None
    
    return send_message

if __name__ == "__main__":
    from dotenv import load_dotenv
    dotenv_path = os.path.join(os.path.dirname(__file__), os.pardir, '.env.local')
    print(f"Loading .env file from: {dotenv_path}")
    load_dotenv(dotenv_path=dotenv_path)

    print("Test e-postası gönderiliyor...")
    gmail_send_message(
        to_email="ornek_alici@example.com",
        subject="Lokal Test E-postası",
        body="Bu, .env.local kullanılarak gönderilen bir test mesajıdır."
    )