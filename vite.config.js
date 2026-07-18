// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:                 resolve(__dirname, 'index.html'),
        aCompanhia:           resolve(__dirname, 'a-companhia.html'),
        composicaoAcionaria:  resolve(__dirname, 'composicao-acionaria.html'),
        atasAssembleias:      resolve(__dirname, 'atas-assembleias.html'),
        documentosCvm:        resolve(__dirname, 'documentos-cvm.html'),
        centralResultados:    resolve(__dirname, 'central-resultados.html'),
        calendarioEventos:    resolve(__dirname, 'calendario-eventos.html'),
        ratings:              resolve(__dirname, 'ratings.html'),
        faleComRi:            resolve(__dirname, 'fale-com-ri.html'),
        mailing:              resolve(__dirname, 'mailing.html'),
        termosCondicoes:      resolve(__dirname, 'termos-e-condicoes.html'),
        politicaPrivacidade:  resolve(__dirname, 'politica-de-privacidade.html'),
        definicaoCookies:     resolve(__dirname, 'definicao-de-cookies.html'),
        homeV2:               resolve(__dirname, 'home-v2.html'),
        homeSideBar:          resolve(__dirname, 'home-side-bar.html'),
        areaRestrita:         resolve(__dirname, 'area-restrita.html'),
        icons:                resolve(__dirname, 'icons.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
