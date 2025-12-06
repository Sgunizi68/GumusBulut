
import base64
import os.path
from email.message import EmailMessage

# Google API istemcisinin dosya tabanlı önbelleğini devre dışı bırak
# Bu, Render gibi salt okunur dosya sistemlerinde çökmesini önler.
from googleapiclient import discovery_cache
if hasattr(discovery_cache, 'disable_cache'):
    discovery_cache.disable_cache()

from fastapi import APIRouter, HTTPException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from schemas.email import EmailSchema

router = APIRouter()

# Gerekli API scope'u
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
# Token ve secret dosyalarının yolu (backend klasöründen bir üst dizin)
TOKEN_PATH = '../token.json'

@router.post("/send-email", tags=["Email"])
async def send_email_endpoint(email_data: EmailSchema):
    """
    API endpoint to send an email.
    """
    print("[EMAIL_DEBUG] Adım 1: '/send-email' endpoint'ine istek geldi.")
    
    # Kimlik bilgilerini ortam değişkenlerinden al
    client_id = os.environ.get('GMAIL_CLIENT_ID')
    client_secret = os.environ.get('GMAIL_CLIENT_SECRET')
    refresh_token = os.environ.get('GMAIL_REFRESH_TOKEN')
    print(f"[EMAIL_DEBUG] Adım 2: Ortam değişkenleri okundu. GMAIL_CLIENT_ID var mı: {bool(client_id)}, GMAIL_CLIENT_SECRET var mı: {bool(client_secret)}, GMAIL_REFRESH_TOKEN var mı: {bool(refresh_token)}")

    # Ortam değişkenleri eksikse hata fırlat
    if not (client_id and client_secret and refresh_token):
        print("[EMAIL_DEBUG] HATA: Gerekli ortam değişkenlerinden biri veya daha fazlası eksik.")
        raise HTTPException(
            status_code=500,
            detail="Sunucu tarafında GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET veya GMAIL_REFRESH_TOKEN ortam değişkenleri ayarlanmamış."
        )

    print("[EMAIL_DEBUG] Adım 3: Credentials nesnesi oluşturuluyor.")
    # Credentials nesnesini oluştur
    creds = Credentials(
        token=None,  # Access token, refresh token ile alınacak
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES
    )

    print(f"[EMAIL_DEBUG] Adım 4: Kimlik bilgileri kontrol ediliyor. Geçerli mi: {creds.valid}, Refresh Token var mı: {bool(creds.refresh_token)}")
    # Kimlik bilgilerini kontrol et ve gerekirse yenile
    if not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                print("[EMAIL_DEBUG] Adım 5: Kimlik bilgileri geçerli değil, yenileme denemesi yapılıyor.")
                creds.refresh(Request())
                print("[EMAIL_DEBUG] Adım 6: Yenileme başarılı.")
            except Exception as e:
                print(f"[EMAIL_DEBUG] HATA - Adım 7: Token yenileme başarısız oldu: {e}")
                raise HTTPException(
                    status_code=401,
                    detail=f"Google API kimlik bilgileri yenilenemedi: {e}"
                )
        else:
            print("[EMAIL_DEBUG] HATA - Adım 9: Kimlik bilgileri geçersiz ve yenilenemiyor.")
            # Bu senaryo, refresh_token olmaması durumunda pek olası değil ama bir güvenlik önlemi
            raise HTTPException(
                status_code=401,
                detail="Google API kimlik bilgileri geçersiz ve yenilenemiyor."
            )

    try:
        print("[EMAIL_DEBUG] Adım 10: Gmail API servisi oluşturuluyor.")
        service = build('gmail', 'v1', credentials=creds)

        print("[EMAIL_DEBUG] Adım 11: E-posta mesajı oluşturuluyor ve gönderiliyor.")
        message = EmailMessage()
        message.set_content(email_data.body)
        message['To'] = email_data.to
        message['Subject'] = email_data.subject

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'raw': encoded_message}

        send_message = service.users().messages().send(userId="me", body=create_message).execute()
        print(f"[EMAIL_DEBUG] BAŞARILI - Adım 12: Mesaj gönderildi. Message ID: {send_message['id']}")
        return {"message": "E-posta başarıyla gönderildi.", "message_id": send_message['id']}

    except HttpError as error:
        print(f"[EMAIL_DEBUG] HATA - Adım 13: Mesaj gönderimi sırasında HttpError oluştu: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Gmail API'ye gönderilirken bir hata oluştu: {error}"
        )
    except Exception as e:
        print(f"[EMAIL_DEBUG] HATA - Adım 14: Beklenmedik bir hata oluştu: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Beklenmedik bir hata oluştu: {e}"
        )
