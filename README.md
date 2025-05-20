# Projet RabbitMQ – Système de calcul distribué

## Objectif du projet

Ce projet vise à démontrer la mise en place d’un système de traitement distribué à l’aide de RabbitMQ.  
L’idée est de simuler un client qui soumet des opérations mathématiques (`add`, `sub`, `mul`, `div`, `all`) à un système qui les répartit vers des workers spécialisés.

Le tout repose sur une architecture orientée messages, en utilisant le protocole AMQP.

## Technologies utilisées

- **Node.js** - JavaScript côté serveur
- **RabbitMQ** - pour la gestion des files de messages
- **Express.js** - pour exposer une API simple
- **HTML/CSS + Bootstrap** - pour l’interface graphique
- **Docker Compose** - pour la mise en place locale de RabbitMQ

## Fonctionnement

- L’utilisateur peut soumettre une opération via une interface web ou automatiquement toutes les 5 secondes.
- Les messages sont envoyés dans RabbitMQ.
- Un ensemble de workers spécialisés traitent les messages selon l'opération.
- Chaque worker simule un traitement long (entre 5 et 15 secondes).
- Une fois le calcul terminé, le résultat est envoyé dans une file dédiée.
- Ces résultats sont ensuite affichés dans l’interface web, sans rechargement de la page.

## Structure du projet

- producer/ → Contient un système d'envoi automatique et un lecteur de résultats
- worker/ → Contient un unique fichier générique utilisé pour lancer tous les workers spécialisés
- server/ → Contient le serveur Express qui reçoit les requêtes de l’interface web et les envoie dans RabbitMQ
- public/ → Contient le fichier statique de l’interface utilisateur
- docker-compose.yml → configuration RabbitMQ local
- .env → Contient la configuration du projet

## Comment exécuter le projet

1. Cloner le dépôt :

```bash
git clone https://github.com/EdenIns/RabbitMQ_project.git
cd projet
npm install
```

2. Créer un fichier .env :

RABBITMQ_URL

3. Lancer RabbitMQ en local :

```bash
docker-compose up -d
```

4. Lancer les 4 workers :

```bash
node worker/opWorker.js add
node worker/opWorker.js sub
node worker/opWorker.js mul
node worker/opWorker.js div
```

5. Lancer le serveur web :

```bash
node server/express.js
```

6. Ouvrir l’interface

http://localhost:3000

### Fonctionnalités mises en place

- Routage des opérations avec direct exchange

- Diffusion en broadcast avec fanout exchange pour op: all

- Interface utilisateur avec Bootstrap

- Résultats mis à jour automatiquement toutes les 3 secondes

- Système entièrement conteneurisé via Docker
