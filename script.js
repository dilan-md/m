document.addEventListener('DOMContentLoaded', () => {
    // --- Clock Functionality ---
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        document.getElementById('system-clock').textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

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

    function openWindow(windowId) {
        // Close all windows first
        Object.values(windows).forEach(win => {
            if (win) win.classList.add('hidden');
        });

        // Open the requested window
        const targetWindow = windows[windowId];
        if (targetWindow) {
            targetWindow.classList.remove('hidden');
        }
    }

    function closeWindow(windowId) {
        const targetWindow = windows[windowId];
        if (targetWindow) {
            targetWindow.classList.add('hidden');
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
    }

    function dragStart(e, elmnt) {
        // Get initial mouse position
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        activeWindow = elmnt;
        isDragging = true;

        // Disable transitions immediately
        elmnt.style.transition = 'none';

        // Convert from centered position to absolute position on first drag
        if (elmnt.classList.contains('-translate-x-1/2')) {
            const rect = elmnt.getBoundingClientRect();
            const parentRect = elmnt.parentElement.getBoundingClientRect();

            xOffset = rect.left - parentRect.left;
            yOffset = rect.top - parentRect.top;

            elmnt.style.left = xOffset + 'px';
            elmnt.style.top = yOffset + 'px';
            elmnt.style.transform = 'none';
            elmnt.classList.remove('-translate-x-1/2', '-translate-y-[55%]', 'top-1/2', 'left-1/2');

            // Recalculate initial position after transform removal
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);
    }

    function drag(e) {
        if (isDragging && activeWindow) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            activeWindow.style.left = currentX + "px";
            activeWindow.style.top = currentY + "px";
        }
    }

    function dragEnd(e) {
        isDragging = false;
        activeWindow = null;

        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", dragEnd);
    }

    // --- Dock Interactions ---
    const dockItems = document.querySelectorAll('.bottom-6 button');

    dockItems.forEach((item) => {
        item.addEventListener('click', () => {
            // Handle Active Indicator (Dot)
            dockItems.forEach(dockLink => {
                const dot = dockLink.querySelector('.bg-primary.mt-1');
                if (dot && dockLink !== item) {
                    dot.remove();
                }
            });

            // Add dot to clicked item if missing
            if (!item.querySelector('.bg-primary.mt-1')) {
                const dot = document.createElement('div');
                dot.className = 'w-1 h-1 rounded-full bg-primary mt-1';
                item.appendChild(dot);
            }

            // Simple animation effect
            item.classList.add('animate-bounce');
            setTimeout(() => item.classList.remove('animate-bounce'), 1000);

            // Logic for specific items
            const label = item.querySelector('.opacity-0').textContent.trim();
            if (label === 'Papelera') {
                openWindow('trash-window');
            } else if (label === 'Inicio') {
                // Close all windows to show desktop
                Object.values(windows).forEach(win => {
                    if (win) win.classList.add('hidden');
                });
                // Mascot Message
                const mascotMsg = document.querySelector('.bg-white.rounded-2xl.p-4.shadow-lg.relative p');
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
                // Open the playground window (default)
                openWindow('playground-window');
            } else if (label === 'Sobre Mí') {
                openWindow('about-window');
            } else if (label === 'Contacto') {
                document.getElementById('contact-modal').classList.remove('hidden');
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

    // --- Additional Modal Buttons ---
    const downloadCvBtnModal = document.getElementById('download-cv-btn-modal');
    if (downloadCvBtnModal) {
        downloadCvBtnModal.addEventListener('click', () => {
            // INSTRUCCIÓN: Magdyel debe subir su CV (PDF) a su servidor/carpeta y poner el link aquí.
            // Ejemplo: window.open('cv-magdyel.pdf', '_blank');

            alert('¡Descargando el CV de Magdyel! ✨');

            // Simulación de descarga (puedes cambiar '#' por el link real del PDF)
            const link = document.createElement('a');
            link.href = '#'; // Cambiar por 'archivo-cv.pdf'
            link.download = 'CV_Magdyel.pdf';
            // link.click(); // Descomenta esto cuando tengas el archivo real
        });
    }

    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.add('hidden');
            }
        });
    }
});
