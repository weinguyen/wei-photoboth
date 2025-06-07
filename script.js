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

        // Enhanced sticker emojis with more variety
        this.availableStickers = [
            '😀', '😂', '😍', '🥰', '😎', '🤩', '🥳', '😇', '🤗', '😘',
            '🔥', '⭐', '💫', '✨', '💖', '💕', '💯', '👑', '🎭', '🎪',
            '🎉', '🎊', '🌈', '🦄', '🌟', '💎', '🎈', '🎀', '🎂', '🍭',
            '🌺', '🌸', '🌼', '🌻', '🍀', '🦋', '🐱', '🐶', '🐰', '🐼',
            '❤️', '💜', '💙', '💚', '💛', '🧡', '🖤', '🤍', '💗', '💝'
        ];

        this.init();
    }

    async init() {
        this.createEnhancedSparkles();
        this.createEnhancedFloatingHearts();
        this.bindEvents();
        await this.initCamera();
        this.renderGallery();
        this.startBackgroundAnimations();
        this.createFloatingSparkles();
    }

    // Enhanced sparkle creation with more variety and pink theme
    createEnhancedSparkles() {
        const sparklesContainer = document.getElementById('sparkles');
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            // Varied sizes for more dynamic effect
            const size = Math.random() * 6 + 3;
            sparkle.style.width = size + 'px';
            sparkle.style.height = size + 'px';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 6 + 's';
            sparkle.style.animationDuration = (Math.random() * 4 + 6) + 's';

            // Add variety in sparkle colors
            if (Math.random() > 0.7) {
                sparkle.style.background = 'radial-gradient(circle, #ff6b9d 0%, rgba(255, 107, 157, 0.8) 30%, transparent 70%)';
                sparkle.style.boxShadow = '0 0 15px #ff6b9d, 0 0 25px rgba(255, 107, 157, 0.5)';
            } else if (Math.random() > 0.5) {
                sparkle.style.background = 'radial-gradient(circle, #ffd700 0%, rgba(255, 215, 0, 0.8) 30%, transparent 70%)';
                sparkle.style.boxShadow = '0 0 12px #ffd700, 0 0 20px rgba(255, 215, 0, 0.4)';
            }

            sparklesContainer.appendChild(sparkle);
        }
    }

    createEnhancedFloatingHearts() {
        const heartsContainer = document.querySelector('.floating-hearts');
        const heartTypes = ['💖', '💕', '💗', '💝', '💘', '💓', '💞', '💌'];

        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = heartTypes[Math.floor(Math.random() * heartTypes.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 8 + 's';
            heart.style.animationDuration = (Math.random() * 6 + 8) + 's';
            heart.style.fontSize = (Math.random() * 10 + 16) + 'px';
            heartsContainer.appendChild(heart);
        }
    }

    startBackgroundAnimations() {
        // More frequent sparkle creation
        setInterval(() => {
            this.createDynamicSparkle();
        }, 300);

        // Heart creation
        setInterval(() => {
            this.createDynamicHeart();
        }, 4000);

        // Additional floating sparkles
        setInterval(() => {
            this.createFloatingSparkle();
        }, 800);
    }

    createDynamicSparkle() {
        const sparklesContainer = document.getElementById('sparkles');
        if (sparklesContainer.children.length > 25) return;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const size = Math.random() * 5 + 2;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDuration = (Math.random() * 4 + 5) + 's';

        // Random pink theme colors
        const colors = [
            'radial-gradient(circle, #ff6b9d 0%, rgba(255, 107, 157, 0.8) 30%, transparent 70%)',
            'radial-gradient(circle, #ffd700 0%, rgba(255, 215, 0, 0.8) 30%, transparent 70%)',
            'radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.9) 30%, transparent 70%)',
            'radial-gradient(circle, #ffa8cc 0%, rgba(255, 168, 204, 0.8) 30%, transparent 70%)'
        ];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.background = randomColor;

        sparklesContainer.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 6000);
    }

    createDynamicHeart() {
        const heartsContainer = document.querySelector('.floating-hearts');
        if (heartsContainer.children.length > 12) return;

        const heart = document.createElement('div');
        heart.className = 'floating-heart';

        const heartTypes = ['💖', '💕', '💗', '💝', '💘', '💓', '💞', '💌', '🌸', '🌺'];
        heart.textContent = heartTypes[Math.floor(Math.random() * heartTypes.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 6 + 8) + 's';
        heart.style.fontSize = (Math.random() * 12 + 18) + 'px';

        heartsContainer.appendChild(heart);

        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 10000);
    }

    createFloatingSparkle() {
        const sparklesContainer = document.getElementById('sparkles');
        if (sparklesContainer.children.length > 35) return;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDuration = '4s';
        sparkle.style.background = 'radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)';
        sparkle.style.boxShadow = '0 0 8px #ffffff, 0 0 16px rgba(255, 107, 157, 0.3)';

        sparklesContainer.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 4000);
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
                e.preventDefault();
                e.stopPropagation();
                const filter = e.currentTarget.dataset.filter;
                if (filter) {
                    console.log('Filter button clicked:', filter);
                    this.applyFilter(filter);
                }
            });
        });

        // FIXED: Background buttons - Proper event delegation and binding
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const bg = e.currentTarget.dataset.bg;
                if (bg) {
                    console.log('Background button clicked:', bg);
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
        this.showToast(`Đã chuyển sang camera ${this.currentFacingMode === 'user' ? 'trước' : 'sau'}! 📱`);
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

        this.showToast(`Đã áp dụng hiệu ứng ${effect}! ✨`);
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
                }, 2500); // Slightly longer delay for better UX
            } else {
                this.stopAutoCapture();
                this.showToast(`🎉 Đã chụp xong ${this.autoCapture.totalShots} ảnh tuyệt vời! 📸✨`);
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

            this.showToast('🎬 Bắt đầu quay video thần thánh! ✨');

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

        this.showToast('🎬 Đã dừng quay video! Tác phẩm tuyệt vời! ✨');
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

        this.showToast('🎥 Video đã được lưu thành công! Siêu phẩm! ✨');
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
            // Enhanced countdown with more sparkles
            for (let i = 3; i > 0; i--) {
                countdown.textContent = i;
                countdown.classList.add('show');

                // Create extra sparkles during countdown
                this.createCountdownSparkles();

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

    createCountdownSparkles() {
        const sparklesContainer = document.getElementById('sparkles');
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.width = '6px';
            sparkle.style.height = '6px';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.animationDuration = '2s';
            sparkle.style.background = 'radial-gradient(circle, #ffd700 0%, rgba(255, 215, 0, 0.8) 50%, transparent 100%)';
            sparkle.style.boxShadow = '0 0 15px #ffd700';

            sparklesContainer.appendChild(sparkle);

            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 2000);
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
                <div class="preview-text">✨ Tuyệt vời! Ảnh thật là đẹp! 🌸💖</div>
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

        flyingPhoto.style.left = cameraRect.left + cameraRect.width / 2 - 70 + 'px';
        flyingPhoto.style.top = cameraRect.top + cameraRect.height / 2 - 45 + 'px';

        flyingContainer.appendChild(flyingPhoto);

        setTimeout(() => {
            const targetX = galleryRect.left + Math.random() * (galleryRect.width - 140);
            const targetY = galleryRect.top + Math.random() * 100;

            flyingPhoto.style.left = targetX + 'px';
            flyingPhoto.style.top = targetY + 'px';
        }, 100);

        setTimeout(() => {
            if (flyingPhoto.parentNode) {
                flyingPhoto.parentNode.removeChild(flyingPhoto);
            }
        }, 2500);
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

        this.showToast(`✨ Đã chuyển sang chế độ xem ${view === 'grid' ? 'lưới' : view === 'list' ? 'danh sách' : 'gạch'}! 🎨`);
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
                    <p>Chưa có ảnh hoặc video nào.<br>Hãy chụp ảnh hoặc quay video đầu tiên! 🌸</p>
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
                ? `<div class="media-type-indicator">🎬 VIDEO</div>`
                : `<div class="media-type-indicator">📸 PHOTO</div>`;

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
        this.showToast('📥 Đã tải xuống video! Chia sẻ ngay nào! ✨');
    }

    downloadMedia(id) {
        const media = this.media.find(m => m.id === id);
        if (!media) return;

        const link = document.createElement('a');
        const extension = media.type === 'video' ? 'webm' : 'jpg';
        link.download = `sparkle-${media.type}-${id}.${extension}`;
        link.href = media.data;
        link.click();
        this.showToast(`📥 Đã tải xuống ${media.type === 'video' ? 'video' : 'ảnh'}! Tuyệt vời! ✨`);
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
            this.showToast(`🗑️ Đã xóa ${mediaType}! Dọn dẹp xong! ✨`);
        }
    }

    clearGallery() {
        if (confirm('Bạn có chắc muốn xóa tất cả ảnh và video? 🗑️💔')) {
            this.media.forEach(media => {
                if (media.type === 'video' && media.data.startsWith('blob:')) {
                    URL.revokeObjectURL(media.data);
                }
            });

            this.media = [];
            this.saveMedia();
            this.renderGallery();
            this.showToast('🗑️ Đã xóa tất cả! Bắt đầu lại thôi! ✨');
        }
    }

    // FIXED: Editor Functions with Enhanced Background Functionality
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
        this.showToast(`✨ Đã thêm sticker ${emoji}! Quá đáng yêu! 💖`);
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
            this.showToast('🗑️ Đã xóa sticker!');
        }
    }

    redrawCanvas() {
        if (!this.currentPhoto) return;

        const img = new Image();
        img.onload = () => {
            // Clear canvas
            this.editorCtx.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);

            // FIXED: Apply background FIRST
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
                this.editorCtx.strokeStyle = '#ff6b9d';
                this.editorCtx.lineWidth = 4;
                this.editorCtx.beginPath();
                this.editorCtx.arc(0, 0, sticker.size / 2 + 12, 0, Math.PI * 2);
                this.editorCtx.stroke();

                // Add glow effect
                this.editorCtx.shadowColor = '#ff6b9d';
                this.editorCtx.shadowBlur = 10;
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
        this.showToast('🔄 Đã reset tất cả! Bắt đầu lại nào! ✨');
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
        console.log('Applying filter:', filter);
        this.currentFilter = filter;
        this.updateActiveButtons();
        this.applyCurrentSettings();
        this.showToast(`✨ Đã áp dụng filter ${filter}! Tuyệt đẹp! 🌸`);
    }

    // FIXED: Enhanced Background Application
    applyBackground(bg) {
        console.log('Applying background:', bg);
        this.currentBackground = bg;
        this.updateActiveButtons();
        this.applyCurrentSettings();
        this.showToast(`🎨 Đã áp dụng nền ${bg}! Màu sắc tuyệt vời! ✨`);
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

    // FIXED: Enhanced Background Drawing with Better Performance
    applyBackgroundToCanvas() {
        if (this.currentBackground === 'none') return;

        const canvas = this.editorCanvas;
        const ctx = this.editorCtx;

        console.log('Drawing background:', this.currentBackground);

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

    // Enhanced background drawing methods with pink theme integration
    drawGalaxyBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, '#2d1b69');
        gradient.addColorStop(0.3, '#8e44ad');
        gradient.addColorStop(0.6, '#ff6b9d');
        gradient.addColorStop(1, '#0c0c0c');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add pink-themed stars
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.9 + 0.1;

            const colors = ['rgba(255, 255, 255, ', 'rgba(255, 107, 157, ', 'rgba(255, 215, 0, '];
            const color = colors[Math.floor(Math.random() * colors.length)];

            ctx.fillStyle = color + alpha + ')';
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

        const colors = ['#ff6b9d', '#00ff41', '#0066ff', '#ffd700', '#ff91c7'];
        for (let i = 0; i < 5; i++) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, colors[i] + '00');
            gradient.addColorStop(0.3, colors[i] + '80');
            gradient.addColorStop(0.7, colors[i] + '40');
            gradient.addColorStop(1, colors[i] + '00');

            ctx.fillStyle = gradient;
            ctx.beginPath();

            const waveHeight = canvas.height * 0.6;
            const frequency = 0.01;
            const amplitude = 50;

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
        gradient.addColorStop(0, '#ff6b9d');
        gradient.addColorStop(0.2, '#ff91c7');
        gradient.addColorStop(0.4, '#ffd700');
        gradient.addColorStop(0.6, '#ff7979');
        gradient.addColorStop(0.8, '#ff6348');
        gradient.addColorStop(1, '#ff8e8e');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add sun
        const sunGradient = ctx.createRadialGradient(
            canvas.width * 0.7, canvas.height * 0.3, 0,
            canvas.width * 0.7, canvas.height * 0.3, 80
        );
        sunGradient.addColorStop(0, '#ffd700');
        sunGradient.addColorStop(0.7, '#ff6b35');
        sunGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sunGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawOceanBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#4fc3f7');
        gradient.addColorStop(0.6, '#29b6f6');
        gradient.addColorStop(1, '#0077be');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add waves with pink highlights
        for (let i = 0; i < 3; i++) {
            const waveGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
            waveGradient.addColorStop(0, 'rgba(255, 107, 157, 0.3)');
            waveGradient.addColorStop(1, 'rgba(255, 107, 157, 0.1)');

            ctx.fillStyle = waveGradient;
            ctx.beginPath();

            const waveY = canvas.height * (0.7 + i * 0.1);
            ctx.moveTo(0, waveY);

            for (let x = 0; x <= canvas.width; x += 20) {
                const y = waveY + Math.sin((x + i * 50) * 0.02) * 15;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawForestBackground() {
        const ctx = this.editorCtx;
        const canvas = this.editorCanvas;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#a5d6a7');
        gradient.addColorStop(0.3, '#81c784');
        gradient.addColorStop(0.6, '#66bb6a');
        gradient.addColorStop(1, '#2e7d32');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add pink cherry blossoms
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.7;
            const size = Math.random() * 8 + 4;

            ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 107, 157, 0.6)';
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
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

    // FIXED: Enhanced Custom Background Loading
    loadCustomBackground(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('🚫 Vui lòng chọn file ảnh!', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('⚠️ File quá lớn! Vui lòng chọn ảnh dưới 5MB.', 'error');
            return;
        }

        this.showLoading();

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.customBackgroundImage = img;
                this.currentBackground = 'custom';
                this.updateActiveButtons();
                this.applyCurrentSettings();
                this.hideLoading();
                this.showToast('🎨 Đã tải nền tùy chỉnh thành công! Tuyệt đẹp! ✨');
            };
            img.onerror = () => {
                this.hideLoading();
                this.showToast('❌ Lỗi khi tải ảnh!', 'error');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            this.hideLoading();
            this.showToast('❌ Lỗi khi đọc file!', 'error');
        };
        reader.readAsDataURL(file);
    }

    async saveEdit() {
        this.showLoading();

        // Add some sparkles during save
        for (let i = 0; i < 10; i++) {
            this.createSaveSparkles();
        }

        await this.sleep(800);

        const editedImageData = this.editorCanvas.toDataURL('image/jpeg', 0.9);

        this.currentPhoto.data = editedImageData;
        this.currentPhoto.timestamp = new Date().toISOString();

        this.saveMedia();
        this.renderGallery();
        this.closeEditor();
        this.hideLoading();
        this.showToast('💾 Đã lưu ảnh thành công! Siêu phẩm đã ra đời! ✨🌸');
    }

    createSaveSparkles() {
        const sparklesContainer = document.getElementById('sparkles');
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.width = '8px';
        sparkle.style.height = '8px';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDuration = '1s';
        sparkle.style.background = 'radial-gradient(circle, #ffd700 0%, rgba(255, 215, 0, 0.8) 50%, transparent 100%)';
        sparkle.style.boxShadow = '0 0 20px #ffd700, 0 0 30px rgba(255, 107, 157, 0.5)';

        sparklesContainer.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    }

    downloadEdit() {
        const link = document.createElement('a');
        link.download = `sparkle-photo-edited-${Date.now()}.jpg`;
        link.href = this.editorCanvas.toDataURL('image/jpeg', 0.9);
        link.click();
        this.showToast('📥 Đã tải xuống ảnh chỉnh sửa! Chia sẻ ngay nào! ✨');
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
            this.showToast('⚠️ Lỗi khi lưu! Có thể bộ nhớ đã đầy.', 'error');
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
                toast.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #e91e63 100%)';
            }
        }

        toast.classList.add('active');

        // Create toast sparkles
        this.createToastSparkles();

        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }

    createToastSparkles() {
        const toast = document.getElementById('toast');
        if (!toast) return;

        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ffd700 0%, transparent 70%);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: sparkleFloat 2s ease-out forwards;
                pointer-events: none;
                z-index: 10;
            `;

            toast.appendChild(sparkle);

            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 2000);
        }
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

    // Add welcome message with pink theme
    setTimeout(() => {
        if (photoBooth) {
            photoBooth.showToast('🌸 Chào mừng đến với Wei PhotoBooth! Sẵn sàng tạo những khoảnh khắc tuyệt vời! ✨💖');
        }
    }, 1000);
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

// Enhanced Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
                if (photoBooth) {
                    photoBooth.showToast('📱 App đã sẵn sàng offline! Tuyệt vời! ✨');
                }
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Enhanced PWA Install prompt with pink theme
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
            background: linear-gradient(135deg, #ff6b9d 0%, #e91e63 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        `;

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
                installBtn.remove();

                if (photoBooth && outcome === 'accepted') {
                    photoBooth.showToast('🎉 Cảm ơn bạn đã cài đặt app! Tuyệt vời! ✨');
                }
            }
        });

        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'translateY(-3px) scale(1.05)';
            installBtn.style.boxShadow = '0 8px 25px rgba(255, 107, 157, 0.6)';
        });

        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'translateY(0) scale(1)';
            installBtn.style.boxShadow = '0 6px 20px rgba(255, 107, 157, 0.4)';
        });

        document.body.appendChild(installBtn);

        // Auto hide after 10 seconds
        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.style.opacity = '0';
                installBtn.style.transform = 'translateY(-50px)';
                setTimeout(() => installBtn.remove(), 300);
            }
        }, 10000);
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

// Enhanced memory management for mobile devices
if ('memory' in performance) {
    setInterval(() => {
        const memInfo = performance.memory;
        const usedMemory = memInfo.usedJSHeapSize / 1048576; // MB

        if (usedMemory > 50 && photoBooth) {
            console.warn('High memory usage detected:', usedMemory.toFixed(2), 'MB');

            // More aggressive cleanup for videos
            photoBooth.media.forEach((media, index) => {
                if (media.type === 'video' && media.data && media.data.startsWith('blob:')) {
                    const videoIndex = photoBooth.media.filter(m => m.type === 'video').indexOf(media);
                    if (videoIndex > 3) { // Keep only 3 most recent videos
                        URL.revokeObjectURL(media.data);
                        media.data = null;
                    }
                }
            });

            // Clean up sparkles
            const sparklesContainer = document.getElementById('sparkles');
            if (sparklesContainer && sparklesContainer.children.length > 20) {
                while (sparklesContainer.children.length > 15) {
                    sparklesContainer.removeChild(sparklesContainer.firstChild);
                }
            }
        }
    }, 20000); // Check every 20 seconds
}

// Add keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        if (photoBooth) {
            photoBooth.showToast('⌨️ Phím tắt: Space=Chụp ảnh, Ctrl+R=Quay video, Esc=Đóng, ?=Trợ giúp ✨');
        }
    }
});

// Add touch feedback for mobile
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('btn') ||
        e.target.classList.contains('glass-btn') ||
        e.target.closest('.btn') ||
        e.target.closest('.glass-btn')) {
        e.target.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('touchend', (e) => {
    if (e.target.classList.contains('btn') ||
        e.target.classList.contains('glass-btn') ||
        e.target.closest('.btn') ||
        e.target.closest('.glass-btn')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (photoBooth) {
        photoBooth.showToast('⚠️ Đã xảy ra lỗi! Vui lòng thử lại.', 'error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (photoBooth) {
        photoBooth.showToast('⚠️ Lỗi xử lý! Vui lòng thử lại.', 'error');
    }
});

// Add analytics placeholder
if (typeof gtag !== 'undefined') {
    gtag('event', 'photobooth_loaded', {
        'custom_parameter': 'pink_theme_version'
    });
}