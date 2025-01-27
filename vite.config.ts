import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: "My App",
        short_name: "App",
        description: "My Progressive Web App",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "icon.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,htm,js,css,png,jpg,jpeg,gif,svg}'],
      },
      includeAssets: [
        '**/*',
      ],
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
