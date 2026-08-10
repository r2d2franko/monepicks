FROM node:18-alpine

WORKDIR /app

# Copiar el package.json desde la carpeta webapp
COPY webapp/package*.json ./

RUN npm install

# Copiar todo el contenido de webapp a /app dentro del contenedor
COPY webapp/ .

EXPOSE 3000

CMD ["npm", "start"]
