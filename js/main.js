document.addEventListener("DOMContentLoaded", () => {
  let selectedMedia = []

  // Cache DOM elements
  const elements = {
    title: document.getElementById("title"),
    description: document.getElementById("description"),
    fileInput: document.getElementById("fileInput"),
    uploadArea: document.getElementById("uploadArea"),
    selectMediaBtn: document.getElementById("selectMediaBtn"),
    mediaPreviewContainer: document.getElementById("mediaPreviewContainer"),
    mediaCount: document.getElementById("mediaCount"),
    postForm: document.getElementById("postForm"),
    richTextButtons: document.querySelectorAll(".rich-text-toolbar button"),
  }

  // Rich text editor functionality
  elements.richTextButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.dataset.command
      document.execCommand(command, false, null)
      this.classList.toggle("active")
      elements.description.focus()
    })
  })

  // Description placeholder functionality
  elements.description.addEventListener("focus", function () {
    if (this.textContent.trim() === "") {
      this.classList.remove("text-muted")
    }
  })

  elements.description.addEventListener("blur", function () {
    if (this.textContent.trim() === "") {
      this.classList.add("text-muted")
    }
  })

  // File input handler
  elements.fileInput.addEventListener("change", function () {
    handleFiles(this.files)
  })

  // Upload area click handlers
  elements.selectMediaBtn.addEventListener("click", (e) => {
    e.preventDefault()
    elements.fileInput.click()
  })

  elements.uploadArea.addEventListener("click", (e) => {
    e.preventDefault()
    elements.fileInput.click()
  })

  // Drag and drop functionality
  elements.uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault()
    this.classList.add("dragover")
  })

  elements.uploadArea.addEventListener("dragleave", function (e) {
    e.preventDefault()
    this.classList.remove("dragover")
  })

  elements.uploadArea.addEventListener("drop", function (e) {
    e.preventDefault()
    this.classList.remove("dragover")
    handleFiles(e.dataTransfer.files)
  })

  // Handle file processing
  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        processFile(file)
      } else {
        showAlert(`نوع فایل پشتیبانی نمی‌شود: ${file.name}`, "warning")
      }
    })
  }

  function processFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const mediaData = {
        id: Date.now() + Math.random(),
        file: file,
        src: e.target.result,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "video",
        size: file.size,
        duration: null,
      }

      if (mediaData.type === "video") {
        getVideoDuration(mediaData)
      } else {
        selectedMedia.push(mediaData)
        renderMediaPreviews()
      }
    }
    reader.readAsDataURL(file)
  }

  function getVideoDuration(mediaData) {
    const video = document.createElement("video")
    video.src = mediaData.src
    video.onloadedmetadata = () => {
      mediaData.duration = video.duration
      selectedMedia.push(mediaData)
      renderMediaPreviews()
    }
  }

  // Utility functions
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  function showAlert(message, type = "info") {
    alert(message) // You can replace this with a custom notification system
  }

  // Render media previews
  function renderMediaPreviews() {
    elements.mediaPreviewContainer.innerHTML = ""

    if (selectedMedia.length > 0) {
      elements.mediaPreviewContainer.style.display = "grid"
      elements.uploadArea.style.display = "none"

      selectedMedia.forEach((media) => {
        const previewElement = createMediaPreview(media)
        elements.mediaPreviewContainer.appendChild(previewElement)
      })

      // Add "Add More" button
      const addMoreButton = createAddMoreButton()
      elements.mediaPreviewContainer.appendChild(addMoreButton)

      updateMediaCount()
    } else {
      elements.mediaPreviewContainer.style.display = "none"
      elements.uploadArea.style.display = "block"
      elements.mediaCount.style.display = "none"
    }
  }

  function createMediaPreview(media) {
    const previewDiv = document.createElement("div")
    previewDiv.className = "media-preview"
    previewDiv.dataset.id = media.id

    if (media.type === "image") {
      previewDiv.innerHTML = `
                <img src="${media.src}" alt="${media.name}">
                <div class="media-type-badge">IMG</div>
                <button type="button" class="remove-media" data-id="${media.id}">
                    <i class="fas fa-times"></i>
                </button>
            `
    } else {
      const duration = media.duration ? formatDuration(media.duration) : ""
      previewDiv.innerHTML = `
                <video src="${media.src}" muted preload="metadata"></video>
                <div class="media-type-badge">VIDEO</div>
                ${duration ? `<div class="video-duration">${duration}</div>` : ""}
                <button type="button" class="video-overlay" data-id="${media.id}">
                    <i class="fas fa-play"></i>
                </button>
                <div class="video-controls">
                    <button type="button" class="video-control-btn play-pause" data-id="${media.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button type="button" class="video-control-btn mute-unmute" data-id="${media.id}">
                        <i class="fas fa-volume-mute"></i>
                    </button>
                </div>
                <button type="button" class="remove-media" data-id="${media.id}">
                    <i class="fas fa-times"></i>
                </button>
            `
    }

    return previewDiv
  }

  function createAddMoreButton() {
    const addMoreDiv = document.createElement("div")
    addMoreDiv.className = "media-preview d-flex align-items-center justify-content-center"
    addMoreDiv.style.cssText = "border: 2px dashed #dee2e6; cursor: pointer;"
    addMoreDiv.id = "addMoreBtn"
    addMoreDiv.innerHTML = `
            <div class="text-center">
                <i class="fas fa-plus fa-2x text-muted mb-2"></i>
                <p class="text-muted mb-0 small">بیشتر اضافه کنید</p>
            </div>
        `
    return addMoreDiv
  }

  // Event delegation for dynamic elements
  document.addEventListener("click", (e) => {
    const target = e.target

    // Video play/pause
    if (target.closest(".video-overlay") || target.closest(".play-pause")) {
      handleVideoPlayPause(e)
    }

    // Video mute/unmute
    if (target.closest(".mute-unmute")) {
      handleVideoMute(e)
    }

    // Remove media
    if (target.closest(".remove-media")) {
      handleRemoveMedia(e)
    }

    // Add more media
    if (target.closest("#addMoreBtn")) {
      elements.fileInput.click()
    }
  })

  function handleVideoPlayPause(e) {
    const button = e.target.closest(".video-overlay") || e.target.closest(".play-pause")
    const mediaId = button.dataset.id
    const mediaPreview = document.querySelector(`[data-id="${mediaId}"]`)
    const video = mediaPreview.querySelector("video")
    const overlay = mediaPreview.querySelector(".video-overlay")
    const playPauseIcon = mediaPreview.querySelector(".play-pause i")

    if (video.paused) {
      video.play()
      overlay.classList.add("playing")
      playPauseIcon.className = "fas fa-pause"
    } else {
      video.pause()
      overlay.classList.remove("playing")
      playPauseIcon.className = "fas fa-play"
    }
  }

  function handleVideoMute(e) {
    const button = e.target.closest(".mute-unmute")
    const mediaId = button.dataset.id
    const mediaPreview = document.querySelector(`[data-id="${mediaId}"]`)
    const video = mediaPreview.querySelector("video")
    const muteIcon = button.querySelector("i")

    video.muted = !video.muted
    muteIcon.className = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up"
  }

  function handleRemoveMedia(e) {
    const button = e.target.closest(".remove-media")
    const mediaId = button.dataset.id
    selectedMedia = selectedMedia.filter((media) => media.id != mediaId)
    renderMediaPreviews()
  }

  // Video ended event
  document.addEventListener(
    "ended",
    (e) => {
      if (e.target.tagName === "VIDEO") {
        const mediaPreview = e.target.closest(".media-preview")
        const overlay = mediaPreview.querySelector(".video-overlay")
        const playPauseIcon = mediaPreview.querySelector(".play-pause i")

        overlay.classList.remove("playing")
        playPauseIcon.className = "fas fa-play"
      }
    },
    true,
  )

  function updateMediaCount() {
    const imageCount = selectedMedia.filter((m) => m.type === "image").length
    const videoCount = selectedMedia.filter((m) => m.type === "video").length
    const totalSize = selectedMedia.reduce((sum, m) => sum + m.size, 0)

    let countText = ""
    if (imageCount > 0 && videoCount > 0) {
      countText = `${imageCount} عکس و ${videoCount} ویدیو انتخاب شده است`
    } else if (imageCount > 0) {
      countText = `${imageCount} عکس انتخاب شده است`
    } else if (videoCount > 0) {
      countText = `${videoCount} ویدیو انتخاب شده است`
    }

    countText += ` (${formatFileSize(totalSize)})`
    elements.mediaCount.textContent = countText
    elements.mediaCount.style.display = "block"
  }

  // Form submission
  elements.postForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const title = elements.title.value.trim()
    const description = elements.description.innerHTML.trim()

    if (!title) {
      showAlert("لطفا عنوان را وارد کنید", "error")
      elements.title.focus()
      return
    }

    if (!description || description === elements.description.dataset.placeholder) {
      showAlert("لطفا توضیحات را وارد کنید", "error")
      elements.description.focus()
      return
    }

    // Create FormData
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)

    selectedMedia.forEach((media, index) => {
      formData.append(`media[${index}]`, media.file)
      formData.append(`mediaTypes[${index}]`, media.type)
    })

    // Log form data
    console.log("Form Data:", {
      title: title,
      description: description,
      media: selectedMedia.map((m) => ({
        name: m.file.name,
        type: m.type,
        size: formatFileSize(m.file.size),
        duration: m.duration ? formatDuration(m.duration) : null,
      })),
    })

    showAlert("پست با موفقیت ایجاد شد.")
  })
})
