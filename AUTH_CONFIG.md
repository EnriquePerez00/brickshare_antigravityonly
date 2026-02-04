
# Configuración de Autenticación y Email

Para que las funcionalidades de **Login con Google**, **Doble Confirmación de Email** y **Reset de Password** funcionen correctamente, necesitas configurar el proyecto en Supabase (Dashboard) y MailerSend.

## 1. Configurar Mailtrap (Servicio de Email)

Esto habilitará el envío de emails para **Confirmación de Cuenta** y **Recuperación de Contraseña**.

1.  Ve a [Supabase Dashboard](https://supabase.com/dashboard) -> Project Settings -> **Authentication** -> **SMTP Settings**.
2.  Activa **Enable Custom SMTP**.
3.  Rellena los datos con tu cuenta de Mailtrap (Host, Port, User, Password).
    *   **Host**: `live.smtp.mailtrap.io` (para producción) o `sandbox.smtp.mailtrap.io` (para testing).
    *   **Port**: `587`.
    *   **User**: Tu usuario SMTP de Mailtrap.
    *   **Password**: Tu contraseña SMTP.

## 1.1 Configurar Mailtrap API (para envíos personalizados)

Para la función `send-email` (que usamos para notificaciones personalizadas como la donación), necesitas configurar las variables de entorno:

1.  Obtén tu **API Token** desde Mailtrap -> Settings -> API Tokens.
2.  Ve a Supabase Dashboard -> Settings -> Edge Functions -> Secrets.
3.  Añade el secreto: `MAILTRAP_API_KEY`.
4.  Añade el secreto: `MAILTRAP_FROM_EMAIL` (debe ser un dominio verificado en Mailtrap).

## 2. Configurar Confirmación de Email (Doble Opt-in)

1.  En Supabase Dashboard -> Authentication -> **URL Configuration**.
    *   **Site URL**: `https://brickshare.es` (o tu dominio de producción).
    *   **Redirect URLs**: Añade `http://localhost:8080` para desarrollo.
2.  En Supabase Dashboard -> Authentication -> **Providers** -> **Email**.
    *   Activa **Confirm email**.
    *   Esto enviará un email automático al registrarse. El usuario no podrá hacer login hasta confirmar.

## 3. Configurar Login con Google

1.  Ve a [Google Cloud Console](https://console.cloud.google.com/).
2.  Crea un proyecto y configura la **Pantalla de consentimiento OAuth**.
3.  Crea credenciales **Oauth Client ID** (Web application).
    *   **Authorized JavaScript origins**: `https://<tu-proyecto>.supabase.co`.
    *   **Authorized redirect URIs**: `https://<tu-proyecto>.supabase.co/auth/v1/callback`.
4.  Copia el **Client ID** y **Client Secret**.
5.  En Supabase Dashboard -> Authentication -> **Providers** -> **Google**.
    *   Activa **Enable Sign in with Google**.
    *   Pega el Client ID y Client Secret.

## 4. Reset de Password

Ya he implementado la página para introducir la nueva contraseña (`Auth.tsx`).
*   Cuando el usuario pide recuperar contraseña, Supabase enviará un email (usando MailerSend) con un enlace.
*   Al hacer click, el usuario será redirigido a la app y verá el formulario de "Nueva contraseña" (ahora con doble campo de confirmación).
