# React + Vite

## Google sign-in setup

Create `client/.env` and set `VITE_FIREBASE_API_KEY` to the Web API key shown in
Firebase Console under **Project settings → General → Your apps**. Restart the
Vite client after saving it. Also enable Google under **Authentication →
Sign-in method** and authorize `localhost` under **Authentication → Settings →
Authorized domains**.

See `.env.example` for the required variable name. Do not commit `client/.env`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
