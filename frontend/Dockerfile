# =====================
# AŞAMA 1: Build
# =====================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# docker-compose'dan gelen ARG'ı yakala
ARG VITE_API_URL
# Vite build sırasında process.env üzerinden okuyabilmesi için ENV'e aktar
ENV VITE_API_URL=$VITE_API_URL

# Production build (tsc + vite build) — VITE_API_URL artık bundle'a gömülür
RUN npm run build

# =====================
# AŞAMA 2: Serve
# =====================
FROM nginx:alpine

# Nginx SPA config (React Router için)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]