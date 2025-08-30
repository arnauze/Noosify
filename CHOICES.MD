# Explication des choix techniques

## Frontend
- Utilisation de ```React``` + ```Vite``` (package **create-react-router@latest**)
  - Simplicité de mise en place
  - ```Tailwind.css``` built in pour UI
  - ```React-router``` built in pour protected routes
  - ```Vite``` pour gestion server-side vs client-side + envie de découvrir de mon côté
  - Utilisation de ```Typescript``` pour un code plus claire et une meilleure gestion des erreurs

## Backend
- Utilisation de ```Python``` + ```FastApi```
  - ```Python``` car c'est le langage le plus utilisé pour l'IA -> un seul langage pour tout ce qui est Backend
  - ```FastApi``` pour sa vitesse de mise en place

## PostgreSQL (pgvector)
- Utilisation de ```PostgreSQL``` pour sa facilité de mise en place
  - Possibilité de scaling quasi infinie
  - Extensions disponibles pour l'IA (```pgvector``` / ```pgai```) si besoin d'ajouter du embedding afin de faire du RAG

## Gestion des fichiers
- Dans le cadre du test technique je ne store pas les fichiers
- Une fois reçu dans le backend, j'extrais le texte puis utilise un LLM afin d'en faire un résumé que je store dans ma BDD
- Si on voulait garder les fichiers, j'aurai utilisé ```AWS S3``` avec l'utilisation de ```boto3```
  - Je ne l'ai pas fait pour simplifier le premier lancement en local afin d'éviter de devoir fournir trop de variables d'environnement dans le ```.env```