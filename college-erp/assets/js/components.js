/**
 * ============================================================
 * COMPONENT LOADER - College ERP Management System
 * File: assets/js/components.js
 * Description: Fetches and injects sidebar, navbar, footer HTML
 *              components into all dashboard pages dynamically.
 *              In JSP Phase, replace with JSP include directives.
 * ============================================================
 */

'use strict';

/**
 * Loads an HTML file via fetch and injects it into a target element.
 * @param {string} componentPath - Relative or absolute URL to the HTML file
 * @param {string} containerId   - ID of the DOM element to inject into
 * @param {Function} [callback]  - Optional callback after injection
 */
async function loadComponent(componentPath, containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[ERP] Container #${containerId} not found`);
        return;
    }

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${componentPath}`);

        const html = await response.text();
        container.innerHTML = html;

        // Execute any <script> tags injected by the component
        container.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        if (typeof callback === 'function') callback();

    } catch (err) {
        console.error(`[ERP] Failed to load component (${componentPath}):`, err.message);
        container.innerHTML = `<div style="padding: 20px; background: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: 8px; margin: 10px;">
            <strong>&#10071; Component Load Error!</strong><br>
            Could not load <code>${componentPath}</code>. <br>
            If you are opening this file directly (<code>file:///</code>), the browser is blocking it for security reasons (CORS policy).<br>
            <strong>Solution:</strong> Please run this project through a local server (e.g., Live Server in VS Code, XAMPP, or a Node.js server) and access it via <code>http://localhost...</code>
        </div>`;
    }
}

/**
 * ERP Component Initializer
 * Call this on every dashboard page to inject sidebar, navbar, footer.
 *
 * @param {Object} options
 * @param {string} options.root          - Relative path from current file to college-erp root
 * @param {string} [options.pageTitle]   - Title shown in navbar
 * @param {string} [options.breadcrumb]  - Breadcrumb shown in navbar
 * @param {string} [options.userRole]    - Current role ('Admin', 'Faculty', 'Student')
 */
async function initERPComponents(options = {}) {
    const {
        root = '../../',
        pageTitle = 'Dashboard',
        breadcrumb = 'Dashboard',
        userRole = 'Admin'
    } = options;

    // User session data (replace with actual session logic in JSP phase)
    const sessionUser = JSON.parse(sessionStorage.getItem('erp_user') || 'null') || {
        name: 'Admin User',
        email: 'admin@college.edu',
        role: userRole,
        initials: 'AD'
    };

    // Load Sidebar
    await loadComponent(`${root}components/sidebar.html`, 'sidebar-container', () => {
        const el = (id) => document.getElementById(id);

        // Highlight active menu link based on current page filename
        const currentFile = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = (link.getAttribute('href') || '').split('/').pop();
            if (href && href === currentFile) {
                link.classList.add('active');
                // Open parent submenu
                const parentGroup = link.closest('.nav-group');
                if (parentGroup) parentGroup.classList.add('open');
            }
        });

        // Role-based Access Control for Sidebar Menu
        const roleConfig = {
            'Admin': ['*'],
            'Faculty': [
                '../../index.html',
                '../student/view-students.html',
                '../faculty/faculty-list.html',
                '../course/assign-faculty.html',
                '../course/course-list.html',
                '../exam/marks-entry.html',
                '../exam/result-display.html',
                '../placement/eligibility-list.html',
                '../placement/placement-status.html',
                '../auth/profile.html',
                '../auth/settings.html',
                '../auth/change-password.html'
            ],
            'Student': [
                '../../index.html',
                '../course/course-list.html',
                '../exam/result-display.html',
                '../fees/payment-entry.html',
                '../fees/receipt.html',
                '../fees/pending-fees.html',
                '../placement/placement-status.html',
                '../auth/profile.html',
                '../auth/settings.html',
                '../auth/change-password.html'
            ]
        };

        const isAdmin = sessionUser.role === 'Admin';
        const allowedLinks = roleConfig[sessionUser.role] || [];

        // Special Admin Links
        if (isAdmin && el('adminApprovalsLink')) {
            el('adminApprovalsLink').style.display = 'block';
        }

        if (!isAdmin) {
            // Remove non-allowed submenu links
            document.querySelectorAll('.nav-submenu .nav-item a.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (!allowedLinks.includes(href)) {
                    link.parentElement.remove();
                }
            });

            // Remove non-allowed top-level links (like Dashboard) if needed
            document.querySelectorAll('#sidebarNav > .nav-item > a.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (!allowedLinks.includes(href)) {
                    link.parentElement.remove();
                }
            });

            // Clean up empty nav groups
            document.querySelectorAll('.nav-group').forEach(group => {
                const submenu = group.querySelector('.nav-submenu');
                if (submenu && submenu.children.length === 0) {
                    group.remove();
                }
            });

            // Clean up orphaned section labels
            const sidebarNav = document.getElementById('sidebarNav');
            if (sidebarNav) {
                let children = Array.from(sidebarNav.children);
                for (let i = 0; i < children.length; i++) {
                    const el = children[i];
                    if (el.classList.contains('nav-section-label')) {
                        // If there is no next sibling, or the next sibling is another section label, remove this one
                        let next = el.nextElementSibling;
                        if (!next || next.classList.contains('nav-section-label')) {
                            el.remove();
                        }
                    }
                }
            }
        }
    });

    // Load Navbar
    await loadComponent(`${root}components/navbar.html`, 'navbar-container', () => {
        const el = (id) => document.getElementById(id);
        if (el('navbarPageTitle')) el('navbarPageTitle').textContent = pageTitle;
        if (el('navbarBreadcrumb')) el('navbarBreadcrumb').textContent = breadcrumb;
        if (el('navUserAvatar')) el('navUserAvatar').textContent = sessionUser.initials || 'U';
        if (el('navUserName')) el('navUserName').textContent = sessionUser.name || 'User';
        if (el('navUserRole')) el('navUserRole').textContent = sessionUser.role || 'User';
        if (el('dropdownUserName')) el('dropdownUserName').textContent = sessionUser.name || 'User';
        if (el('dropdownUserEmail')) el('dropdownUserEmail').textContent = sessionUser.email || '';

        // Bind auth dropdown links
        if (el('dropdownProfileBtn')) el('dropdownProfileBtn').onclick = () => window.location.href = `${root}pages/auth/profile.html`;
        if (el('dropdownSettingsBtn')) el('dropdownSettingsBtn').onclick = () => window.location.href = `${root}pages/auth/settings.html`;
        if (el('dropdownPasswordBtn')) el('dropdownPasswordBtn').onclick = () => window.location.href = `${root}pages/auth/change-password.html`;
    });

    // Load Footer
    await loadComponent(`${root}components/footer.html`, 'footer-container');

    // Init shared JS behaviors (sidebar toggle, dropdowns, etc.)
    if (typeof sidebarToggle === 'function') sidebarToggle();
    if (typeof initSubmenus === 'function') initSubmenus();
    if (typeof initDropdowns === 'function') initDropdowns();
    if (typeof ERP_Modal !== 'undefined') ERP_Modal.init();
}
