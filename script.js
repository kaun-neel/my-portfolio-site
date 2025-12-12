document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const introTextElement = document.getElementById('intro-text');
    const timestampElement = document.getElementById('timestamp');
    const navLinks = document.querySelectorAll('.cmd-link');
    const sections = document.querySelectorAll('.section');
    const terminalBody = document.querySelector('.terminal-body');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Config
    const introMessage = "Welcome to my digital workspace portfolio.\nHere you can have a glance about me and my projects in the field of Cybersecurity, Machine Learning, LLM modules, Data training and firewall developments.\n\nSelect a command below to explore:";
    const typingSpeed = 10; // ms per char (faster for content)
    const introSpeed = 20; // ms per char for intro

    // State
    const contentCache = {};
    let currentAnimation = null;

    // Store original content and clear it
    sections.forEach(section => {
        const outputDiv = section.querySelector('.output');
        if (outputDiv) {
            contentCache[section.id] = outputDiv.innerHTML;
            outputDiv.innerHTML = ''; // Clear initially
        }
    });

    // Typing Animation Helper
    async function typeHtml(html, container) {
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Recursive function to type nodes
        async function typeNode(node, parent) {
            if (currentAnimation && currentAnimation !== animationId) return; // Cancel check

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const textNode = document.createTextNode('');
                parent.appendChild(textNode);

                for (let i = 0; i < text.length; i++) {
                    if (currentAnimation && currentAnimation !== animationId) return;
                    textNode.textContent += text[i];
                    terminalBody.scrollTop = terminalBody.scrollHeight; // Auto-scroll
                    await new Promise(r => setTimeout(r, typingSpeed));
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = document.createElement(node.tagName);

                // Copy attributes
                Array.from(node.attributes).forEach(attr => {
                    element.setAttribute(attr.name, attr.value);
                });

                parent.appendChild(element);

                // Special handling for void elements or specific structures
                if (node.childNodes.length === 0) return;

                for (const child of Array.from(node.childNodes)) {
                    await typeNode(child, element);
                }
            }
        }

        const animationId = Date.now();
        currentAnimation = animationId;

        container.innerHTML = ''; // Clear container before starting

        for (const child of Array.from(tempDiv.childNodes)) {
            await typeNode(child, container);
        }

        // Re-attach listeners after typing is done
        if (currentAnimation === animationId) {
            attachFormListeners();
        }
    }

    // Intro Animation
    let charIndex = 0;
    function typeWriter() {
        if (charIndex < introMessage.length) {
            introTextElement.textContent += introMessage.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, introSpeed);
        }
    }
    setTimeout(typeWriter, 500);

    // Timestamp
    function updateTime() {
        const now = new Date();
        timestampElement.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Audio State
    let audioTimeout = null;

    // Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // Stop Audio if playing (unless we are clicking music again, but here we reset anyway)
            const globalAudio = document.getElementById('bg-music');
            if (globalAudio) {
                globalAudio.pause();
                globalAudio.currentTime = 0;
            }
            if (audioTimeout) {
                clearTimeout(audioTimeout);
                audioTimeout = null;
            }

            // Hide all sections
            sections.forEach(section => {
                section.classList.add('hidden');
            });

            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');

                // IMMEDIATE PLAYBACK LOGIC
                if (targetId === 'music') {
                    const audio = targetSection.querySelector('#bg-music');
                    if (audio) {
                        audio.currentTime = 15;
                        audio.volume = 0.5;
                        audio.play().catch(e => console.log("Audio play failed:", e));

                        // Stop after 60 seconds (at 75s mark)
                        audioTimeout = setTimeout(() => {
                            audio.pause();
                            audio.currentTime = 15;
                            // We can't update buttons here easily because they might not exist or be typed yet
                            // But the typing logic below handles the "after typing" state
                        }, 60000);
                    }
                }

                const outputDiv = targetSection.querySelector('.output');
                if (outputDiv && contentCache[targetId]) {
                    // Start typing animation for the content
                    typeHtml(contentCache[targetId], outputDiv).then(() => {
                        // ATTACH CONTROLS AFTER TYPING
                        if (targetId === 'music') {
                            const audio = targetSection.querySelector('#bg-music');
                            const btnPause = outputDiv.querySelector('#btn-pause');
                            const btnReplay = outputDiv.querySelector('#btn-replay');
                            const visualizer = outputDiv.querySelector('.visualizer');

                            if (audio) {
                                // Sync UI state with playing audio
                                if (!audio.paused) {
                                    if (btnPause) btnPause.textContent = "[ || ]";
                                    if (visualizer) visualizer.style.opacity = "1";
                                } else {
                                    if (btnPause) btnPause.textContent = "[ ▶ ]";
                                    if (visualizer) visualizer.style.opacity = "0.3";
                                }

                                // Controls Logic
                                if (btnPause) {
                                    const newBtnPause = btnPause.cloneNode(true);
                                    btnPause.parentNode.replaceChild(newBtnPause, btnPause);

                                    newBtnPause.addEventListener('click', () => {
                                        if (audio.paused) {
                                            audio.play();
                                            newBtnPause.textContent = "[ || ]";
                                            if (visualizer) visualizer.style.opacity = "1";
                                        } else {
                                            audio.pause();
                                            newBtnPause.textContent = "[ ▶ ]";
                                            if (visualizer) visualizer.style.opacity = "0.3";
                                        }
                                    });
                                }

                                if (btnReplay) {
                                    const newBtnReplay = btnReplay.cloneNode(true);
                                    btnReplay.parentNode.replaceChild(newBtnReplay, btnReplay);

                                    newBtnReplay.addEventListener('click', () => {
                                        audio.currentTime = 15;
                                        audio.play();
                                        if (btnPause) btnPause.textContent = "[ || ]";
                                        if (visualizer) visualizer.style.opacity = "1";

                                        // Reset timeout
                                        if (audioTimeout) clearTimeout(audioTimeout);
                                        audioTimeout = setTimeout(() => {
                                            audio.pause();
                                            audio.currentTime = 15;
                                            if (btnPause) btnPause.textContent = "[ ▶ ]";
                                            if (visualizer) visualizer.style.opacity = "0.3";
                                        }, 60000);
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
    });

    // Theme Switcher
    const themes = ['', 'theme-green', 'theme-amber'];
    let currentThemeIndex = 0;

    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        currentThemeIndex = themes.indexOf(savedTheme);
        if (currentThemeIndex !== -1) {
            body.classList.add(savedTheme);
        } else {
            currentThemeIndex = 0;
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (themes[currentThemeIndex]) {
                body.classList.remove(themes[currentThemeIndex]);
            }
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            if (themes[currentThemeIndex]) {
                body.classList.add(themes[currentThemeIndex]);
            }
            localStorage.setItem('portfolio-theme', themes[currentThemeIndex]);
        });
    }

    // Form Logic (Re-attachable)
    function attachFormListeners() {
        const form = document.querySelector('.cli-form');
        if (form) {
            // Remove old listener to prevent duplicates if called multiple times
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = newForm.querySelector('.btn-submit');
                const originalText = btn.textContent;

                btn.textContent = "[ SENDING... ]";
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = "[ SENT SUCCESSFULLY ]";
                    btn.style.borderColor = "var(--accent-color)";
                    btn.style.color = "var(--accent-color)";
                    newForm.reset();

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.borderColor = "";
                        btn.style.color = "";
                    }, 3000);
                }, 1500);
            });
        }
    }
});
