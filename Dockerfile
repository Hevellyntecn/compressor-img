# Dockerfile para o servidor
FROM node:18-alpine

# Instala dependências do sistema necessárias para Sharp
RUN apk add --no-cache \
    vips-dev \
    libc6-compat

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY server/package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia código fonte
COPY server/ .

# Cria diretórios necessários
RUN mkdir -p uploads compressed

# Expõe porta
EXPOSE 5000

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
