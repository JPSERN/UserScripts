// ==UserScript==
// @name         qiita-notification-count-changer
// @namespace    None
// @version      0.1
// @description  通知カウント欄の表示を変える
// @author       Jpsern
// @match        https://qiita.com/*
// ==/UserScript==

(() => {
  const notifyElem = document.querySelector(".st-Header_notifications");

  const main = () => {
    //create count-up button
    const countUpButton = createButton();
    countUpButton.textContent = "+";
    countUpButton.addEventListener("click", countUp);

    //create reset button
    const resetButton = createButton();
    resetButton.textContent = "C";
    resetButton.addEventListener("click", reset)

    //set buttons
    const targetWrapper = document.querySelector(".st-Header_end");
    targetWrapper.insertBefore(resetButton, notifyElem);
    targetWrapper.insertBefore(countUpButton, notifyElem);
  }

  const createButton = () => {
    const button = document.createElement("button");
    button.classList.add("px-2", "mr-2");
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.width = "32px";
    button.style.height = "32px";
    button.style.backgroundColor = "#3f9200";
    button.style.color = "#fff";
    button.style.borderRadius = "4px";
    button.style.fontSize = "1.2rem";
    button.style.position = "relative";
    button.style.cursor = "pointer";

    return button;
  }

  const countUp = () => {
    notifyElem.classList.add("st-Header_notifications-active");
    notifyElem.innerText = parseInt(notifyElem.innerText, 10) + 1;
  }

  const reset = () => {
    notifyElem.classList.remove("st-Header_notifications-active");
    notifyElem.innerText = 0;
  }

  main();
})();
