# Noosify

## 🚀 Lancer l'application

Cette application utilise **Docker Compose** pour orchestrer 3 services :  
- **Frontend** (React, Vite)  
- **Backend API** (FastAPI + Python)  
- **Base de données** (PostgreSQL)  

---

### 1. Installer Docker

Si vous n’avez pas encore Docker installé :  

- **Windows / Mac** : installez [Docker Desktop](https://www.docker.com/products/docker-desktop/).  
- **Linux (Debian/Ubuntu)** :  
  ```
  sudo apt update
  sudo apt install docker.io docker-compose -y
  sudo systemctl enable --now docker
  ```
Vérifiez que tout est bien installé :
```
docker --version
docker-compose --version
```

### 2. Démarrer l’application

Il faut tout d'abord créer un fichier ```.env``` à la racine du projet, et y ajouter:
```
GOOGLE_API_KEY=XXXXXXXXXXXXX
```

Ensuite depuis la racine du projet, lancez :


```
docker-compose up -d --build
```
👉 Cette commande construit les images et démarre automatiquement les 3 conteneurs (frontend, backend, db).

### 3. Accéder à l’application
Une fois lancée, ouvrez dans votre navigateur :

**Frontend** : http://localhost:5173/

### 4. Arrêter l’application
Pour arrêter et supprimer les conteneurs :

```
docker-compose down
```

### 📌 Notes
Les données PostgreSQL sont persistées dans ./data.

Les scripts d’initialisation de la base sont dans ./init-scripts.

Après modification du code frontend ou backend, relancez :

```
docker-compose up -d --build
```