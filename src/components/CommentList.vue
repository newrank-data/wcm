<template>
  <div>
    <p class="mblog-info" v-if="mblog">
      {{`${this.mblog.user_name}：${this.mblog.content.substr(0, 37)}...`}}
    </p>
    <a-list
      :loading="loading"
      :dataSource="comments"
      :locale="{emptyText: '添加微博后，点击评论数可显示对应微博的评论'}"
    >
      <div v-if="showLoadingMore" slot="loadMore" :style="{ textAlign: 'center', margin: '12px 0', height: '32px', lineHeight: '32px' }">
        <a-spin v-if="loadingMore" />
        <a-button v-else @click="loadMore">加载更多</a-button>
      </div>
      <a-list-item slot="renderItem" slot-scope="item, index" :key="item.comment_num_id">
        <template slot="actions">
          <span @click="copyToClipboard(item.content)">
            <a-icon type="copy" style="margin-right: 8px" />
          </span>
          <span>
            <a-icon type="message" style="margin-right: 8px" />
            {{item.comment_count}}
          </span>
          <span>
            <a-icon type="like" style="margin-right: 8px" />
            {{item.like_count}}
          </span>
          <span>
            <a-icon type="clock-circle" style="margin-right: 8px" />
            {{item.release_time}}
          </span>
        </template>
        <a-list-item-meta :description="item.content">
          <span slot="title">
            {{`#${index + 1}`}}
            <a-divider type="vertical" class="divider" />
            <a class="title" :href="item.user_url" target="_blank">{{item.user_name}}</a>
            <span @click="copyToClipboard(item.user_name)" style="margin: 0 8px; cursor: pointer;">
              <a-icon type="copy"/>
            </span>
            <a-divider type="vertical" class="divider" />
            <span>
              <a-icon
                type="safety-certificate"
                style="margin-right: 8px"
                v-if="item.user_verified_type == -1 ? false : true"
              />
              {{transVerifiedType(item.user_verified_type)}}
            </span>
            <a-divider type="vertical" class="divider" />
            <span>
              <a-icon type="user" style="margin-right: 8px" />
              {{item.user_follower_count}}
            </span>
          </span>
        </a-list-item-meta>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
export default {
  name: 'CommentList',
  data () {
    return {
      comments: [],
      nextCursor: '0',
      loading: false,
      loadingMore: false,
      mblog: null
    }
  },
  computed: {
    showLoadingMore () {
      return this.nextCursor != '0' && this.mblog.comment_count != this.comments.length + this.subCommentCount ? true : false;
    },
    subCommentCount () {
      return this.comments.reduce((acc, cur) => acc + cur.comment_count, 0);
    }
  },
  methods: {
    showFirst (mblog) {
      this.loading = true;
      this.comments = [];
      this.nextCursor = '0';
      this.mblog = mblog;
      
      if (mblog.comment_increment) {
        this.$emit('resetIncrement', mblog.id);
      }
      this.fetchNew(mblog.mblog_num_id);
    },
    loadMore () {
      this.fetchNew(this.mblog.mblog_num_id, this.nextCursor);
    },
    async fetchNew (id, max_id='') {
      this.loadingMore = true;
      const url = `https://nr-wcm-proxy.herokuapp.com/comment?id=${id}&gsid=${this.$root.$children[0].gsid}&max_id=${max_id}`;
      const fetchResult = await fetch(url);
      const resultJson = await fetchResult.json();

      if (resultJson.status == 200) {
        const _comments = resultJson.data.comments;
        this.nextCursor = resultJson.data.next_cursor;

        if (_comments) {
          this.pushList(_comments);
        } else {
          this.$message.info('暂时没有评论了');
        }

      } else {
        this.$message.error(resultJson.msg);
      }
      this.loading = false;
      this.loadingMore = false;
    },
    pushList (comments) {
      for (let i = 0; i < comments.length; i++) {
        this.comments.push(comments[i]);
      }
    },
    delete (mblog_num_id) {
      if (this.mblog && this.mblog.mblog_num_id == mblog_num_id) {
        this.comments = [];
        this.nextCursor = '0';
        this.mblog = null;
      }
    },
    clear () {
      this.comments = [];
      this.nextCursor = '0';
      this.mblog = null;
    },
    transVerifiedType (type) {
      let name = '';
      switch (type) {
        case -1:
          name = '普通用户';
          break;
        case 0:
          name = '名人';
          break;
        case 1:
          name = '政府';
          break;
        case 2:
          name = '企业';
          break;
        case 3:
          name = '媒体';
          break;
        case 200:
          name = '初级达人';
          break;
        case 220:
          name = '中高级达人';
          break;
        default:
          name = '其他'
          break; 
      }
      return name;
    },
    copyToClipboard (value) {
      this.$copyText(value).then(function () {
        this.$message.info('复制成功');
      }.bind(this), function (error) {
        window.console.log('error: ' + error);
        this.$message.error('复制失败');
      }.bind(this));
    }
  }
}
</script>
<style scoped>
.title {
  color: #eb7350;
}
.divider {
  background-color: #d8d8d8;
  margin: 0 8px;
}
.mblog-info {
  position: fixed;
  display: inline-block;
  text-overflow: ellipsis;
  top: 64px;
  right: 0;
  width: calc(100% - 540px);
  height: 42px;
  line-height: 42px;
  padding: 0 16px;
}
</style>