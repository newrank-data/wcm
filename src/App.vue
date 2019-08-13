<template>
  <a-locale-provider :locale="zh_CN" id="app">
    <a-layout>
      <a-layout-header class="header row-space-between">
        <div class="row-space-between">
          <div id="logo">
            <img src="./assets/logo.jpg" class="logo">
          </div>
          <h2>微博小触手</h2>
        </div>
        <div>
          <span v-if="!gsid">神说，要有 gsid 👉&nbsp;&nbsp;&nbsp;</span>
          <a-button
            type="default"
            icon="key"
            @click="handleClickconfigGSID"
          >配置 gsid
          </a-button>
        </div>
      </a-layout-header>
      <a-layout-sider class="sider" width="540px">
        <MblogList
          ref="MblogList"
          @clickInsertMblog="handleClickInsertMblog"
          @clickDeleteMblog="handleClickDeleteMblog"
          @hideModal="handleHideModal"
          @showComment="handleShowComment"
          @deleteComment="handleDeleteComment"
        />
      </a-layout-sider>
      <a-layout-content class="content" ref="content">
        <CommentList
          ref="CommentList"
          @resetIncrement="handleResetIncrement"
        />
      </a-layout-content>
      <ModalWindow
        ref="ModalWindow"
        @insertMblog="handleInsertMblog"
        @deleteMblog="handleDeleteMblog"
        @configGSID="handleConfigGSID"
      />
    </a-layout>
  </a-locale-provider>
</template>

<script>
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
import MblogList from './components/MblogList.vue';
import CommentList from './components/CommentList.vue';
import ModalWindow from './components/ModalWindow.vue';

export default {
  name: 'app',
  components: {
    MblogList,
    CommentList,
    ModalWindow
  },
  data() {
    return {
      zh_CN,
      gsid: '',
      modalType: 'insert',
      isModalVisible: false,
    }
  },
  computed: {
    showCommentLoadingMore () {
      if (this.nextCursor && this.nextCursor != '0') {
        return true;
      } else {
        return false;
      }
    }
  },
  mounted () {
    this.$refs.MblogList.disableAction();
  },
  methods: {
    handleClickconfigGSID () {
      this.$refs.ModalWindow.setType('configGSID');
      this.$refs.ModalWindow.show();
    },
    handleConfigGSID ($event) {
      this.gsid = $event;
      this.$refs.ModalWindow.hide();
      this.$refs.MblogList.enableAction();
      this.$message.info('于是就有了 gsid');
    },
    handleClickRefreshMblog () {
      this.$refs.MblogList.disableAction();
    },
    handleClickInsertMblog () {
      this.$refs.ModalWindow.setType('insertMblog');
      this.$refs.ModalWindow.show();
    },
    handleInsertMblog ($event) {
      this.$refs.MblogList.insertOne($event);
    },
    handleClickDeleteMblog () {
      this.$refs.ModalWindow.setType('deleteMblog');
      this.$refs.ModalWindow.show();
    },
    handleDeleteMblog () {
      this.$refs.MblogList.deleteAll();
      this.$refs.CommentList.clear();
    },
    handleShowComment ($event) {
      this.$refs.content.$el.scrollTop = 0;
      if ($event.comment_count) {
        this.$refs.CommentList.showFirst($event);
      } else {
        this.$message.info('该微博暂无评论');
      }
    },
    handleDeleteComment ($event) {
      this.$refs.CommentList.delete($event);
    },
    handleResetIncrement ($event) {
      this.$refs.MblogList.resetIncrement($event);
    },
    handleHideModal () {
      this.$refs.ModalWindow.hide();
    }
  }
}
</script>

<style>
h1, h2, h3, h4, h5, h6 {
  margin: 0;
}
a, a:hover, a:visited {
  color: rgba(0, 0, 0, 0.65);
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  text-align: left;
}
.header {
  background: #fff;
  box-shadow: 0 2px 8px #f0f1f2;
  position: fixed;
  z-index: 10;
  width: 100%;
  padding: 0 16px;
}
#logo img {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}
.ant-divider, .ant-divider-vertical {
  margin: 0;
}
.row-space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.row-space-around {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
button {
  margin-right: 6px;
}
.sider, .content {
  background: #ffffff;
  padding: 0 16px;
  overflow-y: auto;
  margin-top: 106px;
  height: calc(100vh - 106px);
}
.sider {
  border-right: 1px solid #e8e8e8;
}
.ant-spin {
  min-height: 400px;
}
</style>
