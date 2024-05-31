import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import singleFile from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [solidPlugin(), singleFile()],
})
