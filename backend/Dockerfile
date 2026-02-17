FROM node:20-alpine

WORKDIR /app

# Önce sadece package dosyaları (cache katmanı - bağımlılıklar değişmediğinde yeniden install yapmaz)
COPY package*.json ./

# Production dependency'leri kur (devDependencies hariç)
RUN npm install --omit=dev

# Kaynak kodları kopyala
COPY . .

EXPOSE 3000

CMD ["npm", "start"]