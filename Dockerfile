FROM --platform=$BUILDPLATFORM hub.aiursoft.com/node:24-alpine AS npm-env

WORKDIR /app
COPY . .

RUN npm install --loglevel verbose
RUN npm run build

# ============================
# Prepare Runtime Environment
FROM hub.aiursoft.com/aiursoft/static
COPY --from=npm-env /app/dist /data

EXPOSE 5000
