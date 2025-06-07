class SparklePhotoBooth {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.editorCanvas = document.getElementById('editorCanvas');
        this.editorCtx = this.editorCanvas.getContext('2d');
        this.media = JSON.parse(localStorage.getItem('photobooth-media')) || [];
        this.currentStream = null;
        this.currentFacingMode = 'user';
        this.currentEffect = 'none';
        this.currentPhoto = null;
        this.filters = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };
        this.currentFilter = 'none';
        this.currentBackground = 'none';
        this.customBackgroundImage = null;
        this.stickers = [];
        this.selectedSticker = null;
        this.stickerDragging = false;
        this.isCapturing = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.autoCapture = {
            isActive: false,
            currentShot: 0,
            totalShots: 5,
            interval: null
        };
        this.currentView = 'grid';

        // Sticker emojis
        this.availableStickers = [
            '😀', '😂', '😍', '🥰', '😎', '🤩', '🥳', '😇',
            '🔥', '⭐', '💫', '✨', '💖', '💕', '💯', '👑',
            '🎉', '🎊', '🌈', '🦄', '🌟', '💎', '🎈', '🎀',
            '🌺', '🌸', '🌼', '🌻', '🍀', '🦋', '🐱', '🐶',
            '❤️', '💜', '💙', '💚', '💛', '🧡', '🖤', '🤍'
        ];

        this.init();
    }

    async init() {
        this.createReducedSparkles();
        this.createReducedFloatingHearts();
        this.bindEvents();
        await this.initCamera();
        this.renderGallery();
        this.startBackgroundAnimations();
    }

    createReducedSparkles() {
        const sparklesContainer = document.getElementById('sparkles');
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.width = Math.random() * 4 + 2 + 'px';
            sparkle.style.height = sparkle.style.width;
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 6 + 's';
            sparkle.style.animationDuration = (Math.random() * 4 + 6) + 's';
            sparklesContainer.appendChild(sparkle);
        }
    }

    createReducedFloatingHearts() {
        const heartsContainer = document.querySelector('.floating-hearts');
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = '💖';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 8 + 's';
            heart.style.animationDuration = (Math.random() * 4 + 8) + 's';
            heartsContainer.appendChild(heart);
        }
    }

    startBackgroundAnimations() {
        setInterval(() => {
            this.createDynamicSparkle();
        }, 500);

        setInterval(() => {
            this.createDynamicHeart();
        }, 6000);
    }

    createDynamicSparkle() {
        const sparklesContainer = document.getElementById('sparkles');
        if (sparklesContainer.children.length > 15) return;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.width = Math.random() * 4 + 2 + 'px';
        sparkle.style.height = sparkle.style.width;
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        sparklesContainer.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 6000);
    }

    createDynamicHeart() {
        const heartsContainer = document.querySelector('.floating-hearts');
        if (heartsContainer.children.length > 8) return;

        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = Math.random() > 0.5 ? '💖' : '💕';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 4 + 8) + 's';
        heartsContainer.appendChild(heart);

        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 8000);
    }

    bindEvents() {
        // Camera controls
        document.getElementById('captureBtn').addEventListener('click', () => this.capturePhoto());
        document.getElementById('switchCamera').addEventListener('click', () => this.switchCamera());
        document.getElementById('effectsToggle').addEventListener('click', () => this.toggleEffects());
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('autoCaptureBtn').addEventListener('click', () => this.startAutoCapture());

        // Effects
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyEffect(e.target.closest('.effect-btn').dataset.effect));
        });

        // Gallery view controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeView(e.target.closest('.view-btn').dataset.view));
        });

        // Gallery
        document.getElementById('clearGallery').addEventListener('click', () => this.clearGallery());

        // Video modal
        document.getElementById('closeVideoModal').addEventListener('click', () => this.closeVideoModal());
        document.getElementById('downloadVideo').addEventListener('click', () => this.downloadCurrentVideo());

        // Initialize editor controls after a delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeEditorControls();
        }, 500);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !document.querySelector('.modal.active')) {
                e.preventDefault();
                this.capturePhoto();
            } else if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.toggleRecording();
            } else if (e.code === 'Escape') {
                this.closeEditor();
                this.closeVideoModal();
                this.hidePhotoPreview();
            }
        });
    }

    initializeEditorControls() {
        // Editor buttons
        const closeEditor = document.getElementById('closeEditor');
        const resetEditor = document.getElementById('resetEditor');
        const saveEdit = document.getElementById('saveEdit');
        const downloadEdit = document.getElementById('downloadEdit');

        if (closeEditor) closeEditor.addEventListener('click', () => this.closeEditor());
        if (resetEditor) resetEditor.addEventListener('click', () => this.resetEditor());
        if (saveEdit) saveEdit.addEventListener('click', () => this.saveEdit());
        if (downloadEdit) downloadEdit.addEventListener('click', () => this.downloadEdit());

        // Initialize sticker panel and canvas interaction
        this.initStickerPanel();
        this.initCanvasInteraction();

        // Filters - Fixed event binding
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.closest('.filter-btn').dataset.filter;
                if (filter) {
                    this.applyFilter(filter);
                }
            });
        });

        // Backgrounds - Fixed event binding with proper delegation
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bg = e.target.closest('.bg-btn').dataset.bg;
                if (bg) {
                    console.log('Background button clicked:', bg); // Debug log
                    this.applyBackground(bg);
                }
            });
        });

        // Custom background upload - Fixed
        const customBg = document.getElementById('customBg');
        if (customBg) {
            customBg.addEventListener('change', (e) => this.loadCustomBackground(e));
        }

        // Adjustment sliders - Fixed
        ['brightness', 'contrast', 'saturation'].forEach(adjustment => {
            const slider = document.getElementById(adjustment);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.filters[adjustment] = parseFloat(e.target.value);
                    this.applyAdjustments();
                });
            }
        });

        // Keyboard shortcuts for editor
        document.addEventListener('keydown', (e) => {
            const editorModal = document.getElementById('editorModal');
            if (editorModal && editorModal.classList.contains('active')) {
                if (e.code === 'Delete' && this.selectedSticker) {
                    e.preventDefault();
                    this.deleteSticker(this.selectedSticker);
                }
            }
        });
    }

    async initCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            };

            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.currentStream;
            this.video.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showToast('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.', 'error');
        }
    }

    async switchCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }

        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        await this.initCamera();
        this.showToast(`Đã chuyển sang camera ${this.currentFacingMode === 'user' ? 'trước' : 'sau'}!`);
    }

    toggleEffects() {
        const panel = document.getElementById('effectsPanel');
        panel.classList.toggle('active');
    }

    applyEffect(effect) {
        this.currentEffect = effect;
        this.video.className = effect === 'none' ? '' : effect;

        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-effect="${effect}"]`).classList.add('active');
    }

    // Auto Capture Functions
    startAutoCapture() {
        if (this.autoCapture.isActive) return;

        const photoCount = parseInt(document.getElementById('photoCount').value);
        this.autoCapture.totalShots = photoCount;
        this.autoCapture.currentShot = 0;
        this.autoCapture.isActive = true;

        const progressIndicator = document.getElementById('autoCaptureProgress');
        progressIndicator.classList.add('active');

        this.updateAutoCaptureProgress();
        this.captureNextPhoto();
    }

    captureNextPhoto() {
        if (!this.autoCapture.isActive) return;

        this.autoCapture.currentShot++;
        this.updateAutoCaptureProgress();

        this.capturePhoto().then(() => {
            if (this.autoCapture.currentShot < this.autoCapture.totalShots) {
                setTimeout(() => {
                    this.captureNextPhoto();
                }, 2000);
            } else {
                this.stopAutoCapture();
                this.showToast(`Đã chụp xong ${this.autoCapture.totalShots} ảnh! 📸`);
            }
        });
    }

    updateAutoCaptureProgress() {
        const progressIndicator = document.getElementById('autoCaptureProgress');
        const currentShot = progressIndicator.querySelector('.current-shot');
        const totalShots = progressIndicator.querySelector('.total-shots');
        const progressFill = progressIndicator.querySelector('.progress-fill');

        currentShot.textContent = this.autoCapture.currentShot;
        totalShots.textContent = this.autoCapture.totalShots;

        const progress = (this.autoCapture.currentShot / this.autoCapture.totalShots) * 100;
        progressFill.style.width = progress + '%';
    }

    stopAutoCapture() {
        this.autoCapture.isActive = false;
        this.autoCapture.currentShot = 0;

        const progressIndicator = document.getElementById('autoCaptureProgress');
        progressIndicator.classList.remove('active');

        if (this.autoCapture.interval) {
            clearInterval(this.autoCapture.interval);
            this.autoCapture.interval = null;
        }
    }

    // Video Recording Functions
    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        if (!this.currentStream) {
            this.showToast('Camera chưa sẵn sàng!', 'error');
            return;
        }

        try {
            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(this.currentStream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();

            const recordBtn = document.getElementById('recordBtn');
            const recordIndicator = document.getElementById('recordingIndicator');

            recordBtn.innerHTML = `
                <div class="btn-content">
                    <i class="fas fa-stop"></i>
                    <span>Dừng Quay</span>
                </div>
            `;
            recordBtn.style.background = 'linear-gradient(135deg, #e17055 0%, #d63031 100%)';

            recordIndicator.classList.add('active');
            this.startRecordingTimer();

            this.showToast('Bắt đầu quay video! 🎬');

        } catch (error) {
            console.error('Error starting recording:', error);
            this.showToast('Lỗi khi bắt đầu quay video!', 'error');
        }
    }

    stopRecording() {
        if (!this.mediaRecorder || !this.isRecording) return;

        this.mediaRecorder.stop();
        this.isRecording = false;

        const recordBtn = document.getElementById('recordBtn');
        const recordIndicator = document.getElementById('recordingIndicator');

        recordBtn.innerHTML = `
            <div class="btn-content">
                <i class="fas fa-video"></i>
                <span>Quay Video</span>
            </div>
        `;
        recordBtn.style.background = 'linear-gradient(135deg, #e17055 0%, #d63031 100%)';

        recordIndicator.classList.remove('active');
        this.stopRecordingTimer();

        this.showToast('Đã dừng quay video! 🎬');
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            if (this.recordingStartTime) {
                const elapsed = Date.now() - this.recordingStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);

                const timeDisplay = document.getElementById('recordingTime');
                timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
        this.recordingStartTime = null;
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const video = {
            id: Date.now(),
            type: 'video',
            data: url,
            blob: blob,
            timestamp: new Date().toISOString(),
            effect: this.currentEffect,
            duration: this.calculateRecordingDuration()
        };

        this.media.push(video);
        this.saveMedia();
        this.renderGallery();

        this.showToast('Video đã được lưu! 🎥');
    }

    calculateRecordingDuration() {
        if (!this.recordingStartTime) return 0;
        return Math.floor((Date.now() - this.recordingStartTime) / 1000);
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async capturePhoto() {
        if (this.isCapturing) return;

        this.isCapturing = true;
        const countdown = document.getElementById('countdown');
        const flash = document.getElementById('captureFlash');

        try {
            for (let i = 3; i > 0; i--) {
                countdown.textContent = i;
                countdown.classList.add('show');

                await this.sleep(1000);
                countdown.classList.remove('show');
                await this.sleep(100);
            }

            flash.classList.add('active');

            setTimeout(() => {
                this.performCapture();
                flash.classList.remove('active');
            }, 200);

        } catch (error) {
            console.error('Error during capture:', error);
            this.showToast('Lỗi khi chụp ảnh!', 'error');
        } finally {
            this.isCapturing = false;
        }
    }

    performCapture() {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        this.ctx.filter = this.getFilterString();
        this.ctx.drawImage(this.video, 0, 0);
        this.ctx.filter = 'none';

        const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
        const photo = {
            id: Date.now(),
            type: 'photo',
            data: imageData,
            timestamp: new Date().toISOString(),
            effect: this.currentEffect
        };

        this.media.push(photo);
        this.saveMedia();

        if (!this.autoCapture.isActive) {
            this.showPhotoPreview(imageData);

            setTimeout(() => {
                this.hidePhotoPreview();
                this.createFlyingPhoto(imageData);
                this.renderGallery();
            }, 2000);
        } else {
            this.createFlyingPhoto(imageData);
            this.renderGallery();
        }
    }

    showPhotoPreview(imageData) {
        const modal = document.getElementById('photoPreviewModal') || this.createPhotoPreviewModal();
        const img = modal.querySelector('.preview-image');
        img.src = imageData;

        modal.classList.add('active');
    }

    createPhotoPreviewModal() {
        const modal = document.createElement('div');
        modal.id = 'photoPreviewModal';
        modal.className = 'photo-preview-modal';
        modal.innerHTML = `
            <div class="preview-content">
                <div class="preview-frame">
                    <img class="preview-image" alt="Ảnh vừa chụp">
                </div>
                <div class="preview-text">✨ Tuyệt vời! Ảnh thật đẹp! ✨</div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hidePhotoPreview();
            }
        });

        return modal;
    }

    hidePhotoPreview() {
        const modal = document.getElementById('photoPreviewModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    createFlyingPhoto(imageData) {
        const flyingContainer = document.getElementById('flyingPhotoContainer');
        const flyingPhoto = document.createElement('div');
        flyingPhoto.className = 'flying-photo';
        flyingPhoto.style.backgroundImage = `url(${imageData})`;

        const cameraRect = document.querySelector('.camera-frame').getBoundingClientRect();
        const galleryRect = document.querySelector('.gallery-grid').getBoundingClientRect();

        flyingPhoto.style.left = cameraRect.left + cameraRect.width / 2 - 60 + 'px';
        flyingPhoto.style.top = cameraRect.top + cameraRect.height / 2 - 40 + 'px';

        flyingContainer.appendChild(flyingPhoto);

        setTimeout(() => {
            const targetX = galleryRect.left + Math.random() * (galleryRect.width - 120);
            const targetY = galleryRect.top + Math.random() * 100;

            flyingPhoto.style.left = targetX + 'px';
            flyingPhoto.style.top = targetY + 'px';
        }, 100);

        setTimeout(() => {
            if (flyingPhoto.parentNode) {
                flyingPhoto.parentNode.removeChild(flyingPhoto);
            }
        }, 2000);
    }

    getFilterString() {
        switch (this.currentEffect) {
            case 'vintage':
                return 'sepia(0.8) contrast(1.2) brightness(1.1) saturate(0.8)';
            case 'bw':
                return 'grayscale(1) contrast(1.1)';
            case 'sepia':
                return 'sepia(1) contrast(1.1) brightness(1.1)';
            case 'neon':
                return 'saturate(2) brightness(1.3) contrast(1.5) hue-rotate(90deg)';
            case 'rainbow':
                return 'saturate(2) brightness(1.2) contrast(1.3)';
            default:
                return 'none';
        }
    }

    // Gallery Functions
    changeView(view) {
        this.currentView = view;

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        const galleryGrid = document.getElementById('galleryGrid');
        galleryGrid.className = 'gallery-grid';
        if (view !== 'grid') {
            galleryGrid.classList.add(`${view}-view`);
        }

        this.showToast(`Đã chuyển sang chế độ xem ${view === 'grid' ? 'lưới' : view === 'list' ? 'danh sách' : 'gạch'}!`);
    }

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        const mediaCount = document.querySelector('.media-count');

        if (mediaCount) {
            const photoCount = this.media.filter(m => m.type === 'photo').length;
            const videoCount = this.media.filter(m => m.type === 'video').length;
            mediaCount.textContent = `${photoCount} ảnh, ${videoCount} video`;
        }

        if (this.media.length === 0) {
            grid.innerHTML = `
                <div class="empty-gallery">
                    <div class="empty-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                    <p>Chưa có ảnh hoặc video nào.<br>Hãy chụp ảnh hoặc quay video đầu tiên!</p>
                    <div class="empty-arrow">👆</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.media.slice().reverse().map(item => {
            const isVideo = item.type === 'video';
            const mediaElement = isVideo
                ? `<video src="${item.data}" muted></video>`
                : `<img src="${item.data}" alt="Media item" loading="lazy">`;

            const typeIndicator = isVideo
                ? `<div class="media-type-indicator">📹 VIDEO</div>`
                : `<div class="media-type-indicator">📷 PHOTO</div>`;

            const durationIndicator = isVideo && item.duration
                ? `<div class="video-duration">${this.formatDuration(item.duration)}</div>`
                : '';

            const actions = isVideo
                ? `
                    <button class="btn btn-primary btn-sm" onclick="photoBooth.viewVideo(${item.id})">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="photoBooth.downloadMedia(${item.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="photoBooth.deleteMedia(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `
                : `
                    <button class="btn btn-primary btn-sm" onclick="photoBooth.editPhoto(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="photoBooth.downloadMedia(${item.id})">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="photoBooth.deleteMedia(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

            return `
                <div class="media-item" data-id="${item.id}">
                    ${mediaElement}
                    ${typeIndicator}
                    ${durationIndicator}
                    <div class="media-overlay">
                        ${actions}
                    </div>
                </div>
            `;
        }).join('');
    }

    viewVideo(id) {
        const video = this.media.find(m => m.id === id);
        if (!video || video.type !== 'video') return;

        const modal = document.getElementById('videoModal');
        const videoPreview = document.getElementById('videoPreview');

        videoPreview.src = video.data;
        this.currentVideoForDownload = video;

        modal.classList.add('active');
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const videoPreview = document.getElementById('videoPreview');

        videoPreview.pause();
        videoPreview.src = '';
        modal.classList.remove('active');
        this.currentVideoForDownload = null;
    }

    downloadCurrentVideo() {
        if (!this.currentVideoForDownload) return;

        const link = document.createElement('a');
        link.download = `sparkle-video-${this.currentVideoForDownload.id}.webm`;
        link.href = this.currentVideoForDownload.data;
        link.click();
        this.showToast('Đã tải xuống video! 📥');
    }

    downloadMedia(id) {
        const media = this.media.find(m => m.id === id);
        if (!media) return;

        const link = document.createElement('a');
        const extension = media.type === 'video' ? 'webm' : 'jpg';
        link.download = `sparkle-${media.type}-${id}.${extension}`;
        link.href = media.data;
        link.click();
        this.showToast(`Đã tải xuống ${media.type === 'video' ? 'video' : 'ảnh'}! 📥`);
    }

    deleteMedia(id) {
        const media = this.media.find(m => m.id === id);
        const mediaType = media?.type === 'video' ? 'video' : 'ảnh';

        if (confirm(`Bạn có chắc muốn xóa ${mediaType} này? 🗑️`)) {
            if (media?.type === 'video' && media.data.startsWith('blob:')) {
                URL.revokeObjectURL(media.data);
            }

            this.media = this.media.filter(m => m.id !== id);
            this.saveMedia();
            this.renderGallery();
            this.showToast(`Đã xóa ${mediaType}! 🗑️`);
        }
    }

    clearGallery() {
        if (confirm('Bạn có chắc muốn xóa tất cả ảnh và video? 🗑️')) {
            this.media.forEach(media => {
                if (media.type === 'video' && media.data.startsWith('blob:')) {
                    URL.revokeObjectURL(media.data);
                }
            });

            this.media = [];
            this.saveMedia();
            this.renderGallery();
            this.showToast('Đã xóa tất cả! 🗑️');
        }
    }

    // Editor Functions - FIXED BACKGROUND FUNCTIONALITY
    editPhoto(id) {
        this.currentPhoto = this.media.find(m => m.id === id);
        if (!this.currentPhoto || this.currentPhoto.type !== 'photo') return;

        this.resetFilters();
        this.stickers = [];
        this.selectedSticker = null;
        this.currentFilter = 'none';
        this.currentBackground = 'none';
        this.customBackgroundImage = null;

        this.loadPhotoToEditor();
        document.getElementById('editorModal').classList.add('active');

        // Re-initialize controls when modal opens
        setTimeout(() => {
            this.initializeEditorControls();
        }, 100);
    }

    loadPhotoToEditor() {
        const img = new Image();
        img.onload = () => {
            this.editorCanvas.width = img.width;
            this.editorCanvas.height = img.height;
            this.originalImageData = this.editorCtx.getImageData(0, 0, img.width, img.height);
            this.editorCtx.drawImage(img, 0, 0);
            this.applyCurrentSettings();
        };
        img.src = this.currentPhoto.data;
    }

    initStickerPanel() {
        const editorControls = document.querySelector('.editor-controls');
        if (!editorControls) return;

        let stickerSection = document.querySelector('.sticker-section');
        if (!stickerSection) {
            stickerSection = document.createElement('div');
            stickerSection.className = 'sticker-section';
            stickerSection.innerHTML = `
                <div class="section-header">
                    <h3><i class="fas fa-smile"></i> Sticker</h3>
                </div>
                <div class="sticker-grid"></div>
            `;
            editorControls.insertBefore(stickerSection, editorControls.firstChild);
        }

        const stickerGrid = stickerSection.querySelector('.sticker-grid');
        stickerGrid.innerHTML = this.availableStickers.map(sticker => `
            <button class="sticker-btn" data-sticker="${sticker}">${sticker}</button>
        `).join('');

        stickerGrid.querySelectorAll('.sticker-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sticker = e.target.dataset.sticker;
                this.addSticker(sticker);

                btn.classList.add('active');
                setTimeout(() => btn.classList.remove('active'), 200);
            });
        });
    }

    initCanvasInteraction() {
        const canvas = this.editorCanvas;
        if (!canvas) return;

        // Remove existing listeners
        canvas.removeEventListener('mousedown', this.handleCanvasMouseDown);
        canvas.removeEventListener('mousemove', this.handleCanvasMouseMove);
        canvas.removeEventListener('mouseup', this.handleCanvasMouseUp);
        canvas.removeEventListener('touchstart', this.handleCanvasTouchStart);
        canvas.removeEventListener('touchmove', this.handleCanvasTouchMove);
        canvas.removeEventListener('touchend', this.handleCanvasTouchEnd);

        // Add new listeners
        canvas.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleCanvasMouseUp.bind(this));
        canvas.addEventListener('touchstart', this.handleCanvasTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.handleCanvasTouchMove.bind(this));
        canvas.addEventListener('touchend', this.handleCanvasTouchEnd.bind(this));
    }

    handleCanvasMouseDown(e) {
        const rect = this.editorCanvas.getBoundingClientRect();
        const scaleX = this.editorCanvas.width / rect.width;
        const scaleY = this.editorCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        this.selectStickerAt(x, y);
        if (this.selectedSticker) {
            this.stickerDragging = true;
        }
    }

    handleCanvasMouseMove(e) {
        if (this.stickerDragging && this.selectedSticker) {
            const rect = this.editorCanvas.getBoundingClientRect();
            const scaleX = this.editorCanvas.width / rect.width;
            const scaleY = this.editorCanvas.height / rect.height;

            this.selectedSticker.x = (e.clientX - rect.left) * scaleX;
            this.selectedSticker.y = (e.clientY - rect.top) * scaleY;

            this.redrawCanvas();
        }
    }

    handleCanvasMouseUp(e) {
        this.stickerDragging = false;
    }

    handleCanvasTouchStart(e) {
        e.preventDefault();
        const rect = this.editorCanvas.getBoundingClientRect();
        const scaleX = this.editorCanvas.width / rect.width;
        const scaleY = this.editorCanvas.height / rect.height;
        const x = (e.touches[0].clientX - rect.left) * scaleX;
        const y = (e.touches[0].clientY - rect.top) * scaleY;

        this.selectStickerAt(x, y);
        if (this.selectedSticker) {
            this.stickerDragging = true;
        }
    }

    handleCanvasTouchMove(e) {
        if (this.stickerDragging && this.selectedSticker) {
            e.preventDefault();
            const rect = this.editorCanvas.getBoundingClientRect();
            const scaleX = this.editorCanvas.width / rect.width;
            const scaleY = this.editorCanvas.height / rect.height;

            this.selectedSticker.x = (e.touches[0].clientX - rect.left) * scaleX;
            this.selectedSticker.y = (e.touches[0].clientY - rect.top) * scaleY;

            this.redrawCanvas();
        }
    }

    handleCanvasTouchEnd(e) {
        this.stickerDragging = false;
    }

    addSticker(emoji) {
        if (!this.currentPhoto) return;

        const sticker = {
            id: Date.now(),
            emoji: emoji,
            x: this.editorCanvas.width / 2,
            y: this.editorCanvas.height / 2,
            size: 60,
            rotation: 0
        };

        this.stickers.push(sticker);
        this.selectedSticker = sticker;
        this.redrawCanvas();
        this.showToast(`Đã thêm sticker ${emoji}!`);
    }

    selectStickerAt(x, y) {
        this.selectedSticker = null;

        for (let i = this.stickers.length - 1; i >= 0; i--) {
            const sticker = this.stickers[i];
            const distance = Math.sqrt(
                Math.pow(x - sticker.x, 2) + Math.pow(y - sticker.y, 2)
            );

            if (distance <= sticker.size / 2) {
                this.selectedSticker = sticker;
                break;
            }
        }

        this.redrawCanvas();
    }

    deleteSticker(sticker) {
        const index = this.stickers.indexOf(sticker);
        if (index > -1) {
            this.stickers.splice(index, 1);
            this.selectedSticker = null;
            this.redrawCanvas();
            this.showToast('Đã xóa sticker!');
        }
    }

    redrawCanvas() {
        if (!this.currentPhoto) return;

        const img = new Image();
        img.onload = () => {
            // Clear canvas
            this.editorCtx.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);

            // Apply background FIRST
            this.applyBackgroundToCanvas();

            // Apply filters and draw image
            const filterString = this.buildFilterString();
            this.editorCtx.filter = filterString;
            this.editorCtx.drawImage(img, 0, 0);
            this.editorCtx.filter = 'none';

            // Draw stickers on top
            this.drawStickers();
        };
        img.src = this.currentPhoto.data;
    }

    drawStickers() {
        this.stickers.forEach(sticker => {
            this.editorCtx.save();
            this.editorCtx.translate(sticker.x, sticker.y);
            this.editorCtx.rotate(sticker.rotation * Math.PI / 180);
            this.editorCtx.font = `${sticker.size}px Arial`;
            this.editorCtx.textAlign = 'center';
            this.editorCtx.textBaseline = 'middle';

            if (sticker === this.selectedSticker) {
                this.editorCtx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
                this.editorCtx.lineWidth = 3;
                this.editorCtx.beginPath();
                this.editorCtx.arc(0, 0, sticker.size / 2 + 10, 0, Math.PI * 2);
                this.editorCtx.stroke();
            }

            this.editorCtx.fillText(sticker.emoji, 0, 0);
            this.editorCtx.restore();
        });
    }

    closeEditor() {
        const modal = document.getElementById('editorModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentPhoto = null;
        this.stickers = [];
        this.selectedSticker = null;
        this.currentFilter = 'none';
        this.currentBackground = 'none';
        this.customBackgroundImage = null;
    }

    resetEditor() {
        this.resetFilters();
        this.currentFilter = 'none';
        this.currentBackground = 'none';
        this.customBackgroundImage = null;
        this.stickers = [];
        this.selectedSticker = null;
        this.updateActiveButtons();
        this.loadPhotoToEditor();
        this.showToast('Đã reset tất cả!');
    }

    resetFilters() {
        this.filters = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };

        Object.keys(this.filters).forEach(key => {
            const slider = document.getElementById(key);
            if (slider) {
                slider.value = this.filters[key];
            }
        });
    }

    applyFilter(filter) {
        console.log('Applying filter:', filter); // Debug log
        this.currentFilter = filter;
        this.updateActiveButtons();
        this.applyCurrentSettings();
        this.showToast(`Đã áp dụng filter ${filter}!`);
    }

    // FIXED BACKGROUND APPLICATION
    applyBackground(bg) {
        console.log('Applying background:', bg); // Debug log
        this.currentBackground = bg;
        this.updateActiveButtons();
        this.applyCurrentSettings();
        this.showToast(`Đã áp dụng nền ${bg}!`);
    }

    updateActiveButtons() {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeFilter = document.querySelector(`[data-filter="${this.currentFilter}"]`);
        if (activeFilter) activeFilter.classList.add('active');

        // Update background buttons
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBg = document.querySelector(`[data-bg="${this.currentBackground}"]`);
        if (activeBg) activeBg.classList.add('active');
    }

    applyAdjustments() {
        this.applyCurrentSettings();
    }

    applyCurrentSettings() {
        if (!this.currentPhoto) return;
        this.redrawCanvas();
    }

    // FIXED BACKGROUND DRAWING
    applyBackgroundToCanvas() {
        if (this.currentBackground === 'none') return;

        const canvas = this.editorCanvas;
        const ctx = this.editorCtx;

        console.log('Drawing background:', this.currentBackground); // Debug log

        switch (this.currentBackground) {
            case 'galaxy':
                this.drawGalaxyBackground();
                break;
            case 'aurora':
                this.drawAuroraBackground();
                break;
            case 'sunset':
                this.drawSunsetBackground();
                break;
            case 'ocean':
                this.drawOceanBackground();
                break;
            case 'forest':
                this.drawForestBackground();
                break;
            case 'custom':
                if (this.customBackgroundImage) {
                    ctx.drawImage(this.customBackgroundImage, 0, 0, canvas.width, canvas.height);
                }
                break;
        }
    }

    drawGalaxyBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(0.3, '#330066');
        gradient.addColorStop(0.6, '#4d0099');
        gradient.addColorStop(1, '#0c0c0c');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add stars
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 1.5 + 0.5;
            const alpha = Math.random() * 0.8 + 0.2;

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawAuroraBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        ctx.fillStyle = '#001122';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const colors = ['#00ff41', '#0066ff', '#ff00ff', '#ffff00'];
        for (let i = 0; i < 4; i++) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, colors[i] + '00');
            gradient.addColorStop(0.3, colors[i] + '60');
            gradient.addColorStop(0.7, colors[i] + '30');
            gradient.addColorStop(1, colors[i] + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();

            const waveHeight = canvas.height * 0.6;
            const frequency = 0.01;
            const amplitude = 40;

            ctx.moveTo(0, waveHeight + Math.sin(i * 2) * amplitude);
            for (let x = 0; x <= canvas.width; x += 10) {
                const y = waveHeight + Math.sin(x * frequency + i) * amplitude;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawSunsetBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(0.3, '#f7931e');
        gradient.addColorStop(0.6, '#ffd23f');
        gradient.addColorStop(1, '#ff8e8e');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawOceanBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#4fc3f7');
        gradient.addColorStop(1, '#0077be');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawForestBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#a5d6a7');
        gradient.addColorStop(0.5, '#66bb6a');
        gradient.addColorStop(1, '#2e7d32');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    buildFilterString() {
        let filterString = '';

        switch (this.currentFilter) {
            case 'vintage':
                filterString += 'sepia(0.8) contrast(1.2) brightness(1.1) saturate(0.8) ';
                break;
            case 'bw':
                filterString += 'grayscale(1) contrast(1.1) ';
                break;
            case 'sepia':
                filterString += 'sepia(1) contrast(1.1) brightness(1.1) ';
                break;
            case 'cool':
                filterString += 'hue-rotate(180deg) saturate(1.2) ';
                break;
            case 'warm':
                filterString += 'hue-rotate(30deg) saturate(1.1) ';
                break;
            case 'dramatic':
                filterString += 'contrast(1.5) brightness(0.9) ';
                break;
            case 'dream':
                filterString += 'blur(1px) brightness(1.1) saturate(1.2) ';
                break;
        }

        if (this.filters.brightness !== 0) {
            filterString += `brightness(${1 + this.filters.brightness / 100}) `;
        }
        if (this.filters.contrast !== 0) {
            filterString += `contrast(${1 + this.filters.contrast / 100}) `;
        }
        if (this.filters.saturation !== 0) {
            filterString += `saturate(${1 + this.filters.saturation / 100}) `;
        }

        return filterString.trim() || 'none';
    }

    // FIXED CUSTOM BACKGROUND LOADING
    loadCustomBackground(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Vui lòng chọn file ảnh!', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('File quá lớn! Vui lòng chọn ảnh dưới 5MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.customBackgroundImage = img;
                this.currentBackground = 'custom';
                this.updateActiveButtons();
                this.applyCurrentSettings();
                this.showToast('Đã tải nền tùy chỉnh!');
            };
            img.onerror = () => {
                this.showToast('Lỗi khi tải ảnh!', 'error');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            this.showToast('Lỗi khi đọc file!', 'error');
        };
        reader.readAsDataURL(file);
    }

    async saveEdit() {
        this.showLoading();

        await this.sleep(500);

        const editedImageData = this.editorCanvas.toDataURL('image/jpeg', 0.9);

        this.currentPhoto.data = editedImageData;
        this.currentPhoto.timestamp = new Date().toISOString();

        this.saveMedia();
        this.renderGallery();
        this.closeEditor();
        this.hideLoading();
        this.showToast('Đã lưu ảnh thành công! ✨');
    }

    downloadEdit() {
        const link = document.createElement('a');
        link.download = `sparkle-photo-edited-${Date.now()}.jpg`;
        link.href = this.editorCanvas.toDataURL('image/jpeg', 0.9);
        link.click();
        this.showToast('Đã tải xuống ảnh! 📥');
    }

    saveMedia() {
        try {
            const mediaToSave = this.media.map(item => {
                if (item.type === 'video') {
                    return {
                        ...item,
                        data: null,
                        note: 'Video data not persisted'
                    };
                }
                return item;
            });

            localStorage.setItem('photobooth-media', JSON.stringify(mediaToSave));
        } catch (error) {
            console.error('Error saving media:', error);
            this.showToast('Lỗi khi lưu! Có thể bộ nhớ đã đầy.', 'error');
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('active');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('active');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const messageEl = toast.querySelector('.toast-message');
        const iconEl = toast.querySelector('.toast-icon i');

        if (messageEl) messageEl.textContent = message;

        if (iconEl) {
            if (type === 'error') {
                iconEl.className = 'fas fa-exclamation-triangle';
                toast.style.background = 'linear-gradient(135deg, #e17055 0%, #d63031 100%)';
            } else {
                iconEl.className = 'fas fa-magic';
                toast.style.background = 'linear-gradient(135deg, #00b894 0%, #00a085 100%)';
            }
        }

        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cleanup() {
        if (this.autoCapture.isActive) {
            this.stopAutoCapture();
        }

        if (this.isRecording) {
            this.stopRecording();
        }

        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }

        this.media.forEach(media => {
            if (media.type === 'video' && media.data && media.data.startsWith('blob:')) {
                URL.revokeObjectURL(media.data);
            }
        });
    }
}

// Initialize the PhotoBooth when page loads
let photoBooth;
document.addEventListener('DOMContentLoaded', () => {
    photoBooth = new SparklePhotoBooth();
});

// Handle page visibility for camera optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden && photoBooth && photoBooth.currentStream) {
        photoBooth.video.pause();
    } else if (!document.hidden && photoBooth && photoBooth.video) {
        photoBooth.video.play();
    }
});

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (photoBooth) {
            photoBooth.renderGallery();
        }
    }, 500);
});

// Handle resize
window.addEventListener('resize', () => {
    if (photoBooth && photoBooth.currentPhoto) {
        photoBooth.redrawCanvas();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (photoBooth) {
        photoBooth.cleanup();
    }
});

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
});

function showInstallPromotion() {
    if (!document.getElementById('installBtn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'installBtn';
        installBtn.className = 'install-btn';
        installBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Cài Đặt App</span>
        `;
        installBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
        `;

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
                installBtn.remove();
            }
        });

        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'translateY(-2px) scale(1.05)';
        });

        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'translateY(0) scale(1)';
        });

        document.body.appendChild(installBtn);

        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.style.opacity = '0';
                setTimeout(() => installBtn.remove(), 300);
            }
        }, 8000);
    }
}

// Export for potential module use
window.photoBooth = photoBooth;

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

// Memory management for mobile devices
if ('memory' in performance) {
    setInterval(() => {
        const memInfo = performance.memory;
        const usedMemory = memInfo.usedJSHeapSize / 1048576; // MB

        if (usedMemory > 50 && photoBooth) {
            console.warn('High memory usage detected:', usedMemory.toFixed(2), 'MB');

            photoBooth.media.forEach((media, index) => {
                if (media.type === 'video' && media.data && media.data.startsWith('blob:')) {
                    const videoIndex = photoBooth.media.filter(m => m.type === 'video').indexOf(media);
                    if (videoIndex > 4) {
                        URL.revokeObjectURL(media.data);
                        media.data = null;
                    }
                }
            });
        }
    }, 30000);
}