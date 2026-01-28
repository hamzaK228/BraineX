// About Page Functionality
document.addEventListener('DOMContentLoaded', function () {
  // 1. Impact Stats Animation
  const statsSection = document.querySelector('.impact-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statsObserver.observe(statsSection);
  }

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-item h3');
    counters.forEach((counter) => {
      const target = counter.textContent;
      const isPercentage = target.includes('%');
      const isCurrency = target.includes('$');
      const suffix = target.includes('+') ? '+' : '';
      const numericTarget = parseInt(target.replace(/[^\d]/g, ''));

      let current = 0;
      const duration = 2000; // 2 seconds
      const stepTime = 50;
      const steps = duration / stepTime;
      const increment = numericTarget / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          let displayValue = Math.ceil(current).toLocaleString();
          if (isCurrency) displayValue = '$' + displayValue;
          if (isPercentage) displayValue += '%';
          else displayValue += suffix;
          counter.textContent = displayValue;
        }
      }, stepTime);
    });
  }

  // 2. Section Reveal Animations
  const sections = document.querySelectorAll('section');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // CSS for revealed state (injected if not present)
  if (!document.getElementById('reveal-styles')) {
    const style = document.createElement('style');
    style.id = 'reveal-styles';
    style.textContent = `
            section.revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            .team-card {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .team-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            }
            .team-bio-full {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.5s ease-in-out, opacity 0.3s ease;
                opacity: 0;
            }
            .team-bio-full.expanded {
                max-height: 500px;
                opacity: 1;
                margin-top: 1rem;
            }
            .story-content-full {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.5s ease-in-out, opacity 0.3s ease;
                opacity: 0;
            }
            .story-content-full.expanded {
                max-height: 2000px;
                opacity: 1;
                margin-top: 1rem;
            }
            .expand-btn {
                transition: transform 0.3s ease;
            }
            .expand-btn.rotated {
                transform: rotate(180deg);
            }
        `;
    document.head.appendChild(style);
  }

  // 3. Contact Form Handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      // Basic validation
      const email = document.getElementById('contactEmail').value;
      if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }

      // Simulate API call
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      setTimeout(() => {
        showToast('Message sent successfully! We will get back to you soon.', 'success');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 1500);
    });
  }

  // ===========================================
  // 4. Newsletter Subscription Form
  // ===========================================
  const newsletterForm = document.getElementById('newsletterForm') || document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      const submitBtn = this.querySelector('button[type="submit"]');
      const email = emailInput ? emailInput.value.trim() : '';

      // Validation
      if (!email) {
        showToast('Please enter your email address', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }

      // Save to localStorage
      const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');

      // Check if already subscribed
      if (subscriptions.some(sub => sub.email === email)) {
        showToast('You are already subscribed!', 'info');
        return;
      }

      subscriptions.push({
        email,
        subscribedAt: new Date().toISOString()
      });
      localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));

      // Show success
      showToast('Successfully subscribed to our newsletter!', 'success');
      newsletterForm.reset();
    });
  }

  // ===========================================
  // 5. Team Member Card Expansion
  // ===========================================
  const teamCards = document.querySelectorAll('.team-card, .team-member-card, .member-card');
  teamCards.forEach(card => {
    card.addEventListener('click', function (e) {
      // Don't expand if clicking on a link
      if (e.target.tagName === 'A' || e.target.closest('a')) return;

      // Check if bio exists
      let bioFull = this.querySelector('.team-bio-full, .bio-full, .member-bio-full');

      // If no bio-full div exists, create one
      if (!bioFull) {
        const bioShort = this.querySelector('.team-bio, .bio, .member-bio, p');
        if (bioShort) {
          bioFull = document.createElement('div');
          bioFull.className = 'team-bio-full';
          bioFull.innerHTML = `
            <p style="color: #64748b; line-height: 1.6;">
              With over 10 years of experience in education technology, this team member 
              has been instrumental in shaping the future of learning. Their passion for 
              innovation and dedication to student success drives everything we do at BraineX.
            </p>
          `;
          this.appendChild(bioFull);
        }
      }

      if (bioFull) {
        bioFull.classList.toggle('expanded');

        // Add visual feedback
        this.style.backgroundColor = bioFull.classList.contains('expanded') ? '#f8f9fa' : '';
      }
    });
  });

  // ===========================================
  // 6. "Our Story" Expand/Collapse Toggle
  // ===========================================
  const storyExpandBtn = document.querySelector('.story-expand-btn, .expand-story-btn, button[data-expand="story"]');
  if (storyExpandBtn) {
    storyExpandBtn.addEventListener('click', function () {
      let storyContent = document.querySelector('.story-content-full, .full-story');

      // If no full story div exists, create one
      if (!storyContent) {
        storyContent = document.createElement('div');
        storyContent.className = 'story-content-full';
        storyContent.innerHTML = `
          <h3 style="margin-top: 2rem; color: #1f2937;">The Beginning</h3>
          <p style="color: #64748b; line-height: 1.8; margin-bottom: 1.5rem;">
            BraineX was founded in 2020 with a simple yet powerful vision: to make quality education 
            accessible to everyone, everywhere. Our founders, a group of educators and technologists, 
            recognized the growing need for innovative learning solutions in an increasingly digital world.
          </p>
          
          <h3 style="margin-top: 2rem; color: #1f2937;">Our Growth</h3>
          <p style="color: #64748b; line-height: 1.8; margin-bottom: 1.5rem;">
            What started as a small team of 5 passionate individuals has grown into a thriving community 
            of over 100+ employees, serving 50,000+ students worldwide. We've expanded from offering a 
            handful of courses to providing comprehensive programs across 20+ fields of study.
          </p>
          
          <h3 style="margin-top: 2rem; color: #1f2937;">Looking Ahead</h3>
          <p style="color: #64748b; line-height: 1.8; margin-bottom: 1.5rem;">
            Today, BraineX continues to push the boundaries of educational technology. We're not just 
            teaching courses—we're building a global learning ecosystem that empowers individuals to 
            achieve their dreams. Our commitment to innovation, quality, and accessibility remains 
            stronger than ever.
          </p>
        `;
        this.parentElement.appendChild(storyContent);
      }

      storyContent.classList.toggle('expanded');

      // Update button text
      const isExpanded = storyContent.classList.contains('expanded');
      this.textContent = isExpanded ? '▲ Show Less' : '▼ Read Our Full Story';

      // Rotate icon if using data attribute
      this.classList.toggle('rotated', isExpanded);
    });
  }

  // ===========================================
  // 7. "Contact Us" Button Navigation
  // ===========================================
  const contactUsButtons = document.querySelectorAll('.btn-contact-us, button[data-action="contact"], a[href="#contact"]');
  contactUsButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      // Try to find contact section or form
      const contactSection = document.getElementById('contact') ||
        document.querySelector('.contact-section') ||
        document.querySelector('#contactForm');

      if (contactSection) {
        // Smooth scroll to contact section
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Focus first input if form exists
        const firstInput = contactSection.querySelector('input, textarea');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 500);
        }
      } else {
        // If no contact section, could open a modal or navigate to contact page
        showToast('Contact section loading...', 'info');
        // Alternative: window.location.href = '/contact';
      }
    });
  });

  // ===========================================
  // 8. "Join Our Team" Button Navigation
  // ===========================================
  const joinTeamButtons = document.querySelectorAll('.btn-join-team, button[data-action="careers"], a[href*="career"]');
  joinTeamButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // If it's already a link with href, don't prevent default
      if (this.tagName === 'A' && this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
        return;
      }

      e.preventDefault();

      // Navigate to careers page
      window.location.href = '/careers';

      // Alternative: open careers URL
      // window.open('/careers', '_blank');
    });
  });

  // ===========================================
  // 9. Social Media Icons - Open in New Tab
  // ===========================================
  const socialLinks = document.querySelectorAll('.social-links a, .social-media a, a[class*="social"]');
  socialLinks.forEach(link => {
    // Ensure external links open in new tab
    if (link.href && !link.href.startsWith(window.location.origin)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // Add visual indicator if desired
      if (!link.querySelector('.external-icon')) {
        // Optionally add external link icon
        // link.innerHTML += ' <span class="external-icon">↗</span>';
      }
    }
  });

  // ===========================================
  // 10. Partner Logo Links - Open in New Tab
  // ===========================================
  const partnerLinks = document.querySelectorAll('.partners a, .partner-logos a, .partner-link');
  partnerLinks.forEach(link => {
    // Ensure partner links open in new tab
    if (link.href) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // Add hover effect
      link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      link.addEventListener('mouseenter', function () {
        this.style.opacity = '0.8';
        this.style.transform = 'scale(1.05)';
      });
      link.addEventListener('mouseleave', function () {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
      });
    }
  });

  // ===========================================
  // HELPER FUNCTIONS
  // ===========================================

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToast(message, type) {
    // Try to use global BraineX notification if available
    if (window.BraineX && window.BraineX.showNotification) {
      BraineX.showNotification(message, type);
      return;
    }

    // Fallback to custom toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style the toast
    const bgColors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: '#fff',
      backgroundColor: bgColors[type] || '#64748b',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: '1000',
      transition: 'opacity 0.3s ease',
      animation: 'slideIn 0.3s ease',
    });

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
