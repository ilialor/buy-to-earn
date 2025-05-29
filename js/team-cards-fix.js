/**
 * Team Cards Fix JS
 * 
 * This script fixes the team cards layout issues by directly manipulating
 * the DOM structure and applying inline styles where needed.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix team cards layout
    fixTeamCards();
});

/**
 * Fixes the team cards layout issues
 */
function fixTeamCards() {
    // Get all team members
    const teamMembers = document.querySelectorAll('.project-team-container .team-member');
    
    teamMembers.forEach(member => {
        // Fix avatar container
        fixAvatarContainer(member);
        
        // Combine role and specialization
        combineRoleAndSpecialization(member);
        
        // Limit bio text
        limitBioText(member);
        
        // Make contact button more compact
        compactifyContactButton(member);
    });
}

/**
 * Fixes the avatar container to ensure proper circular display
 * @param {HTMLElement} memberCard - The team member card element
 */
function fixAvatarContainer(memberCard) {
    const avatarContainer = memberCard.querySelector('.team-member-avatar');
    if (!avatarContainer) return;
    
    // Reset any problematic styles
    avatarContainer.style.position = 'relative';
    avatarContainer.style.width = '90px';
    avatarContainer.style.height = '90px';
    avatarContainer.style.borderRadius = '50%';
    avatarContainer.style.overflow = 'hidden';
    avatarContainer.style.margin = '0 auto 15px';
    avatarContainer.style.paddingBottom = '0';
    
    // Fix the image inside
    const avatarImg = avatarContainer.querySelector('img');
    if (avatarImg) {
        avatarImg.style.position = 'static';
        avatarImg.style.width = '100%';
        avatarImg.style.height = '100%';
        avatarImg.style.objectFit = 'cover';
        avatarImg.style.display = 'block';
    }
}

/**
 * Combines role and specialization into a single line
 * @param {HTMLElement} memberCard - The team member card element
 */
function combineRoleAndSpecialization(memberCard) {
    const roleElement = memberCard.querySelector('.team-member-role');
    const specializationElement = memberCard.querySelector('.specialization-indicator');
    
    if (roleElement && specializationElement) {
        const role = roleElement.textContent.trim();
        const specialization = specializationElement.textContent.trim();
        
        // Combine role and specialization with " | " separator
        const combinedRole = `${role} | ${specialization}`;
        
        // Update the role element with combined text
        roleElement.textContent = combinedRole;
        roleElement.style.fontSize = '14px';
        roleElement.style.color = '#6c757d';
        roleElement.style.margin = '0 0 12px 0';
        roleElement.style.padding = '0';
        roleElement.style.border = 'none';
        
        // Hide the specialization element
        specializationElement.style.display = 'none';
    }
}

/**
 * Limits bio text to 3-4 lines with ellipsis
 * @param {HTMLElement} memberCard - The team member card element
 */
function limitBioText(memberCard) {
    const bioElement = memberCard.querySelector('.team-member-bio');
    if (!bioElement) return;
    
    bioElement.style.fontSize = '14px';
    bioElement.style.lineHeight = '1.4';
    bioElement.style.color = '#6c757d';
    bioElement.style.marginBottom = '12px';
    bioElement.style.display = '-webkit-box';
    bioElement.style.webkitLineClamp = '3';
    bioElement.style.webkitBoxOrient = 'vertical';
    bioElement.style.overflow = 'hidden';
    bioElement.style.textOverflow = 'ellipsis';
    bioElement.style.maxHeight = '4.2em';
}

/**
 * Makes the contact button more compact
 * @param {HTMLElement} memberCard - The team member card element
 */
function compactifyContactButton(memberCard) {
    const contactButton = memberCard.querySelector('.contact-member-btn');
    if (!contactButton) return;
    
    // Replace text with just an icon
    contactButton.innerHTML = '<i class="fas fa-envelope"></i>';
    contactButton.setAttribute('data-tippy-content', 'Связаться');
    
    // Style the button
    contactButton.style.padding = '6px 10px';
    contactButton.style.fontSize = '12px';
    
    // Initialize tooltip if tippy.js is available
    if (typeof tippy === 'function') {
        tippy(contactButton);
    }
}
