# =====================
# AŞAMA 1: Build
# =====================
FROM node:20-alpine AS builder

WORKDIR /app

# Önce sadece package dosyalarını kopyala (cache optimizasyonu)
COPY package*.json ./

RUN npm install

# Kaynak kodları kopyala
COPY . .

# Production build al (tsc + vite build)
RUN npm run build

# =====================
# AŞAMA 2: Serve
# =====================
FROM nginx:alpine

# Nginx için custom config (React Router için gerekli)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]