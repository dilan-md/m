document.addEventListener('DOMContentLoaded', () => {
    // --- Clock Functionality ---
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const clockEl = document.getElementById('system-clock');
        if (clockEl) clockEl.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Dynamic Z-Index Management ---
    let highestZIndex = 50;

    function bringToFront(windowElement) {
        if (!windowElement) return;
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
    }

    // --- Window Management ---
    const windows = {
        'brand-window': document.getElementById('brand-window'),
        'web-window': document.getElementById('web-window'),
        'illustration-window': document.getElementById('illustration-window'),
        'playground-window': document.getElementById('playground-window'),
        'about-window': document.getElementById('about-window'),
        'trash-window': document.getElementById('trash-window')
    };

    const icons = document.querySelectorAll('.desktop-icon');
    const closeButtons = document.querySelectorAll('.close-window-btn');

    // Desktop Icons Click Event - Open corresponding window
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            const target = icon.getAttribute('data-target');
            openWindow(target);
        });
    });

    // Close Button Events - Close any window
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const windowElement = e.target.closest('.project-window');
            if (windowElement) {
                closeWindow(windowElement.id);
            }
        });
    });

    // Bring window to front on click
    Object.values(windows).forEach(win => {
        if (win) {
            win.addEventListener('mousedown', () => bringToFront(win));
        }
    });

    function pauseMainVideo() {
        const vid = document.getElementById('main-video-player');
        if (vid && !vid.paused) {
            vid.pause();
        }
    }

    function openWindow(windowId) {
        const targetWindow = windows[windowId];
        if (targetWindow) {
            targetWindow.classList.remove('hidden');
            bringToFront(targetWindow);
        }
    }

    function closeWindow(windowId) {
        const targetWindow = windows[windowId];
        if (targetWindow) {
            targetWindow.classList.add('hidden');
            if (windowId === 'playground-window' || windowId === 'video-window') {
                pauseMainVideo();
            }
        }
    }

    // --- Drag Functionality for ALL Windows ---
    Object.values(windows).forEach(windowElement => {
        if (windowElement) {
            makeDraggable(windowElement);
        }
    });

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let activeWindow = null;

    function makeDraggable(elmnt) {
        const header = elmnt.querySelector('.window-header');
        if (!header) return;

        header.addEventListener("mousedown", (e) => dragStart(e, elmnt));
        header.addEventListener("touchstart", (e) => dragStart(e, elmnt), { passive: false });
    }

    function dragStart(e, elmnt) {
        bringToFront(elmnt);

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        initialX = clientX - xOffset;
        initialY = clientY - yOffset;

        activeWindow = elmnt;
        isDragging = true;

        elmnt.style.transition = 'none';

        if (elmnt.classList.contains('-translate-x-1/2')) {
            const rect = elmnt.getBoundingClientRect();
            const parentRect = elmnt.parentElement.getBoundingClientRect();

            xOffset = rect.left - parentRect.left;
            yOffset = rect.top - parentRect.top;

            elmnt.style.left = xOffset + 'px';
            elmnt.style.top = yOffset + 'px';
            elmnt.style.transform = 'none';
            elmnt.classList.remove('-translate-x-1/2', '-translate-y-[55%]', '-translate-y-1/2', 'top-1/2', 'left-1/2');

            initialX = clientX - xOffset;
            initialY = clientY - yOffset;
        }

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);
        document.addEventListener("touchmove", drag, { passive: false });
        document.addEventListener("touchend", dragEnd);
    }

    function drag(e) {
        if (isDragging && activeWindow) {
            if (e.touches) {
                // Prevent scrolling page while dragging window
                e.preventDefault();
            }

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            currentX = clientX - initialX;
            currentY = clientY - initialY;

            // Prevent dragging window above the screen top header bar (min Y = 40px)
            const minY = 40;
            const maxY = window.innerHeight - 80;
            if (currentY < minY) currentY = minY;
            if (currentY > maxY) currentY = maxY;

            xOffset = currentX;
            yOffset = currentY;

            activeWindow.style.left = currentX + "px";
            activeWindow.style.top = currentY + "px";
        }
    }

    function dragEnd() {
        isDragging = false;
        activeWindow = null;

        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", dragEnd);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", dragEnd);
    }

    // --- Gallery Interactive Switcher (Illustration Window) ---
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');
    const mainImg = document.getElementById('illustration-main-img');
    const viewLink = document.getElementById('illustration-view-link');
    const titleEl = document.getElementById('illustration-title');
    const descEl = document.getElementById('illustration-desc');
    const tagsContainer = document.getElementById('illustration-tags');

    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            galleryThumbs.forEach(t => {
                t.classList.remove('border-primary', 'active');
                t.classList.add('border-gray-100');
            });
            thumb.classList.remove('border-gray-100');
            thumb.classList.add('border-primary', 'active');

            const src = thumb.getAttribute('data-src');
            const title = thumb.getAttribute('data-title');
            const desc = thumb.getAttribute('data-desc');
            const tags = thumb.getAttribute('data-tags');

            const driveLink = thumb.getAttribute('data-drive-link');
            const illActionContainer = document.getElementById('ill-action-container');
            const illDriveLink = document.getElementById('ill-drive-link');

            if (driveLink && illActionContainer && illDriveLink) {
                illDriveLink.href = driveLink;
                illActionContainer.classList.remove('hidden');
            } else if (illActionContainer) {
                illActionContainer.classList.add('hidden');
            }

            if (mainImg && src) {
                mainImg.src = src;
                mainImg.alt = title || 'Ilustración';
            }
            if (viewLink && src) {
                viewLink.href = src;
            }
            if (titleEl && title) {
                titleEl.textContent = title;
            }
            if (descEl && desc) {
                descEl.textContent = desc;
            }
            if (tagsContainer && tags) {
                tagsContainer.innerHTML = '';
                tags.split(',').forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'px-2.5 py-1 bg-[#f5f0f2] text-xs font-semibold text-[#181114] rounded-md';
                    span.textContent = tag.trim();
                    tagsContainer.appendChild(span);
                });
            }
        });
    });

    // --- Horizontal Scroll Buttons for Thumbnails Strip ---
    const illStrip = document.getElementById('ill-gallery-strip');
    const illScrollLeft = document.getElementById('ill-scroll-left');
    const illScrollRight = document.getElementById('ill-scroll-right');

    if (illScrollLeft && illStrip) {
        illScrollLeft.addEventListener('click', () => illStrip.scrollBy({ left: -220, behavior: 'smooth' }));
    }
    if (illScrollRight && illStrip) {
        illScrollRight.addEventListener('click', () => illStrip.scrollBy({ left: 220, behavior: 'smooth' }));
    }

    const videoThumbs = document.querySelectorAll('.video-thumb');
    const vidStrip = document.getElementById('vid-gallery-strip');
    const vidScrollLeft = document.getElementById('vid-scroll-left');
    const vidScrollRight = document.getElementById('vid-scroll-right');

    if (vidScrollLeft && vidStrip) {
        vidScrollLeft.addEventListener('click', () => vidStrip.scrollBy({ left: -220, behavior: 'smooth' }));
    }
    if (vidScrollRight && vidStrip) {
        vidScrollRight.addEventListener('click', () => vidStrip.scrollBy({ left: 220, behavior: 'smooth' }));
    }

    const mainVideoPlayer = document.getElementById('main-video-player');
    const mainGifPlayer = document.getElementById('main-gif-player');
    const videoTitleEl = document.getElementById('video-title');
    const videoDescEl = document.getElementById('video-desc');
    const videoTagsContainer = document.getElementById('video-tags');

    videoThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            videoThumbs.forEach(t => {
                t.classList.remove('border-primary', 'active');
                t.classList.add('border-gray-100');
            });
            thumb.classList.remove('border-gray-100');
            thumb.classList.add('border-primary', 'active');

            const src = thumb.getAttribute('data-video-src');
            const title = thumb.getAttribute('data-title');
            const desc = thumb.getAttribute('data-desc');
            const tags = thumb.getAttribute('data-tags');

            if (src) {
                const isGif = src.toLowerCase().endsWith('.gif');
                if (isGif) {
                    if (mainVideoPlayer) {
                        mainVideoPlayer.pause();
                        mainVideoPlayer.classList.add('hidden');
                    }
                    if (mainGifPlayer) {
                        mainGifPlayer.src = src;
                        mainGifPlayer.alt = title || 'Animación GIF';
                        mainGifPlayer.classList.remove('hidden');
                    }
                } else {
                    if (mainGifPlayer) {
                        mainGifPlayer.classList.add('hidden');
                    }
                    if (mainVideoPlayer) {
                        mainVideoPlayer.src = src;
                        mainVideoPlayer.classList.remove('hidden');
                        mainVideoPlayer.play().catch(() => {});
                    }
                }
            }

            const driveLink = thumb.getAttribute('data-drive-link');
            const videoActionContainer = document.getElementById('video-action-container');
            const videoDriveLink = document.getElementById('video-drive-link');

            if (driveLink && videoActionContainer && videoDriveLink) {
                videoDriveLink.href = driveLink;
                videoActionContainer.classList.remove('hidden');
            } else if (videoActionContainer) {
                videoActionContainer.classList.add('hidden');
            }

            if (videoTitleEl && title) {
                videoTitleEl.textContent = title;
            }
            if (videoDescEl && desc) {
                videoDescEl.textContent = desc;
            }
            if (videoTagsContainer && tags) {
                videoTagsContainer.innerHTML = '';
                tags.split(',').forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'px-2.5 py-1 bg-[#f5f0f2] text-xs font-semibold text-[#181114] rounded-md';
                    span.textContent = tag.trim();
                    videoTagsContainer.appendChild(span);
                });
            }
        });
    });

    // pauseMainVideo is defined earlier in the file

    // --- Dock Interactions ---
    const dockItems = document.querySelectorAll('.bottom-6 button');

    dockItems.forEach((item) => {
        item.addEventListener('click', () => {
            dockItems.forEach(dockLink => {
                const dot = dockLink.querySelector('.bg-primary.mt-1');
                if (dot && dockLink !== item) {
                    dot.remove();
                }
            });

            if (!item.querySelector('.bg-primary.mt-1')) {
                const dot = document.createElement('div');
                dot.className = 'w-1 h-1 rounded-full bg-primary mt-1';
                item.appendChild(dot);
            }

            item.classList.add('animate-bounce');
            setTimeout(() => item.classList.remove('animate-bounce'), 1000);

            const labelEl = item.querySelector('.opacity-0');
            if (!labelEl) return;
            const label = labelEl.textContent.trim();

            if (label === 'Papelera') {
                openWindow('trash-window');
            } else if (label === 'Inicio') {
                Object.values(windows).forEach(win => {
                    if (win) win.classList.add('hidden');
                });
                const mascotMsg = document.querySelector('.animate-bounce-slow p');
                if (mascotMsg) {
                    const messages = [
                        "¡Escritorio despejado! ✨ ¿Qué haremos ahora?",
                        "¡Listo! Todo ordenado para ti. 🎀",
                        "¡Me encanta como se ve el fondo! 🌸",
                        "¡Haz clic en una carpeta para volver a empezar! ✨"
                    ];
                    mascotMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
                }
            } else if (label === 'Mi Trabajo') {
                openWindow('illustration-window');
            } else if (label === 'Sobre Mí') {
                openWindow('about-window');
            } else if (label === 'Contacto') {
                const modal = document.getElementById('contact-modal');
                if (modal) modal.classList.remove('hidden');
            }
        });
    });

    // --- Modal Logic ---
    const contactModal = document.getElementById('contact-modal');
    const closeContactModal = document.getElementById('close-contact-modal');

    if (closeContactModal) {
        closeContactModal.addEventListener('click', () => {
            if (contactModal) contactModal.classList.add('hidden');
        });
    }

    const downloadCvBtnModal = document.getElementById('download-cv-btn-modal');
    if (downloadCvBtnModal) {
        downloadCvBtnModal.addEventListener('click', () => {
            alert('¡Descargando el CV de Magdyel! ✨');
        });
    }

    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.add('hidden');
            }
        });
    }

    // --- Clipboard Copy Logic for Contact Info ---
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const copyPhoneBtn = document.getElementById('copy-phone-btn');

    function copyToClipboard(text, buttonEl) {
        function showSuccess() {
            const icon = buttonEl.querySelector('.material-symbols-outlined');
            const originalIcon = icon ? icon.textContent : 'content_copy';
            if (icon) icon.textContent = 'check';

            buttonEl.classList.add('!bg-black', '!text-white');

            setTimeout(() => {
                if (icon) icon.textContent = originalIcon;
                buttonEl.classList.remove('!bg-black', '!text-white');
            }, 1800);
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(showSuccess).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }

        function fallbackCopy(textToCopy) {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showSuccess();
            } catch (err) {
                alert('Copiar: ' + textToCopy);
            }
            document.body.removeChild(textArea);
        }
    }

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyToClipboard('magdyelht@gmail.com', copyEmailBtn);
        });
    }

    if (copyPhoneBtn) {
        copyPhoneBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyToClipboard('+51941774779', copyPhoneBtn);
        });
    }

    // --- Web Projects Gallery Switcher ---
    const webThumbs = document.querySelectorAll('.web-thumb');
    const webMainImg = document.getElementById('web-main-img');
    const webVisitLink = document.getElementById('web-visit-link');
    const webTitleEl = document.getElementById('web-title');
    const webDescEl = document.getElementById('web-desc');
    const webTagsContainer = document.getElementById('web-tags');
    const webStrip = document.getElementById('web-gallery-strip');
    const webScrollLeft = document.getElementById('web-scroll-left');
    const webScrollRight = document.getElementById('web-scroll-right');

    if (webScrollLeft && webStrip) {
        webScrollLeft.addEventListener('click', () => webStrip.scrollBy({ left: -220, behavior: 'smooth' }));
    }
    if (webScrollRight && webStrip) {
        webScrollRight.addEventListener('click', () => webStrip.scrollBy({ left: 220, behavior: 'smooth' }));
    }

    webThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            webThumbs.forEach(t => {
                t.classList.remove('border-primary', 'active');
                t.classList.add('border-gray-100');
            });
            thumb.classList.remove('border-gray-100');
            thumb.classList.add('border-primary', 'active');

            const src = thumb.getAttribute('data-src');
            const title = thumb.getAttribute('data-title');
            const desc = thumb.getAttribute('data-desc');
            const tags = thumb.getAttribute('data-tags');
            const url = thumb.getAttribute('data-url');

            if (webMainImg && src) {
                webMainImg.src = src;
                webMainImg.alt = title || 'Sitio Web';
            }
            if (webVisitLink && url) {
                webVisitLink.href = url;
            }
            if (webTitleEl && title) {
                webTitleEl.textContent = title;
            }
            if (webDescEl && desc) {
                webDescEl.textContent = desc;
            }
            if (webTagsContainer && tags) {
                webTagsContainer.innerHTML = '';
                tags.split(',').forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'px-2.5 py-1 bg-[#f5f0f2] text-xs font-semibold text-[#181114] rounded-md';
                    span.textContent = tag.trim();
                    webTagsContainer.appendChild(span);
                });
            }
        });
    });

    // --- Keyboard Shortcuts (ESC, Left, Right) ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (contactModal && !contactModal.classList.contains('hidden')) {
                contactModal.classList.add('hidden');
            } else {
                Object.values(windows).forEach(win => {
                    if (win) win.classList.add('hidden');
                });
                pauseMainVideo();
            }
        } else if (e.key === 'ArrowLeft') {
            const illWin = windows['illustration-window'];
            const vidWin = windows['playground-window'];
            const webWin = windows['web-window'];
            if (illWin && !illWin.classList.contains('hidden') && illStrip) illStrip.scrollBy({ left: -220, behavior: 'smooth' });
            else if (vidWin && !vidWin.classList.contains('hidden') && vidStrip) vidStrip.scrollBy({ left: -220, behavior: 'smooth' });
            else if (webWin && !webWin.classList.contains('hidden') && webStrip) webStrip.scrollBy({ left: -220, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
            const illWin = windows['illustration-window'];
            const vidWin = windows['playground-window'];
            const webWin = windows['web-window'];
            if (illWin && !illWin.classList.contains('hidden') && illStrip) illStrip.scrollBy({ left: 220, behavior: 'smooth' });
            else if (vidWin && !vidWin.classList.contains('hidden') && vidStrip) vidStrip.scrollBy({ left: 220, behavior: 'smooth' });
            else if (webWin && !webWin.classList.contains('hidden') && webStrip) webStrip.scrollBy({ left: 220, behavior: 'smooth' });
        }
    });
});

