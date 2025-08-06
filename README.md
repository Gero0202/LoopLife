# 🎧 LoopLife - Tu Plataforma de Loops y Sonidos

## 📝 Descripcion

LoopLife es una red social centrada en la música, donde los usuarios pueden subir loops originales, descubrir contenido por género, dejar comentarios, calificar creaciones y conectar con otros artistas. La plataforma promueve la interacción creativa y el crecimiento comunitario, enfocándose en usabilidad, rendimiento y seguridad.


* **Caracteristicas principales**
    * **Exploracion de Loops**: Descubre loops por géneros como Hip-Hop, Techno, Lofi y más.
    * **Interaccion Social**: Da "me gusta" y comenta en los loops de otros usuarios.
    * **Perfiles de Usuario**: Crea tu perfil con biografía y avatar, y gestiona tus propias creaciones.
    * **Autenticacion Segura**: Registro y login de usuarios con verificación de email.
    * **Busqueda**: Encuentra usuarios y loops fácilmente.
    * **Diseño Responsive**: Experiencia de usuario optimizada para dispositivos móviles y de escritorio.


---

## 🚀 Tecnologias

* **Frontend**
    * **Next.js**: Framework de React para renderizado del lado del servidor (SSR) y generación de sitios estáticos.
    * **React**: Biblioteca para la interfaz de usuario.
    * **TypeScript**: Lenguaje de programación tipado que mejora la calidad del código.
    * **CSS Modules**: Para modularizar y encapsular los estilos.

* **Backend**
    * **Next.js (API Routes)**: Para la creación de la API RESTful.
    * **PostgreSQL**: Base de datos relacional para almacenar toda la información.
    * **node-postgres (pg)**: Cliente de PostgreSQL para Node.js.
    * **JWT (JSON Web Tokens)**: Para la autenticación y gestión de sesiones.

---

## 🔐 Seguridad

El proyecto ha sido desarrollado teniendo en cuenta las siguientes consideraciones clave de seguridad:

* **Hashing de Contraseñas**: Usamos **Bcrypt** para almacenar contraseñas hasheadas, evitando texto plano.
* **Verificación de Email**: Los usuarios validan su cuenta vía correo con códigos únicos enviados por SMTP (Google).
* **Rate Limiting**: Protección contra ataques de fuerza bruta y DoS en endpoints sensibles.
* **Sesiones Seguras**: Uso de cookies **HTTP-only** y configuraciones de seguridad para prevenir XSS.
* **Variables de Entorno**: Información sensible protegida fuera del código.
* **Prevención de Inyección SQL**: Consultas parametrizadas para evitar SQL Injections.


---

## ⚙️ Instalacion

### 📦 Prerequisitos

- Node.js v18 o superior
- npm o yarn
- PostgreSQL (puede ser local o Supabase)
    

### 🛠️ Pasos para ejecutar el proyecto

1.  **Clonar repositorio**:
    ```bash
    git clone https://github.com/Gero0202/LoopLife.git
    cd LoopLife
    ```
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno**:
    * Crea un archivo .env.local en la raíz del proyecto y añade las siguientes variables.
        ```ini
        # Conexión a la Base de Datos
        DATABASE_URL="postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_db]"

        # Secreto para JWT
        JWT_SECRET="Tu_Secreto_Ultra_Seguro_Aqui"

        # Credenciales para el servicio de email (ej. Nodemailer)
        EMAIL_USER="tu_email@gmail.com"
        EMAIL_PASS="tu_contraseña_o_app_password"
        ```
4.  **Ejecucion del Proyecto**:
    * **Modo Produccion**:
        ```bash
        npm start
        ```
    * **Modo Desarrollo**:
        ```bash
        npm run dev
        ```
        (El servidor de desarrollo se iniciara en http://localhost:3000.)

---

## 🚀 Despliegue

El proyecto está desplegado en Vercel y Supabase:  
🔗 [https://loop-life-pearl.vercel.app/](https://loop-life-pearl.vercel.app/)


## 👤 Autor y Créditos

### 10. Créditos y Autoría

* **Autor**: Geronimo Tortosa
* **GitHub**: [Gero0202](https://github.com/Gero0202)
* **Diseño**: El diseño y la implementación de este proyecto son 100% originales del autor.
