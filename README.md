# P03 - Proyecto Web (Frontend y Backend)
Proyecto desarrollado para la gestión de tareas, usuarios y etiquetas utilizando una arquitectura cliente-servidor.
#  Estructura del Proyecto
```
P03/
├── BACKEND/
│   ├── controllers/
│   ├── database/
│   ├── models/
│   ├── node_modules/       # (Se genera automáticamente con npm install)
│   ├── routes/
│   ├── package.json        # Dependencias del proyecto
│   ├── package-lock.json
│   └── server.js           # Archivo principal del servidor
├── FRONTEND/
│   ├── controllers/
│   └── views/              # Archivos HTML (home, login, tasks)
└── test.http               # Pruebas de peticiones HTTP
```
# Guía de Instalación y Ejecución
* Clonar el repositorio
    - git clone https://github.com/JohnV-1/Pagina-Web.git
    - cd Pagina Web/P03/BACKEND
* Instalar las dependencias
    - npm install
* Iniciar el servidor
    - node server.js
En el paquete de node viene instalado nodemon se recomienda correr el servidor con: 
    -npx nodemon server.js
De esta manera no se tiene que volver a correr el servidor con cada cambio
