
import os
from google_auth_oauthlib.flow import InstalledAppFlow

# API scope'unu belirliyoruz. Gmail için e-posta gönderme yetkisi.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
CLIENT_SECRETS_FILE = 'client_secret_320897509859-lqfm55ttin4f0se3831hcqd3g9j16sak.apps.googleusercontent.com.json'

def main():
    """
    Kullanıcıyı OAuth2 akışı üzerinden yönlendirerek bir token.json dosyası oluşturur.
    """
    # secrets dosyasından ve scope'dan bir akış (flow) oluştur
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
    
    # run_local_server, tarayıcıda bir yetkilendirme URL'si açar ve kullanıcıdan
    # izin ister. İzin verildikten sonra, kimlik bilgilerini (credentials) alır.
    print("Kimlik doğrulama için tarayıcınız açılacak...")
    print("Lütfen açılan ekranda Google hesabınızla giriş yapın ve istenen izinleri onaylayın.")
    print("İşlem tamamlandığında bu pencereye geri dönebilirsiniz.")
    creds = flow.run_local_server(port=8080)
    
    # Alınan kimlik bilgilerini token.json dosyasına kaydet
    with open('token.json', 'w') as token:
        token.write(creds.to_json())
    
    print("\n'token.json' dosyası başarıyla oluşturuldu!")
    print("Artık e-posta göndermeye hazırım.")

if __name__ == '__main__':
    main()
