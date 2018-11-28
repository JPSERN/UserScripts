// ==UserScript==
// @name         Popular Posts Reviver for Qiita
// @namespace    PPR
// @version      0.2
// @description  Qiita の投稿の右カラムに「人気の投稿」を表示させるスクリプト。Chromeのみ使用可能。
// @author       tommy_aka_jps
// @match        https://qiita.com/*/items/*
// ==/UserScript==

(() => {

  /**
   * 人気の投稿データを非同期で取得する
   * @return {Promise}
   **/
  const fetchPopularPosts = (userId) => {
    const cache = getCache(userId);
    if(cache) {
      return Promise.resolve(cache);
    }

    return fetch("//qiita.com/" + userId, {
      method: "get"
    }).then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        console.log(response.statusText);
      }
    }).catch((response) => {
      console.log(response);
    }).then((text) => {
      const data = createObjects(text);
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

    if(cache.cdate != generateCreateDate()) {
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
      cdate: generateCreateDate()
    });

    const ckey = cacheKeyName(userId);
    window.localStorage.setItem(ckey, json);
  };

  /**
   * yyyyMMdd の文字列を生成する
   * @return {String}
   **/
  const generateCreateDate = () => {
    if(!generateCreateDate.cache) {
      const date = new Date();
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      generateCreateDate.cache = year + month + day;
    }
    return generateCreateDate.cache;
  };

  /**
   * html 文字列から人気の投稿用データのオブジェクトを生成する
   * @param {String} html
   * @return {Object[]}
   **/
  const createObjects = (html) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    const result = [];
    const titleElements = dom.getElementsByClassName("userPopularItems_title");

    Array.prototype.forEach.call(titleElements, (titleElement) => {
      result.push({
        title: titleElement.text,
        url: titleElement.href
      });
    });

    return result;
  };

  /**
   * ページに挿入する人気の投稿のHTMLを生成する
   * @param {Object[]} posts
   * @return {Element}
   **/
  const createHtml = (posts) => {
    const ul = document.createElement("ul");
    ul.style.listStyleType = "disc";
    ul.style.marginLeft = "20px";

    posts.forEach((post) => {
      const a = document.createElement("a");
      a.href = post.url;
      a.text = post.title;

      const li = document.createElement("li");
      li.style.marginBottom = "6px";
      li.style.fontSize = "12px";
      li.appendChild(a);
      ul.appendChild(li);
    });

    const h5 = document.createElement("h5");
    h5.textContent = "人気の投稿";
    h5.style.fontWeight = "700";
    h5.style.marginBottom = "10px";

    const div = document.createElement("div");
    div.style.marginBottom = "20px";
    div.appendChild(h5);
    div.appendChild(ul);

    return div;
  };

  /**
   * 必要に応じてローカルストレージの掃除を行う
   * 基本当日以外のキャッシュが存在した場合に限り clear が呼ばれる
   * それ以外は何もしない
   **/
  const clearStorageIfNeeds = () => {
    const keyName = "cache_cdate";
    const cacheCreateDate = window.localStorage.getItem(keyName);

    if(!cacheCreateDate) {
      window.localStorage.setItem(keyName, generateCreateDate());
      return;
    }

    if(cacheCreateDate != generateCreateDate()) {
      window.localStorage.clear();
      window.localStorage.setItem(keyName, generateCreateDate());
      return;
    }
  };

  // ----
  // Main
  // ----
  clearStorageIfNeeds();
  const userId = location.pathname.split('/')[1];
  fetchPopularPosts(userId).then((posts) => {
    if(!posts) return;

    const html = createHtml(posts);
    const targetDiv = document.getElementsByClassName("p-items_toc")[0];
    targetDiv.insertBefore(html, targetDiv.firstChild);
  });
})();
