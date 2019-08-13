<template>
  <div>
    <div class="mblog-list-actions row-space-between">
      <div class="row-space-between" style="width: 100%; padding: 0 10px 0 16px;">
        <h4>{{this.mblogs.length ? `正在监控 ${this.mblogs.length} 条微博`: ''}}</h4>
        <div>
          <a-button
            type="primary"
            icon="reload"
            size="small"
            @click="refreshAll"
            :disabled="lockAction"
            :loading="refreshAllLoading"
          >刷新
          </a-button>
          <a-button
            type="default"
            icon="plus"
            size="small"
            @click="$emit('clickInsertMblog')"
            :disabled="lockAction"
          >添加
          </a-button>
          <a-button
            type="danger"
            icon="close"
            size="small"
            @click="$emit('clickDeleteMblog')"
            :disabled="lockAction"
          >全部删除
          </a-button>
        </div>
      </div>
      <a-divider type="vertical" style="background-color: #d8d8d8" />
    </div>
    <a-list
      itemLayout="vertical"
      :locale="{emptyText: '点击 ＋ 添加要监控的微博'}"
      :dataSource="reverseMblogs"
    >
      <a-list-item slot="renderItem" slot-scope="item" key="item.mblogNumId" class="a-list-item">
        <template slot="actions">
          <span @click="$emit('showComment', item)">
            <a-icon type="message" style="margin-right: 8px" />
            {{item.comment_count}}
          </span>
          <span>
            <a-icon type="clock-circle" style="margin-right: 8px" />
            {{item.release_time}}
          </span>
          <span @click="deleteOne(item.id, item.mblog_num_id)">
            <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" style="margin-right: 8px" />
            删除  
          </span>
        </template>
        <a-list-item-meta>
          <a slot="title" :href="item.user_url" target="_blank">{{item.user_name}}</a>
          <a-badge slot="avatar" :count="item.comment_increment" :title="`最近新增评论 ${item.comment_increment} 条`">
            <a-avatar :src="item.user_avatar" />
          </a-badge>
        </a-list-item-meta>
        <a :href="item.mblog_url" target="_blank">
          {{item.content}}
        </a>
      </a-list-item>
    </a-list>
  </div>
</template>

<script>
export default {
  name: 'MblogList',
  data () {
    return {
      mblogs: [],
      lockAction: true,
      refreshAllLoading: false,
      modalType: 'insert'
    }
  },
  created () {
    this.load();
  },
  computed: {
    reverseMblogs () {
      const count = this.mblogs.length;
      const reverseMblogs = [];
      for (let i = count - 1; i >= 0; i--) {
        reverseMblogs.push(this.mblogs[i]);
      }
      return reverseMblogs;
    }
  },
  methods: {
    async load () {
      this.mblogs = await this.$db.mblog.toArray();
    },
    async refreshAll () {
      this.refreshAllLoading = true;
      this.lockAction = true;

      for (let i = 0; i < this.mblogs.length; i++) {
        const item = this.mblogs[i];
        const mblogInfo = await this.fetchMblogInfo(item.user_id, item.mblog_hex_id);
        if (mblogInfo && mblogInfo.commentCount > item.comment_count) {
          const increment = mblogInfo.commentCount - item.comment_count;
          this.mblogs[i].comment_increment = increment;
          this.mblogs[i].comment_count = mblogInfo.commentCount;
        }
      }

      this.refreshAllLoading = false;
      this.lockAction = false;
    },
    async insertOne ($event) {
      const userInfo = await this.fetchUserInfo($event.userId);
      const mblogInfo = await this.fetchMblogInfo($event.userId, $event.mblogHexId);

      if (userInfo && mblogInfo) {
        const newMblog = {
          user_id: $event.userId,
          user_name: userInfo.userName,
          user_avatar: userInfo.userAvatar,
          user_url: userInfo.userUrl,
          content: mblogInfo.content,
          release_time: mblogInfo.releaseTime,
          comment_count: mblogInfo.commentCount,
          mblog_num_id: mblogInfo.mblogNumId,
          mblog_hex_id: $event.mblogHexId,
          mblog_url: mblogInfo.mblogUrl,
          comment_increment: mblogInfo.commentCount
        };

        // 获取到的新微博写入 IndexedDB，加上返回的数据库 id 后再更新到 mblogs 中，保持数据同步
        try {
          newMblog.id = await this.$db.mblog.add(newMblog);
          this.mblogs.push(newMblog);
          this.$emit('hideModal');
        } catch (err) {
          window.console.log(err);
          this.$message.error('微博插入数据库失败');
        }
      } else {
        this.$message.error('获取微博详情失败');
        this.$refs.ModalWindow.stopLoading();
      }
    },
    // 从列表中删除一条微博并清空其评论，需要同时操作 Vue 和 IndexedDB
    async deleteOne (id, mblog_num_id) {
      this.mblogs = this.mblogs.filter(i => i.id != id);
      try {
        await this.$db.mblog.delete(id);
      } catch (err) {
        this.$message.error('删除微博失败');
        window.console.log(err);
      }
      this.$emit('deleteComment', mblog_num_id);
    },
    async deleteAll () {
      this.mblogs = [];
      try {
        await this.$db.mblog.clear();
        this.$emit('hideModal')
      } catch (err) {
        this.$message.error('清空微博失败');
        window.console.log(err);
      }
    },
    async fetchUserInfo (userId) {
      try {
        const res = await fetch(`https://nr-wcm-proxy.herokuapp.com/user/${userId}`);
        const resJson = await res.json();
        if (resJson.status == 200) {
          return resJson.data;
        } else {
          return null;
        }
      } catch (err) {
        window.console.log(err);
        return null;
      }
    },
    async fetchMblogInfo (userId, mblogHexId) {
      try {
        const url = `https://nr-wcm-proxy.herokuapp.com/mblog/${userId}/${mblogHexId}?gsid=${this.$root.$children[0].gsid}`;
        const res = await fetch(url);
        const resJson = await res.json();
        if (resJson.status == 200) {
          return resJson.data;
        } else {
          return null;
        }
      } catch (err) {
        window.console.log(err);
        return null;
      }
    },
    async resetIncrement (id) {
      // 重置 Vue 中的评论增量
      for (let i = 0; i < this.mblogs.length; i++) {
        if (this.mblogs[i].id == id) {
          this.mblogs[i].comment_increment = 0;
          break;  
        }
      }
      // 重置 IndexDB 中的评论增量
      try {
        await this.$db.mblog.update(id, {comment_increment: 0})
      } catch (err) {
        this.$message.error('重置数据库评论增量失败');
      }
    },
    enableAction () {
      this.lockAction = false;
    },
    disableAction () {
      this.lockAction = true;
    }
  }
}
</script>

<style scoped>
.ant-list-vertical .ant-list-item-meta {
  margin: 0;
}
.mblog-list-actions {
  position: fixed;
  z-index: 9;
  width: 540px;
  height: 42px;
  top: 64px;
  left: 0;
}
</style>
