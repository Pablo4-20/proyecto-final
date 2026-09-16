# 💰 Sistema de Control de Gastos Full-Stack

Plataforma integral para la gestión de finanzas personales, desarrollada como proyecto práctico para la carrera de Software en la Universidad Estatal de Bolívar. Permite a los usuarios registrar, editar, eliminar y visualizar sus ingresos y gastos con un aislamiento estricto de datos.

**Desarrollador:** Pablo David Holguin Rios

## 🛠 Arquitectura y Tecnologías
El sistema está construido bajo una arquitectura cliente-servidor separada (Frontend en React y Backend en Laravel), comunicándose a través de una API REST protegida.

* **Frontend:** React + Vite, React Router, Tailwind CSS v4 (con soporte nativo para Modo Oscuro).
* **Backend:** Laravel 11, Base de datos SQLite, Autenticación mediante Laravel Sanctum.

## 🧩 Patrones de Diseño (GoF) Aplicados
Para mantener un código limpio y escalable, se aplicaron los siguientes patrones de diseño de la banda de los cuatro (GoF):
1. **Factory Method:** Implementado en el frontend (`MovimientoUIFactory.js`) para centralizar y delegar la creación de estilos, clases de Tailwind e íconos dependiendo del tipo de movimiento (Ingreso o Gasto).
2. **Observer:** Implementado en el backend para registrar automáticamente logs de auditoría sin saturar los controladores cada vez que se crea o elimina un registro.

## 🚀 Guía de Instalación y Arranque

### 1. Configuración del Backend (Laravel)
1. Clonar el repositorio y entrar a la carpeta del backend.
2. Instalar las dependencias de PHP: `composer install`
3. Crear el archivo de entorno copiando el ejemplo: `cp .env.example .env`
4. Generar la clave de la aplicación: `php artisan key:generate`
5. Ejecutar las migraciones para crear las tablas: `php artisan migrate`
6. Levantar el servidor de desarrollo: `php artisan serve` (Correrá en `http://localhost:8000`)

### 2. Configuración del Frontend (React)
1. Abrir una nueva terminal y entrar a la carpeta del frontend.
2. Instalar las dependencias de Node: `npm install`
3. Crear el archivo de entorno copiando el ejemplo: `cp .env.example .env`
4. Asegurarse de que el archivo `.env` apunte a la API local (ej. `VITE_API_URL=http://localhost:8000/api`).
5. Levantar el servidor de desarrollo: `npm run dev` (Correrá en `http://localhost:5173`)