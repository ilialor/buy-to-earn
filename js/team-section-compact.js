/**
 * Team Section Compact JS
 * 
 * This script transforms the team section to make it more compact
 * by combining roles and specializations and applying compact styling.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply compact styling to team members
    compactifyTeamSection();
});

/**
 * Makes the team section more compact by combining roles and specializations
 * and applying other compact styling modifications
 */
function compactifyTeamSection() {
    // Добавляем класс для компактного отображения к контейнеру команды
    const teamContainer = document.querySelector('.project-team-container');
    if (teamContainer) {
        teamContainer.classList.add('compact-team');
    }
    
    // Get all team members
    const teamMembers = document.querySelectorAll('.project-team-container .team-member');
    
    teamMembers.forEach(member => {
        // Исправляем структуру карточки команды
        fixTeamMemberCard(member);
        
        const roleElement = member.querySelector('.team-member-role');
        const specializationElement = member.querySelector('.specialization-indicator');
        
        // Only proceed if both elements exist
        if (roleElement && specializationElement) {
            // Get text content from both elements
            const role = roleElement.textContent.trim();
            const specialization = specializationElement.textContent.trim();
            
            // Combine role and specialization with " | " separator
            const combinedRole = `${role} | ${specialization}`;
            
            // Update the role element with combined text
            roleElement.textContent = combinedRole;
            roleElement.classList.add('combined-role');
        }
    });
    
    // Apply compact styling to contact buttons
    const contactButtons = document.querySelectorAll('.contact-member-btn');
    contactButtons.forEach(button => {
        // Make contact buttons more compact
        button.innerHTML = '<i class="fas fa-envelope"></i>';
        button.setAttribute('data-tippy-content', 'Связаться');
    });
    
    // Initialize tooltips for contact buttons
    if (typeof tippy === 'function') {
        tippy('[data-tippy-content]');
    }
}

/**
 * Fixes the structure of a team member card to ensure proper display
 * @param {HTMLElement} memberCard - The team member card element
 */
function fixTeamMemberCard(memberCard) {
    // Проверяем, есть ли аватар и нужно ли его исправить
    const avatarContainer = memberCard.querySelector('.team-member-avatar');
    if (avatarContainer) {
        // Убираем padding-bottom, который может вызывать овальную форму
        avatarContainer.style.paddingBottom = '0';
        
        // Исправляем размеры аватара
        const avatar = avatarContainer.querySelector('.team-member-img');
        if (avatar) {
            // Сбрасываем позиционирование
            avatar.style.position = 'static';
            avatar.style.width = '100%';
            avatar.style.height = '100%';
        }
    }
    
    // Исправляем контейнер информации
    const infoContainer = memberCard.querySelector('.team-member-info');
    if (infoContainer) {
        infoContainer.style.width = '100%';
    }
    
    // Скрываем индикатор специализации
    const specializationElement = memberCard.querySelector('.specialization-indicator');
    if (specializationElement) {
        specializationElement.style.display = 'none';
    }
}
