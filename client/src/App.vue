<template>
  <div class="App">
    <div class="layout_main">
      <Menu></Menu>
      <Sidebar></Sidebar>
      <Content></Content>
    </div>

    <div class="toast-container" style="position: fixed; bottom: 60px; right: 10px;">
      <div id="liveToast" class="toast align-items-center border-1" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body notify-success">
            {{ this.textNotify }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
            aria-label="Close"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from './components/Menu.vue';
import Sidebar from './components/Sidebar.vue';
import Content from './components/Content.vue';
import bootstrap from 'bootstrap/dist/js/bootstrap';
import { useStore } from './stores/Store';
import { storeToRefs } from 'pinia'
import SocketioService from './services/socketio.service';
export default {
  name: 'App',
  components: {
    Menu,
    Sidebar,
    Content
  },
  data() {
    let store = useStore();
    let { notifyText } = storeToRefs(store);
    let { flag } = storeToRefs(store);
    return {
      notifyText,
      flag,
      textNotify: '',
    };
  },
  watch: {
    flag() {
      this.textNotify = this.notifyText.toString();
      this.showNotify();
    }
  },
  methods: {
    showNotify() {
      const toastLiveExample = document.getElementById('liveToast')
      const toast = new bootstrap.Toast(toastLiveExample);

      toast.show();
    },
  },
  beforeUnmount() {
    SocketioService.disconnect();
    SocketioService.disconnectStranger();
  }
}
</script>

<style scoped>
#liveToast {
  background-color: #0091ff;
  width: max-content;
}

.notify-success {
  color: #fff;
  font-size: 20px;
  padding: 10px;
  word-spacing: normal;
}
</style>