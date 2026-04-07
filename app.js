// @budding
const GITHUB_USERNAME = "teanfall";
const GITHUB_REPO = "4igb";
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@latest`;

const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileList = document.getElementById("fileList");

// 点击上传区域打开文件选择
uploadArea.addEventListener("click", () => fileInput.click());

// 选择文件
uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", handleFileSelect);

// 拖拽上传
uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
});

function handleFileSelect(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    for (let file of files) {
        // 生成唯一的文件ID（时间戳 + 随机数）
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const fileId = `${timestamp}-${random}`;
        
        // 生成链接（使用文件ID和原始文件名）
        const link = `${CDN_BASE}/uploads/${fileId}-${encodeURIComponent(file.name)}`;
        
        // 添加到列表
        addFileToList(file.name, link, fileId);
    }
    
    // 清空输入
    fileInput.value = "";
}

function addFileToList(fileName, link, fileId) {
    // 如果列表是空状态，清空它
    if (fileList.innerHTML.includes("empty-text")) {
        fileList.innerHTML = "";
    }
    
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.dataset.fileId = fileId;
    
    fileItem.innerHTML = `
        <div class="file-name">📄 ${escapeHtml(fileName)}</div>
        <div class="file-link">${link}</div>
        <div class="file-actions">
            <button class="btn-small btn-copy" onclick="copyToClipboard('${escapeHtml(link)}', this)">复制链接</button>
            <button class="btn-small btn-delete" onclick="removeFile('${fileId}')">删除</button>
        </div>
    `;
    
    fileList.insertBefore(fileItem, fileList.firstChild);
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = "✓ 已复制";
        btn.classList.add("copied");
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove("copied");
        }, 2000);
    });
}

function removeFile(fileId) {
    const item = document.querySelector(`[data-file-id="${fileId}"]`);
    if (item) {
        item.remove();
        
        // 如果没有文件了，显示空状态
        if (fileList.children.length === 0) {
            fileList.innerHTML = '<p class="empty-text">还没有文件呢，上传一个吧~</p>';
        }
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 页面加载时恢复已保存的文件列表（从 localStorage）
window.addEventListener("load", () => {
    const savedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
    if (savedFiles.length > 0) {
        fileList.innerHTML = "";
        savedFiles.forEach(file => {
            addFileToList(file.name, file.link, file.id);
        });
    }
});

// 每次更新列表时保存到 localStorage
function saveToLocalStorage() {
    const files = [];
    document.querySelectorAll(".file-item").forEach(item => {
        const nameEl = item.querySelector(".file-name");
        const linkEl = item.querySelector(".file-link");
        files.push({
            id: item.dataset.fileId,
            name: nameEl.textContent.replace("📄 ", ""),
            link: linkEl.textContent
        });
    });
    localStorage.setItem("uploadedFiles", JSON.stringify(files));
}

// 监听列表变化
const observer = new MutationObserver(saveToLocalStorage);
observer.observe(fileList, { childList: true });
