// ==UserScript==
// @name         Popular Posts Reviver for Qiita
// @namespace    PPR
// @version      0.1
// @description  Qiita の投稿の右カラムに「人気の投稿」を表示させるスクリプト。Chromeのみ使用可能。
// @author       tommy_aka_jps
// @match        https://qiita.com/*/items/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// ==/UserScript==

(($) => {

  /**
   * 人気の投稿データを非同期で取得する
   * @return {Promise}
   **/
  const fetchPopularPosts = (userId) => {
    const cache = getCache(userId);
    if(cache) {
      return Promise.resolve(cache);
    }

    return $.ajax({
      type: "get",
      url: "//qiita.com/" + userId,
      dataType: "html"
    }).then(html => {
      const data = createObjects(html);
      setCache(userId, data);

      return data;
    });
  };

  /**
   * キャッシュの名前に使う文字列を返す
   * @param {String} userId
   * @return {String}
   **/
  const cacheKeyName = (userId) => {
    return "c_" + userId;
  };

  /**
   * ローカルストレージから人気の投稿データのキャッシュを取得する
   * @param {String} userId
   * @return {Object[]}
   **/
  const getCache = (userId) => {
    const ckey = cacheKeyName(userId);
    const cache = JSON.parse(window.localStorage.getItem(ckey));

    if(!cache) {
      return;
    }

    if(cache.cdate != getCreateDate()) {
      window.localStorage.removeItem(ckey);
      return;
    }

    return cache.posts;
  };

  /**
   * ローカルストレージに人気の投稿データのキャッシュをしまう
   * @param {String} userId
   * @param {Object[]} posts
   **/
  const setCache = (userId, posts) => {
    const json = JSON.stringify({
      posts: posts,
      cdate: getCreateDate()
    });

    const ckey = cacheKeyName(userId);
    window.localStorage.setItem(ckey, json);
  };

  /**
   * yyyyMMdd の文字列を返す
   * @return {String}
   **/
  const getCreateDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return year + month + day;
  };

  /**
   * html 文字列から人気の投稿用データのオブジェクトを生成する
   * @param {String} html
   * @return {Object[]}
   **/
  const createObjects = (html) => {
    const result = [];
    const $items = $(html).find(".userPopularItems_item");
    $items.each((_index, item) => {
      const $titleElement = $(item).find(".userPopularItems_title");
      result.push({
        title: $titleElement.text(),
        url: $titleElement.attr("href")
      });
    });
    return result;
  };

  /**
   * ページに挿入する人気の投稿のHTMLを生成する
   * @param {Object[]} posts
   * @return {jQuery}
   **/
  const createHtml = (posts) => {
    const $ul = $("<ul>", {style: "list-style-type: disc; margin-left: 20px"})
    posts.forEach((post) => {
      $ul.append(
        $("<li>", {style: "margin-bottom: 6px;font-size: 12px"}).append(
          $("<a>", {href: post.url, text: post.title})
        )
      );
    });

    return $("<div>", {style: "margin-bottom: 20px"})
      .append($("<h5>", {text: "人気の投稿", style: "font-weight: 700; margin-bottom: 10px"}))
      .append($ul);
  };

  // ---- 
  // Main
  // ---- 
  $(function(){
    const userId = location.pathname.split('/')[1];
    fetchPopularPosts(userId).then((posts) => {
      if(!posts) return;

      createHtml(posts).prependTo(".p-items_toc");
    });
  });
})(jQuery);
