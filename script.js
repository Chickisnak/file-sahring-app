const baseURL = "http://localhost:3000";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const maxAllowedSize = 100 * 1024 * 1024; // 100mb

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = "";
    return;
  }
  uploadFile();
});

copyURLBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
  fileURL.select();
});

const uploadFile = () => {
  progressContainer.style.display = "block";

  const formData = new FormData();
  formData.append("myfile", fileInput.files[0]);

  axios.post(uploadURL, formData, {
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((100 * progressEvent.loaded) / progressEvent.total);
      progressPercent.innerText = percent;
      const scaleX = `scaleX(${percent / 100})`;
      bgProgress.style.transform = scaleX;
      progressBar.style.transform = scaleX;
    },
  })
  .then((response) => {
    onFileUploadSuccess(response.data);
  })
  .catch((error) => {
    showToast(`Error in upload: ${error.message}`);
    fileInput.value = "";
  });
};

const onFileUploadSuccess = (data) => {
  fileInput.value = "";
  status.innerText = "Uploaded";
  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";
  progressContainer.style.display = "none";

  const { file: url } = data;
  sharingContainer.style.display = "block";
  fileURL.value = url;
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();

  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending";

  const url = fileURL.value;
  const productId = url.split('/')[9];
  const formData = {
    public_id: `${productId}`,
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  axios.post(emailURL, formData)
    .then((response) => {
      if (response.data.success) {
        showToast("Email Sent");
        sharingContainer.style.display = "none";
      }
    })
    .catch((error) => {
      showToast(`Error sending email: ${error.message}`);
    });
});

let toastTimer;
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};
