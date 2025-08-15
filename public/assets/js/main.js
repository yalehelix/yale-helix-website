document.addEventListener('DOMContentLoaded', () => {
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Enhanced adaptive header system
  function updateHeaderForSection() {
      const sections = [
          { element: document.querySelector('.hero-container'), bg: 'rgba(0, 0, 0, 0.8)', border: 'rgba(255, 255, 255, 0.1)', textColor: '#ffffff' },
          { element: document.querySelector('.features-section'), bg: 'rgba(66, 104, 255, 0.9)', border: 'rgba(255, 255, 255, 0.2)', textColor: '#ffffff' },
          { element: document.querySelector('.spacer-section'), bg: 'rgba(66, 104, 255, 0.9)', border: 'rgba(255, 255, 255, 0.2)', textColor: '#ffffff' },
          { element: document.querySelector('.what-we-do-section'), bg: 'rgba(248, 249, 250, 0.95)', border: 'rgba(0, 0, 0, 0.1)', textColor: '#0a0a0a' },
          { element: document.querySelector('.timeline-section'), bg: 'rgba(0, 0, 0, 0.9)', border: 'rgba(255, 255, 255, 0.1)', textColor: '#ffffff' },
          { element: document.querySelector('.stats-section'), bg: 'rgba(248, 249, 250, 0.95)', border: 'rgba(0, 0, 0, 0.1)', textColor: '#0a0a0a' },
          { element: document.querySelector('.team-section'), bg: 'rgba(0, 0, 0, 0.9)', border: 'rgba(255, 255, 255, 0.1)', textColor: '#ffffff' },
          { element: document.querySelector('#advisory'), bg: 'rgba(10, 10, 10, 0.95)', border: 'rgba(255, 255, 255, 0.1)', textColor: '#ffffff' }
      ];

      const header = document.querySelector('.header');
      const logo = document.querySelector('.logo');
      const navLinks = document.querySelectorAll('.nav-menu a');
      const applyBtn = document.querySelector('.apply-btn');
      
      // Create ScrollTrigger for each section
      sections.forEach((section, index) => {
          if (section.element) {
              ScrollTrigger.create({
                  trigger: section.element,
                  start: "top 100px",
                  end: "bottom 100px",
                  onEnter: () => {
                      gsap.to(header, {
                          backgroundColor: section.bg,
                          borderBottomColor: section.border,
                          duration: 0.3,
                          ease: "power2.out"
                      });
                      
                      gsap.to([logo, ...navLinks], {
                          color: section.textColor,
                          duration: 0.3,
                          ease: "power2.out"
                      });
                  },
                  onEnterBack: () => {
                      gsap.to(header, {
                          backgroundColor: section.bg,
                          borderBottomColor: section.border,
                          duration: 0.3,
                          ease: "power2.out"
                      });
                      
                      gsap.to([logo, ...navLinks], {
                          color: section.textColor,
                          duration: 0.3,
                          ease: "power2.out"
                      });
                  }
              });
          }
      });
  }

  // Initialize adaptive header
  updateHeaderForSection();

  // Main zoom animation timeline
  let heroTimeline = gsap.timeline({
      scrollTrigger: {
          trigger: ".hero-container",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
          pin: ".hero-section",
          anticipatePin: 1,
          onUpdate: self => {
              const progress = self.progress;
              document.querySelector('.scroll-progress').style.transform = `translateY(${-100 + (progress * 100)}%)`;
              
              if (progress > 0.05) {
                  document.querySelector('.loading-indicator').style.opacity = '0';
              } else {
                  document.querySelector('.loading-indicator').style.opacity = '1';
              }
          }
      }
  });

  heroTimeline
      .to([".hero-subtitle", ".hero-actions"], {
          opacity: 0,
          y: -30,
          duration: 0.15,
          ease: "power2.out"
      })
      .to(".hero-title", {
          scale: 80,
          duration: 0.5,
          ease: "power1.inOut",
          transformOrigin: "55.5% 45%"
      }, 0.1)
      .to(".hero-background", {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out"
      }, 0.2)
      .to(".hero-title", {
          scale: 400,
          duration: 0.25,
          ease: "power4.in",
          transformOrigin: "55.5% 45%"
      }, 0.6)
      .to(".hero-title", {
          scale: 450,
          duration: 0.1,
          ease: "none"
      }, 0.85);

  // Text animations
  const textContainer = document.querySelector('.features-text-container');
  
  ScrollTrigger.create({
      trigger: textContainer,
      start: "top 15%",
      end: "top -30%",
      scrub: 0.3,
      onUpdate: self => {
          const progress = self.progress;
          const lines = document.querySelectorAll('.features-text-line:not(.line-4) span');
          
          lines.forEach((line, index) => {
              const lineProgress = Math.max(0, Math.min(1, (progress - index * 0.25) * 2));
              const yPos = lineProgress * 120;
              
              gsap.set(line, {
                  y: `${yPos}%`,
                  opacity: 1 - lineProgress * 0.8
              });
          });
      }
  });

  // Background color change
  ScrollTrigger.create({
      trigger: ".spacer-section",
      start: "top 80%",
      end: "top 60%",
      scrub: 0.5,
      onUpdate: self => {
          const progress = self.progress;
          document.querySelector('.spacer-section').style.background = 
              `linear-gradient(to bottom, var(--primary-blue) ${(1-progress) * 100}%, #f8f9fa ${progress * 100}%)`;
      }
  });

  // Features section entrance animation
  gsap.fromTo(".features-section", 
      {
          opacity: 0,
          y: 50
      },
      {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".features-section",
              start: "top 99%",
              end: "top 80%",
              scrub: 0.5
          }
      }
  );

  // Initial fade-in for text lines
  gsap.fromTo(".features-text-line span", 
      {
          opacity: 0,
          y: 20
      },
      {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".features-text-container",
              start: "top 85%",
              end: "top 65%",
              scrub: 0.5
          }
      }
  );

  // Content section animations
  gsap.fromTo(".section-header", 
      {
          opacity: 0,
          x: -50
      },
      {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".what-we-do-section",
              start: "top 80%",
              end: "top 50%",
              scrub: 0.5
          }
      }
  );

  gsap.fromTo(".description-section", 
      {
          opacity: 0,
          x: 50
      },
      {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".description-section",
              start: "top 85%",
              end: "top 55%",
              scrub: 0.5
          }
      }
  );

  // Service cards animation
  ScrollTrigger.batch(".service-card", {
      onEnter: (elements) => {
          gsap.fromTo(elements, 
              {
                  opacity: 0,
                  x: 100,
                  scale: 0.9
              },
              {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  duration: 0.8,
                  stagger: 0.2,
                  ease: "power3.out",
                  overwrite: true
              }
          );
      },
      start: "top 90%",
      refreshPriority: -1
  });

  // Timeline section animations
  gsap.fromTo(".timeline-header", 
      {
          opacity: 0,
          y: 30
      },
      {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".timeline-section",
              start: "top 80%",
              end: "top 50%",
              scrub: 0.5
          }
      }
  );

  gsap.fromTo(".timeline-column", 
      {
          opacity: 0,
          y: 50,
          scale: 0.95
      },
      {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".timeline-container",
              start: "top 85%",
              end: "top 55%",
              scrub: 0.5
          }
      }
  );

  // Timeline items animation
  ScrollTrigger.batch(".timeline-item", {
      onEnter: (elements) => {
          gsap.fromTo(elements, 
              {
                  opacity: 0,
                  x: -30
              },
              {
                  opacity: 1,
                  x: 0,
                  duration: 0.6,
                  stagger: 0.1,
                  ease: "power3.out",
                  overwrite: true
              }
          );
      },
      start: "top 95%",
      refreshPriority: -1
  });

  // Stats section animations
  gsap.fromTo(".stats-image", 
      {
          opacity: 0,
          x: -50,
          scale: 0.9
      },
      {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".stats-section",
              start: "top 80%",
              end: "top 50%",
              scrub: 0.5
          }
      }
  );

  gsap.fromTo(".stats-text", 
      {
          opacity: 0,
          x: 50
      },
      {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".stats-section",
              start: "top 75%",
              end: "top 45%",
              scrub: 0.5
          }
      }
  );

  // Animated counter function
  function animateCounter(element, target, duration = 2000) {
      let start = 0;
      const startTime = performance.now();
      
      function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(start + (target - start) * easeOutQuart);
          
          element.textContent = current.toLocaleString();
          
          if (progress < 1) {
              requestAnimationFrame(update);
          } else {
              element.textContent = target.toLocaleString();
          }
      }
      
      requestAnimationFrame(update);
  }

  // Stats counter animation
  ScrollTrigger.create({
      trigger: ".stats-grid",
      start: "top 80%",
      onEnter: () => {
          document.querySelectorAll('.stat-number').forEach(counter => {
              const target = parseInt(counter.dataset.target);
              animateCounter(counter, target);
          });
      },
      once: true
  });

  // Team section animations
  gsap.fromTo(".team-header", 
      {
          opacity: 0,
          y: 30
      },
      {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: ".team-section",
              start: "top 80%",
              end: "top 50%",
              scrub: 0.5
          }
      }
  );

  // Advisory board section animations
  gsap.fromTo("#advisory .team-header", 
      {
          opacity: 0,
          y: 30
      },
      {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
              trigger: "#advisory",
              start: "top 80%",
              end: "top 50%",
              scrub: 0.5
          }
      }
  );

  // Team member cards animation
  ScrollTrigger.batch(".team-member", {
      onEnter: (elements) => {
          gsap.fromTo(elements, 
              {
                  opacity: 0,
                  y: 50,
                  scale: 0.9
              },
              {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  stagger: 0.1,
                  ease: "power3.out",
                  overwrite: true
              }
          );
      },
      start: "top 90%",
      refreshPriority: -1
  });

  // Sponsor cards animation
  ScrollTrigger.batch(".sponsor-card", {
      onEnter: (elements) => {
          gsap.fromTo(elements, 
              {
                  opacity: 0,
                  y: 30,
                  scale: 0.95
              },
              {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  stagger: 0.1,
                  ease: "power2.out",
                  overwrite: true
              }
          );
      },
      start: "top 90%",
      refreshPriority: -1
  });

  // Sponsors header animation
  gsap.fromTo(".sponsors-header", 
      {
          opacity: 0,
          y: 30
      },
      {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
              trigger: ".sponsors-section",
              start: "top 80%",
              once: true
          }
      }
  );

  // Hexagon animations
  gsap.fromTo(".hexagon", 
      {
          opacity: 0,
          scale: 0,
          rotation: -180
      },
      {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.2,
          stagger: 0.3,
          ease: "back.out(1.7)",
          scrollTrigger: {
              trigger: ".what-we-do-section",
              start: "top 70%",
              end: "top 40%",
              scrub: 0.5
          }
      }
  );

  // Enhanced action card interactions
  document.querySelectorAll('.action-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
          gsap.to(card, {
              scale: 1.05,
              y: -8,
              duration: 0.3,
              ease: "power2.out"
          });
      });
      
      card.addEventListener('mouseleave', () => {
          gsap.to(card, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out"
          });
      });
  });

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const href = this.getAttribute('href');
          
          // Handle home link (scroll to top)
          if (href === '#') {
              window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
              });
              return;
          }
          
          const target = document.querySelector(href);
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });

  // Initial page load animation
  gsap.fromTo(".hero-content > *", 
      {
          opacity: 0,
          y: 30
      },
      {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.5
      }
  );







  // Portfolio section
  // Get elements
  const portfolioContainer = document.getElementById('portfolioContainer');
  const spacerContent = document.querySelector('.spacer-content');
  const healthSoftwareTitle = document.getElementById('healthSoftwareTitle');
  const therapeuticsTitle = document.getElementById('therapeuticsTitle');
  const healthSoftwareWrapper = document.getElementById('health-software');
  const therapeuticsWrapper = document.getElementById('therapeutics');
  const stickyTitles = document.querySelector('.sticky-titles');

  // Show/hide titles based on portfolio container visibility (no pin needed)
  ScrollTrigger.create({
      trigger: portfolioContainer,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
          stickyTitles.style.display = "block";
      },
      onLeave: () => {
          stickyTitles.style.display = "none";
      },
      onEnterBack: () => {
          stickyTitles.style.display = "block";
      },
      onLeaveBack: () => {
          stickyTitles.style.display = "none";
      }
  });

  // Health Software Title Animation - with explicit hiding of therapeutics
  ScrollTrigger.create({
      trigger: healthSoftwareWrapper,
      start: "top bottom",
      end: "bottom center", // End earlier to prevent overlap
      onEnter: () => {
          healthSoftwareTitle.style.opacity = "1";
          therapeuticsTitle.style.opacity = "0"; // Explicitly hide therapeutics
      },
      onLeave: () => {
          healthSoftwareTitle.style.opacity = "0";
      },
      onEnterBack: () => {
          healthSoftwareTitle.style.opacity = "1";
          therapeuticsTitle.style.opacity = "0"; // Explicitly hide therapeutics
          portfolioContainer.classList.remove('beige-bg');
      },
      onLeaveBack: () => {
          healthSoftwareTitle.style.opacity = "0";
      }
  });

  // Therapeutics Title and Background Animation - with explicit hiding of health software
  ScrollTrigger.create({
      trigger: therapeuticsWrapper,
      start: "top center", // Start later to prevent overlap
      end: "bottom top",
      onEnter: () => {
          // Change background to beige
          portfolioContainer.classList.add('beige-bg');
          // Explicitly switch titles
          healthSoftwareTitle.style.opacity = "0";
          therapeuticsTitle.style.opacity = "1";
      },
      onLeave: () => {
          therapeuticsTitle.style.opacity = "0";
      },
      onEnterBack: () => {
          portfolioContainer.classList.add('beige-bg');
          // Explicitly switch titles
          healthSoftwareTitle.style.opacity = "0";
          therapeuticsTitle.style.opacity = "1";
      },
      onLeaveBack: () => {
          console.log("Switching back to Health Software");
          // Change background back to dark
          portfolioContainer.classList.remove('beige-bg');
          // Explicitly switch titles back
          therapeuticsTitle.style.opacity = "0";
          healthSoftwareTitle.style.opacity = "1";
      }
  });

  // Spacer content reveal
  if (spacerContent) {
      ScrollTrigger.create({
          trigger: '.portfolio-spacer',
          start: "top center",
          onEnter: () => {
              spacerContent.style.opacity = "1";
              // Hide both titles when application section appears
              healthSoftwareTitle.style.opacity = "0";
              therapeuticsTitle.style.opacity = "0";
          },
          onLeaveBack: () => {
              spacerContent.style.opacity = "0";
              // Show therapeutics title when leaving application section
              therapeuticsTitle.style.opacity = "1";
          }
      });
  }

  // Click effects for startup images
  document.querySelectorAll('.startup-image').forEach(image => {
      image.addEventListener('click', function() {
          const startupId = this.getAttribute('data-startup');
          
          // Create a timeline for the click effect
          const clickTl = gsap.timeline();
          
          clickTl.to(this, {
              scale: 0.92,
              duration: 0.15,
              ease: "power2.inOut"
          })
          .to(this, {
              scale: 1.05,
              duration: 0.25,
              ease: "elastic.out(1, 0.3)"
          })
          .to(this, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
          });
      });
  });
});