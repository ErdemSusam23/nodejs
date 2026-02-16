FROM node:20-alpine

WORKDIR /app

# Package files kopyala
COPY package*.json ./

# Dependencies kur
RUN npm install

# Kaynak kodları kopyala
COPY . .

# Port
EXPOSE 5173

# Development server başlat
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]