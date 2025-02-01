import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux';
import { store } from './store/store';
import { GoogleOAuthProvider } from "@react-oauth/google"


// import { registerSW } from 'virtual:pwa-register'

// const updateSW = registerSW({
//   onNeedRefresh() {
//     if (confirm("New content available. Reload?")) {
//       updateSW(true);
//     }
//   },
// });
// const updateSW = registerSW({
//   onNeedRefresh() {
//     if (confirm("New content available. Reload?")) {
//       updateSW(true);
//     }
//   },
// });

const CLIENT_ID = "269242388624-jokhs0tlq237sr026kuv4klc041sdac3.apps.googleusercontent.com"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
)
