const tabs = Array.from(document.querySelectorAll("[data-tab]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const previousButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const slideNumber = document.getElementById("slideNumber");
const progressBar = document.getElementById("progressBar");
const roadDialog = document.getElementById("roadDialog");
const roadOpenButtons = Array.from(document.querySelectorAll("[data-road-open]"));
const roadCloseButtons = Array.from(document.querySelectorAll("[data-road-close]"));
const roadDetails = Array.from(document.querySelectorAll("[data-road-detail]"));
const zaloQrInput = document.getElementById("zaloQrInput");
const zaloQrImage = document.getElementById("zaloQrImage");
const zaloQrPlaceholder = document.getElementById("zaloQrPlaceholder");
const zaloQrStatus = document.getElementById("zaloQrStatus");
const zaloQrButton = document.getElementById("zaloQrButton");
const zaloQrStorageKey = "cfl-zalo-qr-image";

let activeIndex = 0;
let lastRoadTrigger = null;

function setActivePanel(index, moveFocus = false) {
  activeIndex = (index + tabs.length) % tabs.length;
  const activeTab = tabs[activeIndex];
  const activeId = activeTab.dataset.tab;

  document.body.dataset.theme = activeId;

  tabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === activeIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === activeId;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  const current = String(activeIndex + 1).padStart(2, "0");
  const total = String(tabs.length).padStart(2, "0");
  slideNumber.textContent = `${current} / ${total}`;
  progressBar.style.width = `${((activeIndex + 1) / tabs.length) * 100}%`;

  if (moveFocus) activeTab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setActivePanel(index));
  tab.addEventListener("keydown", (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      setActivePanel(0, true);
    }
    if (event.key === "End") {
      event.preventDefault();
      setActivePanel(tabs.length - 1, true);
    }
  });
});

previousButton.addEventListener("click", () => setActivePanel(activeIndex - 1));
nextButton.addEventListener("click", () => setActivePanel(activeIndex + 1));

function openRoadDialog(level, trigger) {
  lastRoadTrigger = trigger;
  roadDetails.forEach((detail) => {
    detail.hidden = detail.dataset.roadDetail !== level;
  });
  roadDialog.setAttribute("aria-label", `Danh mục lớp Road to VSTEP ${level.toUpperCase()}`);
  roadDialog.hidden = false;
  document.body.classList.add("dialog-open");
  roadDialog.querySelector(".road-dialog-close").focus();
}

function closeRoadDialog() {
  roadDialog.hidden = true;
  document.body.classList.remove("dialog-open");
  if (lastRoadTrigger) lastRoadTrigger.focus();
}

roadOpenButtons.forEach((button) => {
  button.addEventListener("click", () => openRoadDialog(button.dataset.roadOpen, button));
});

roadCloseButtons.forEach((button) => {
  button.addEventListener("click", closeRoadDialog);
});

function showZaloQr(imageSource) {
  zaloQrImage.src = imageSource;
  zaloQrImage.hidden = false;
  zaloQrPlaceholder.hidden = true;
  zaloQrButton.setAttribute("aria-label", "Thay mã QR Zalo");
  zaloQrStatus.textContent = "Mã QR đã sẵn sàng để quét.";
}

function openZaloQrPicker() {
  zaloQrInput.click();
}

if (zaloQrInput && zaloQrImage && zaloQrPlaceholder && zaloQrStatus && zaloQrButton) {
  try {
    const savedZaloQr = localStorage.getItem(zaloQrStorageKey);
    if (savedZaloQr) showZaloQr(savedZaloQr);
  } catch (error) {
    // Trang vẫn hoạt động bình thường khi trình duyệt chặn localStorage.
  }

  zaloQrButton.addEventListener("click", openZaloQrPicker);

  zaloQrInput.addEventListener("change", () => {
    const selectedFile = zaloQrInput.files && zaloQrInput.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      zaloQrStatus.textContent = "Vui lòng chọn tệp ảnh PNG, JPG hoặc WebP.";
      zaloQrInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageSource = String(reader.result || "");
      if (!imageSource) return;

      showZaloQr(imageSource);
      try {
        localStorage.setItem(zaloQrStorageKey, imageSource);
      } catch (error) {
        zaloQrStatus.textContent = "Mã QR đã cập nhật cho lần mở trang hiện tại.";
      }
      zaloQrInput.value = "";
    });
    reader.readAsDataURL(selectedFile);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !roadDialog.hidden) {
    event.preventDefault();
    closeRoadDialog();
    return;
  }

  if (!roadDialog.hidden) return;

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    setActivePanel(activeIndex - 1);
  }

  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    setActivePanel(activeIndex + 1);
  }
});

setActivePanel(0);
