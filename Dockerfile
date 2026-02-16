# Étape 1 : Build Angular
FROM node:18 AS build
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copier tout le reste et build Angular
COPY . .
RUN npm run build -- --configuration=production

# Étape 2 : Serve avec Nginx
FROM nginx:alpine

# Supprimer la page par défaut Nginx pour éviter les conflits
RUN rm -rf /usr/share/nginx/html/*

# Copier le build Angular dans Nginx
COPY --from=build /app/dist/frontend.seg/browser/ /usr/share/nginx/html/

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]