// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================
// PROJECTS FILTER
// ============================================
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ============================================
// CONTACT FORM WITH DATABASE
// ============================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: this.querySelector('input[type="text"]').value.trim(),
            email: this.querySelector('input[type="email"]').value.trim(),
            subject: this.querySelector('input[placeholder="Subject"]').value.trim(),
            message: this.querySelector('textarea').value.trim()
        };
        
        // Validate form data
        if (!formData.name || !formData.email || !formData.message) {
            showAlert('❌ Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert('❌ Please enter a valid email address.', 'error');
            return;
        }
        
        // Save to database
        try {
            // Make sure database is loaded
            if (typeof cyberDevDB !== 'undefined') {
                cyberDevDB.addMessage(formData);
                
                // Show success animation
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                const originalBg = submitBtn.style.background;
                
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.style.background = '#10b981';
                submitBtn.disabled = true;
                
                // Reset form
                this.reset();
                
                // Show success message
                showAlert('✅ Message sent successfully!', 'success');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = originalBg;
                    submitBtn.disabled = false;
                }, 2000);
                
            } else {
                // Fallback if database not loaded
                showAlert('✅ Thank you for your message!', 'success');
                this.reset();
            }
            
        } catch (error) {
            console.error('Error saving message:', error);
            showAlert('❌ Error sending message. Please try again.', 'error');
        }
    });
}

// ============================================
// ALERT FUNCTION
// ============================================
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    
    // Set colors based on type
    let bgColor, icon;
    switch(type) {
        case 'success':
            bgColor = '#10b981';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = '#ef4444';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = '#f59e0b';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            bgColor = '#6366f1';
            icon = 'fa-info-circle';
    }
    
    alertDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        ">
            <i class="fas ${icon}" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 300);
    }, 3000);
    
    // Add CSS animations if not already added
    if (!document.querySelector('#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// VISITOR TRACKING
// ============================================
// Track visitor on page load
document.addEventListener('DOMContentLoaded', function() {
    // Wait for database to load
    setTimeout(() => {
        if (typeof cyberDevDB !== 'undefined') {
            cyberDevDB.addVisitor();
            
            // Update visitor count display if exists
            const visitorCountEl = document.querySelector('.visitor-count');
            if (visitorCountEl) {
                const totalVisitors = cyberDevDB.getTotalVisitors();
                visitorCountEl.textContent = totalVisitors.toLocaleString();
                visitorCountEl.title = `Total Visitors: ${totalVisitors}`;
            }
            
            // Add visitor counter to footer if not exists
            const footer = document.querySelector('.footer-content');
            if (footer && !document.querySelector('.visitor-counter')) {
                const visitorCount = cyberDevDB.getTotalVisitors();
                const visitorDiv = document.createElement('div');
                visitorDiv.className = 'visitor-counter';
                visitorDiv.innerHTML = `
                    <div style="
                        margin-top: 15px;
                        padding: 8px 15px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 20px;
                        font-size: 0.9rem;
                        color: #94a3b8;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-eye"></i>
                        <span>${visitorCount} Visitors</span>
                    </div>
                `;
                footer.appendChild(visitorDiv);
            }
        }
    }, 1000);
});

// ============================================
// BACK TO TOP BUTTON
// ============================================
const backToTopButton = document.querySelector('.back-to-top');

if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// ANIMATE SKILL BARS ON SCROLL
// ============================================
const skillBars = document.querySelectorAll('.skill-level');

if (skillBars.length > 0) {
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 300);
        });
    };

    // Check if skills section is in viewport
    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(skillsSection);
    }
}

// ============================================
// REAL-TIME MESSAGE NOTIFICATION
// ============================================
// Check for new messages periodically
function checkForNewMessages() {
    if (typeof cyberDevDB !== 'undefined' && window.location.pathname.includes('admin.html')) {
        const unreadCount = cyberDevDB.getUnreadCount();
        const badge = document.getElementById('unreadBadge');
        const notification = document.getElementById('notificationCount');
        
        if (badge) badge.textContent = unreadCount;
        if (notification) notification.textContent = unreadCount;
        
        // Update page title if there are unread messages
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Admin Panel - CyberDev`;
        } else {
            document.title = 'Admin Panel - CyberDev';
        }
    }
}

// Check every 10 seconds
setInterval(checkForNewMessages, 10000);

// Initial check
setTimeout(checkForNewMessages, 2000);

// ============================================
// FORM VALIDATION STYLING
// ============================================
// Add validation styles to form inputs
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    formInputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6366f1';
            this.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        
        // Remove focus effect
        input.addEventListener('blur', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            
            // Validate on blur
            if (this.type === 'email' && this.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.value)) {
                    this.style.borderColor = '#ef4444';
                    showAlert('Please enter a valid email address', 'error');
                }
            }
        });
        
        // Real-time validation for required fields
        input.addEventListener('input', function() {
            if (this.hasAttribute('required') && this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '';
            }
        });
    });
});

// ============================================
// PAGE LOAD ANIMATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Add fade-in animation to elements
    const animatedElements = document.querySelectorAll('.hero-content, .skill-card, .project-card, .contact-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
});

// ============================================
// THEME TOGGLE (OPTIONAL)
// ============================================
// You can add theme toggle functionality here if needed
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    
    showAlert(`Switched to ${newTheme} theme`, 'success');
}

// Load saved theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
});

// ============================================
// COPY EMAIL TO CLIPBOARD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const emailElements = document.querySelectorAll('.copy-email');
    
    emailElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.textContent || this.getAttribute('data-email');
            
            navigator.clipboard.writeText(email).then(() => {
                showAlert('Email copied to clipboard!', 'success');
            }).catch(err => {
                showAlert('Failed to copy email', 'error');
            });
        });
    });
});

// ============================================
// SMOOTH PAGE TRANSITIONS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href && this.href.includes('admin.html')) {
                return; // Don't animate for admin page
            }
            
            if (this.href && !this.href.includes('#')) {
                e.preventDefault();
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = this.href;
                }, 300);
            }
        });
    });
});

// ============================================
// LAZY LOAD IMAGES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});

// ============================================
// CURSOR EFFECT (OPTIONAL)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Add hover effect
        const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.background = 'rgba(99, 102, 241, 0.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = '';
            });
        });
    }
});

// ============================================
// INITIALIZE EVERYTHING
// ============================================
console.log('🚀 CyberDev Portfolio loaded successfully!');
console.log('📊 Database System: ' + (typeof cyberDevDB !== 'undefined' ? 'Active' : 'Not loaded'));
console.log('👁️ Visitor Tracking: Enabled');
console.log('💌 Contact Form: ' + (contactForm ? 'Ready' : 'Not found'));

