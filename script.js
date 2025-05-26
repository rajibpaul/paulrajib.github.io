// Function to handle smooth scrolling to a specific element
function scrollToElement(element) {
    if (!element) return;

    // Get the header height
    const header = document.querySelector('.navbar');
    const headerHeight = header ? header.offsetHeight : 80;
    
    // Add a temporary class to handle Safari's fixed position behavior
    document.documentElement.classList.add('safari-scroll-fix');
    
    // Calculate the target position
    const elementRect = element.getBoundingClientRect();
    const targetPosition = elementRect.top + window.pageYOffset - headerHeight - 20;
    
    // For Safari, use a direct scroll with a small delay
    window.scrollTo(0, targetPosition);
    
    // Double check and adjust if needed
    setTimeout(() => {
        const currentPosition = window.pageYOffset;
        const currentElementRect = element.getBoundingClientRect();
        const currentTargetPosition = currentElementRect.top + window.pageYOffset - headerHeight - 20;
        
        if (Math.abs(currentPosition - currentTargetPosition) > 5) {
            window.scrollTo(0, currentTargetPosition);
        }
        
        // Remove the temporary class
        setTimeout(() => {
            document.documentElement.classList.remove('safari-scroll-fix');
        }, 100);
        
        // Focus the element for better accessibility
        element.setAttribute('tabindex', '-1');
        element.focus();
        element.removeAttribute('tabindex');
    }, 50);
}

// Function to handle hash-based navigation
function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash) {
        // Small delay to ensure the DOM is fully loaded
        setTimeout(() => {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // For Safari, we need to reset the scroll position first
                if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    
                    // Add a small delay to ensure the reset takes effect
                    setTimeout(() => {
                        scrollToElement(targetElement);
                        
                        // One more check after a short delay
                        setTimeout(() => {
                            const header = document.querySelector('.navbar');
                            const headerHeight = header ? header.offsetHeight : 80;
                            const elementRect = targetElement.getBoundingClientRect();
                            const targetPosition = elementRect.top + window.pageYOffset - headerHeight - 20;
                            window.scrollTo(0, targetPosition);
                        }, 100);
                    }, 10);
                } else {
                    // For other browsers, use the standard approach
                    window.scrollTo(0, 0);
                    setTimeout(() => {
                        scrollToElement(targetElement);
                    }, 10);
                }
            }
        }, 100);
    } else {
        // If no hash, scroll to top
        window.scrollTo(0, 0);
    }
}

// Smooth scroll for anchor links and handle hash links on page load
window.addEventListener('load', function() {
    // Handle click on anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            // If the link is to the same page, prevent default and scroll
            if (this.pathname === window.location.pathname) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    scrollToElement(targetElement);
                    // Update URL without adding to history
                    window.history.replaceState({}, '', targetId);
                }
            }
        });
    });

    // Initial hash navigation
    handleHashNavigation();

    // Also handle hash changes
    window.addEventListener('hashchange', handleHashNavigation, false);
});

// Add scroll reveal animation to sections
window.addEventListener('scroll', revealSections);

function revealSections() {
    const sections = document.querySelectorAll('section');
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < windowHeight - revealPoint) {
            section.classList.add('active');
        }
    });
}

// Add hover effect to project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Scroll to top on page load/refresh
window.onload = function() {
    // Scroll to top immediately when the page loads
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Handle browsers that might restore scroll position
    setTimeout(() => {
        if (window.pageYOffset > 0) {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
    }, 0);
};

// Reset scroll position before the page unloads
window.onbeforeunload = function() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Scroll to top when the page finishes loading
    window.scrollTo(0, 0);
    
    // Add fade-in animation to profile section
    const profile = document.querySelector('.profile');
    if (profile) {
        profile.style.opacity = '0';
        profile.style.transform = 'translateY(20px)';
        profile.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        // Trigger reflow
        void profile.offsetWidth;

        // Apply the animation
        profile.style.opacity = '1';
        profile.style.transform = 'translateY(0)';
    }

    // Add typing effect to title
    const title = document.querySelector('.title');
    const text = title.textContent;
    title.textContent = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    setTimeout(typeWriter, 1000);

    // Fetch Google Scholar stats
    fetchGoogleScholarStats();
});

// Function to fetch Google Scholar stats
async function fetchGoogleScholarStats() {
    try {
        const response = await fetch('https://scholar.google.co.kr/citations?user=p4MPT9cAAAAJ&hl=en');
        const text = await response.text();
        
        // Parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Extract stats
        const stats = doc.querySelectorAll('.gsc_rsb_std');
        const publications = stats[0]?.textContent || '0';
        const citations = stats[1]?.textContent || '0';
        const hIndex = stats[2]?.textContent || '0';
        
        // Update the stats in the publications.html
        const statsItems = document.querySelectorAll('.stat-number');
        statsItems[0].textContent = publications;
        statsItems[1].textContent = citations;
        statsItems[2].textContent = hIndex;
        
        // Update every 10 minutes
        setTimeout(fetchGoogleScholarStats, 10 * 60 * 1000);
    } catch (error) {
        console.error('Error fetching Google Scholar stats:', error);
        // If there's an error, retry after 5 minutes
        setTimeout(fetchGoogleScholarStats, 5 * 60 * 1000);
    }
}

// Add skill progress animation
const skillItems = document.querySelectorAll('.skill-category li');
skillItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.color = getComputedStyle(document.documentElement)
            .getPropertyValue('--secondary-color');
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.color = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-color');
    });
});

// Publication filtering
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const publications = document.querySelectorAll('.publication-entry');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            publications.forEach(pub => {
                if (filterValue === 'all') {
                    pub.style.display = 'block';
                    // Show year headings
                    const yearHeading = pub.previousElementSibling;
                    if (yearHeading && yearHeading.tagName === 'H2') {
                        yearHeading.style.display = 'block';
                    }
                } else {
                    const pubType = pub.querySelector('.pub-type').classList.contains(filterValue);
                    pub.style.display = pubType ? 'block' : 'none';

                    // Handle year headings visibility
                    const yearHeading = pub.previousElementSibling;
                    if (yearHeading && yearHeading.tagName === 'H2') {
                        // Check if any visible publications follow this year heading
                        let hasVisiblePubs = false;
                        let nextElement = pub;
                        while (nextElement && !nextElement.matches('h2')) {
                            if (nextElement.classList.contains('publication-entry')) {
                                const nextPubType = nextElement.querySelector('.pub-type').classList.contains(filterValue);
                                if (nextPubType) {
                                    hasVisiblePubs = true;
                                    break;
                                }
                            }
                            nextElement = nextElement.nextElementSibling;
                        }
                        yearHeading.style.display = hasVisiblePubs ? 'block' : 'none';
                    }
                }
            });
        });
    });

    // Check if we arrived via a hash link
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
            // Use our custom scroll function for consistent behavior
            scrollToElement(section);
            
            // Add a highlight effect to the heading
            const heading = section.querySelector('h2');
            if (heading) {
                heading.classList.add('highlight');
                setTimeout(() => {
                    heading.classList.remove('highlight');
                }, 2000);
            }
        }
    }
});

// Title rotator for the main title section
document.addEventListener("DOMContentLoaded", function() {
    const titles = [
        "Postdoctoral Researcher",
        "Ex-Assistant Professor"
    ];
    const el = document.querySelector('.title-rotator .title');
    let titleIndex = 0;
    let charIndex = 0;
    let typing = true;

    function type() {
        if (typing) {
            if (charIndex < titles[titleIndex].length) {
                el.textContent += titles[titleIndex][charIndex];
                charIndex++;
                setTimeout(type, 130); // slower typing speed
            } else {
                typing = false;
                setTimeout(type, 1500); // pause before erasing
            }
        } else {
            if (charIndex > 0) {
                el.textContent = titles[titleIndex].slice(0, charIndex - 1);
                charIndex--;
                setTimeout(type, 70); // slower erasing speed
            } else {
                typing = true;
                titleIndex = (titleIndex + 1) % titles.length;
                setTimeout(type, 600); // pause before typing next
            }
        }
    }
    type();
});