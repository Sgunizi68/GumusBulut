echo "Eski versiyonu Temizle"
cd C:\Users\Gokova\OneDrive - CELEBI HAVACILIK HOLDING A.S\Personel\Programming\Python
del .idea /Q /F
cd CopyCat
del dist /Q /F
del node_modules /Q /F
echo "Şimdi kodu oluştur"
npm install
echo "Kodu Deploy Et"
npm run deploy -- --no-history