import Vue from 'vue';
import App from './App.vue';
import VueJson from 'vue-jsonp';
import './plugins/ant-design-vue.js';
import { Layout, Button, Divider, Icon, List, Avatar, Spin, Modal, Input, message, Badge} from 'ant-design-vue';
import Dexie from 'dexie';
import Clipboard from 'vue-clipboard2';

const db = new Dexie('wcm');
db.version(1).stores({
  mblog: '++id'
});

Vue.config.productionTip = false;
Vue.use(VueJson, 5000);
Vue.use(Layout);
Vue.use(Button);
Vue.use(Divider);
Vue.use(Icon);
Vue.use(List);
Vue.use(Avatar);
Vue.use(Icon);
Vue.use(Spin);
Vue.use(Modal);
Vue.use(Input);
Vue.use(Badge);
Vue.use(Clipboard);

Vue.prototype.$message = message;
Vue.prototype.$db = db;


new Vue({
  render: h => h(App),
}).$mount('#app');