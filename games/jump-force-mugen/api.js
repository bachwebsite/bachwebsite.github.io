/**
 * H5API客户端对接接口
 */
window.h5api = {
  /**
   * 设置进度条进度
   * @param {int} num 范围1~100，进度值
   */
  progress: function (num) {

  },

  /**
   * 提交分数
   * @param {int} score 分数
   * @param {func} callback 回调函数
   */
  submitScore: function (score, callback) {

  },

  /**
   * 获得排行榜
   * @param {func} callback 回调函数
   */
  getRank: function (callback) {

  },

  /**
   * 是否能播放广告
   * @param {func} callback 回调函数
   * @returns {boolean} 是否能播放广告
   */
  canPlayAd: function (callback) {

  },

  /**
   * 播放广告
   * @param {func} callback 回调函数
   */
  playAd: function (callback) {

  },

  /**
   * 调用分享功能
   */
  share: function () {

  },

  /**
   * 获得用户当前是否登录
   */
  isLogin: function () {
    return parent.h5api.isLogin();
  },

  /**
   * 用户登录
   * @param {func} callback 回调函数
   */
  login: function (callback) {

  },

  /**
   * 获得用户头像地址，高宽为120*120像素
   *
   * @param {String} uid 用户编号
   * @param {String} size 头像大小
   * @return 用户头像地址
   */
  getUserAvatar: function (uid, size) {

  },

  /**
   * 获得用户小头像地址，高宽为48*48像素
   */
  getUserSmallAvatar: function (uid) {

  },

  /**
   * 获得用户大头像地址，高宽为200*200像素
   */
  getUserBigAvatar: function (uid) {

  },

  /**
   * 提交排名
   *
   * @param {int} score 分数
   * @param {func} callback 回调函数
   */
  submitRanking: function (score, callback) {

  },

  /**
   * 新版提交排名
   * @param {*} rankId 排行榜id
   * @param {*} score 分数
   * @param {*} callback 回调函数
   */
  submitRankScore: function (rankId, score, callback) {

  },

  /**
   * 获得我的排名
   *
   * @param {func} callback 回调函数
   */
  getMyRanking: function (callback) {

  },

  /**
   * 获得排名列表
   *
   * @param {func} callback 回调函数
   * @param {int} page 页码 从1开始
   * @param {int} step 每页条数
   */
  getRanking: function (callback, page, step) {

  },

  /**
   * 展示排行榜列表面板
   */
  showRanking: function () {

  },

  /**
   * 展示新版排行榜面板
   */
  showRankList: function () {

  },

  /**
   * 获得我附近排名列表
   *
   * @param {func} callback 回调函数
   * @param {int} step 需要条数
   */
  getNearRanking: function (callback, step) {

  },

  /**
   * 敏感词检查
   *
   * @param {*} word
   * @param {*} callback
   */
  checkWord: function (word, callback) {

  },
  /*
   * 展示推荐面板
   */
  showRecommend: function () {

  },
  /**
   * 存档
   * @param {*} params.more 是否是多档 true | false
   * @param {*} params.type 操作类型 write | read
   * @param {*} params.title 存档标题 type为write时必填
   * @param {*} params.data 存档数据 type为write时必填
   * @param {*} params.callback 回调函数
   */
  save: function (params) {

  },
  /**
   * 游戏模式
   * @param {*} mode 1 游客 2 账户，不传则打开面板
   */
  gameMode: function (mode) {

  },
  /**
   * 显示引导面板
   * @param {*} callback 领取按钮回调
   */
  showGuide: function (callback, index) {

  },
  /**
   * 检查API是否能使用
   */
  checkAPI: function () {

  }
};
window.h5api.checkAPI();
