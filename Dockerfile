FROM hub.aiursoft.cn/node:21-alpine AS npm-env

WORKDIR /app
COPY . .

RUN npm install --loglevel verbose
RUN npm run build

# ============================
# Prepare Runtime Environment
FROM hub.aiursoft.cn/aiursoft/static
COPY --from=npm-env /app/dist /data

EXPOSE 5000
