var result = "";
var currentUrl = "";

window.onload = () => {
  update();

  document.getElementById("submit").addEventListener("click", () => {
    console.log("click");
    var startChapter = parseInt(document.getElementById("from-chap").value);
    var endChapter = parseInt(document.getElementById("to-chap").value);

    console.log("Fetching: " + currentUrl);
    console.log("From chapter " + startChapter + " to chapter " + endChapter);

    doWork(startChapter, endChapter);
  });
};

function doWork(currentChap, maxChap) {
  if (currentChap > maxChap) {
    return;
  }

  console.log("Fetching: " + currentUrl + "chapter-" + currentChap + "/");

  fetch(currentUrl + "chapter-" + currentChap + "/")
    .then((res) => {
      return res.text();
    })
    .then((text) => {
      console.log(text);
      var mockElement = document.createElement("html");
      mockElement.innerHTML = text;

      console.log(mockElement);

      var contentElement = mockElement.getElementsByClassName("text-left")[0];
      var paragraphs = contentElement.querySelectorAll("p");
      for (var i = 0; i < paragraphs.length; i++) {
        var paragraph = paragraphs[i];
        var content = paragraph.innerHTML;
        if (content.includes("<strong>")) {
          var title = paragraph.querySelectorAll("strong")[0].innerHTML;
          result += title + "\n";
        } else {
          result += decodeHtml(paragraph.innerHTML) + "\n";
        }
      }
    })
    .then(() => {
      document.getElementById("result").innerHTML = result;
      doWork(currentChap + 1, maxChap);
    });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function initUI() {
  document.getElementById("url-not-valid").style.display = "none";
  document.getElementById("root").style.display = "block";
}

function update() {
  getCurrentTab().then((tab) => {
    if (tab.url && tab.url.includes("4novel.com")) {
      initUI();

      var args = tab.url.replace("https://", "").split("/");
      document.getElementById("currentNovel").innerHTML = capitalize(
        args[2].replaceAll("-", " ")
      );

      currentUrl = "https://" + args[0] + "/" + args[1] + "/" + args[2] + "/";
    }
  });
}

function timeoutFetch(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
}

function capitalize(s) {
  const finalSentence = s.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
  return finalSentence;
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
