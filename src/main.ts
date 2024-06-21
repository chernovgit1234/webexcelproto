import { createApp } from 'vue'
import App from './App.vue'
import {storage} from './store'
import './assets/styles/null.css'
import './assets/styles/otherclasses.css'
import './assets/styles/elements.css'
import './assets/styles/const.css'
import './assets/styles/fonts.css'
import 'material-icons/iconfont/material-icons.css';
import 'handsontable/dist/handsontable.full.css'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import i18n from './i18n';

createApp(App)
 .use(Quasar, quasarUserOptions)
 .use(i18n())
 .use(storage)
 .mount('#app')
