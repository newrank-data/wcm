<template>
  <a-modal
    :title="title"
    :visible="visible"
    @ok="ok"
    @cancel="cancel"
    :confirmLoading="loading"
  >
    <p>{{content}}</p>
    <a-input
      :placeholder="placeholder"
      v-model="inputValue"
      v-if="type == 'deleteMblog' ? false : true"
    />
  </a-modal>
</template>

<script>
export default {
  name: 'ModalWindow',
  data () {
    return {
      type: '',
      visible: false,
      placeholder: '',
      title: '',
      content: '',
      inputValue: '',
      loading: false
    }
  },
  watch: {
    type () {
      if (this.type == 'insertMblog') {
        this.title = '添加微博';
        this.content = '请在下方填入微博链接';
        this.placeholder = 'https://weibo.com/1111681197/HEmYxrmyx?xxxxxxxxxx';
      } else if (this.type == 'deleteMblog') {
        this.title = '删除所有微博';
        this.content = '确认删除所有微博？此操作不可撤销！';
      } else if (this.type == 'configGSID') {
        this.title = '配置 gsid';
        this.content = '请自行抓包微博客户端请求，在下方填入获取到的 gsid';
        this.placeholder = '90 位数字、字母、短横线和下划线的组合'
      }
    }
  },
  methods: {
    setType (type) {
      this.type = type;
    },
    show () {
      this.visible = true;
    },
    hide () {
      this.visible = false;
      this.loading = false;
      this.inputValue = '';
    },
    ok () {
      this.loading = true;
      if (this.type == 'insertMblog') {
        const match = /weibo\.com\/(\d+)\/(\w+)/.exec(this.inputValue);
        if (match) {
          const userId = match[1];
          const mblogHexId = match[2];
          this.$emit('insertMblog', {
            userId: userId,
            mblogHexId: mblogHexId
          });
        } else {
          this.$message.error('链接格式错误，请重新输入');
          this.inputValue = '';
          this.loading = false;
        }
      } else if (this.type == 'deleteMblog') {
        this.$emit('deleteMblog');
      } else if (this.type == 'configGSID') {
        const matchFlag = /[A-Za-z0-9\-_]{90}/.test(this.inputValue);
        if (matchFlag) {
          this.$emit('configGSID', this.inputValue);
        } else {
          this.$message.error('gsid 格式错误，请重新输入');
          this.inputValue = '';
          this.loading = false;
        }
      }
    },
    cancel () {
      this.loading = false;
      this.inputValue = '';
      this.visible = false;
    },
    stopLoading () {
      this.loading = false;
    }
  }
}
</script>

