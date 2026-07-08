const audio = document.querySelector("#audio");
const playButton = document.querySelector("#playButton");
const playIcon = document.querySelector("#playIcon");
const seek = document.querySelector("#seek");
const statusText = document.querySelector("#status");
const timeText = document.querySelector("#time");
const captionsRoot = document.querySelector("#captions");

let captions = [];
let captionEls = [];
let seeking = false;

function formatTime(value) {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function activeIndex(time) {
  return captions.findIndex((item, index) => {
    const next = captions[index + 1];
    return time >= item.start && (!next || time < next.start);
  });
}

function updateCaption() {
  const index = activeIndex(audio.currentTime);
  captionEls.forEach((el, itemIndex) => {
    const active = itemIndex === index;
    el.classList.toggle("active", active);
    if (active) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function updateTime() {
  const duration = audio.duration || 0;
  timeText.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
  if (!seeking && duration > 0) seek.value = Math.round((audio.currentTime / duration) * 1000);
  updateCaption();
}

async function init() {
  const response = await fetch("content.json", { cache: "no-store" });
  const content = await response.json();
  document.title = `${content.title}语音导览`;
  document.querySelector("#title").textContent = content.title;
  document.querySelector("#subtitle").textContent = content.subtitle;
  audio.src = content.audio;
  captions = content.captions;
  captionsRoot.innerHTML = "";
  captionEls = captions.map((item) => {
    const p = document.createElement("p");
    p.className = "caption";
    p.textContent = item.text;
    p.addEventListener("click", () => {
      audio.currentTime = item.start;
      audio.play();
    });
    captionsRoot.appendChild(p);
    return p;
  });
}

playButton.addEventListener("click", () => {
  if (audio.paused) audio.play();
  else audio.pause();
});

audio.addEventListener("play", () => {
  playIcon.textContent = "Ⅱ";
  statusText.textContent = "正在播放";
});

audio.addEventListener("pause", () => {
  playIcon.textContent = "▶";
  statusText.textContent = audio.currentTime ? "已暂停" : "准备播放";
});

audio.addEventListener("ended", () => {
  playIcon.textContent = "▶";
  statusText.textContent = "播放完成";
});

audio.addEventListener("loadedmetadata", updateTime);
audio.addEventListener("timeupdate", updateTime);

seek.addEventListener("input", () => {
  seeking = true;
});

seek.addEventListener("change", () => {
  if (audio.duration > 0) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
  seeking = false;
});

init().catch(() => {
  statusText.textContent = "内容加载失败";
});
