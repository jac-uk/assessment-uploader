import Vue from 'vue';
import App from './App.vue';
import * as filters from '@/filters';
import router from '@/router';
import store from '@/store';
import { auth } from '@/firebase';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

const host = window.location.host;
const parts = host.split('.');
if (process.env.NODE_ENV !== 'development' && !host.includes('-develop')) {
  Sentry.init({
    dsn: 'https://23ac92825117451eb421535be7e4c334@o323827.ingest.sentry.io/5301649',
    environment: parts[0] == 'assessments' ? 'production' : 'staging',
    release: process.env.npm_package_version,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })],
  });
}
Vue.config.productionTip = false;

// Register global filters
Object.keys(filters)
  .forEach((filterName) => {
    Vue.filter(filterName, filters[filterName]);
  });

let vueInstance = false;

auth().onAuthStateChanged(async (user) => {
  // Bind Firebase auth state to the vuex auth state store
  await store.dispatch('auth/setCurrentUser', user);
  // Create the Vue instance, but only once
  if (!vueInstance) {
    vueInstance = new Vue({
      el: '#app',
      render: h => h(App),
      router,
      store,
    });
  }
});
