/**
 * ============================================================
 * MAIN JS UTILITIES - College ERP Management System
 * File: assets/js/main.js
 * Description: Global shared JS — sidebar toggle, dropdowns,
 *              form validation, modal handling, notifications
 * ============================================================
 */

'use strict';

/* ============================================================
   0. THEME INITIALIZATION
   ============================================================ */
(function initTheme() {
    const savedTheme = localStorage.getItem('erp_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

/* ============================================================
   1. SIDEBAR TOGGLE
   ============================================================ */
const sidebarToggle = () => {
    const sidebar = document.querySelector('.sidebar');
    const navbar = document.querySelector('.navbar');
    const main = document.querySelector('.erp-main');

    if (!sidebar) return;

    const STORAGE_KEY = 'erp_sidebar_collapsed';
    const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';

    // Apply stored state on load
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        if (navbar) navbar.classList.add('sidebar-collapsed');
        if (main) main.classList.add('sidebar-collapsed');
    }

    const btn = document.querySelector('.sidebar-toggle');
    if (!btn || btn.dataset.sidebarInit) return;
    btn.dataset.sidebarInit = 'true';

    btn.addEventListener('click', () => {
        const collapsed = sidebar.classList.toggle('collapsed');
        if (navbar) navbar.classList.toggle('sidebar-collapsed');
        if (main) main.classList.toggle('sidebar-collapsed');
        localStorage.setItem(STORAGE_KEY, collapsed);
    });
};

/* ============================================================
   2. SIDEBAR SUBMENU TOGGLE
   ============================================================ */
const initSubmenus = () => {
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
        const link = group.querySelector(':scope > .nav-link');
        if (!link || link.dataset.submenuInit) return;
        link.dataset.submenuInit = 'true';

        link.addEventListener('click', e => {
            e.preventDefault();
            // Close other open groups
            navGroups.forEach(g => {
                if (g !== group) g.classList.remove('open');
            });
            group.classList.toggle('open');
        });
    });

    // Auto-open the group containing the active link
    const activeLink = document.querySelector('.nav-submenu .nav-link.active');
    if (activeLink) {
        const parentGroup = activeLink.closest('.nav-group');
        if (parentGroup) parentGroup.classList.add('open');
    }
};

/* ============================================================
   3. ACTIVE NAV LINK
   ============================================================ */
const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').split('/').pop();
        if (href && href === currentPage) {
            link.classList.add('active');
        }
    });
};

/* ============================================================
   4. DROPDOWN MENUS
   ============================================================ */
let dropdownsInitialized = false;
const initDropdowns = () => {
    if (dropdownsInitialized) return;
    dropdownsInitialized = true;

    // Close all dropdowns when clicking outside
    document.addEventListener('click', e => {
        if (!e.target.closest('.nav-dropdown') && !e.target.closest('.user-profile')) {
            document.querySelectorAll('.nav-dropdown-menu.active, .user-menu.active')
                .forEach(d => d.classList.remove('active'));
        }
    });

    // Use event delegation for dynamically loaded navbar elements
    document.addEventListener('click', e => {
        const notifBtn = e.target.closest('#notifBtn');
        if (notifBtn) {
            e.stopPropagation();
            const notifMenu = document.querySelector('#notifMenu');
            if (notifMenu) notifMenu.classList.toggle('active');
            document.querySelector('#userMenu')?.classList.remove('active');
            return;
        }

        const userProfile = e.target.closest('#userProfile');
        if (userProfile && !e.target.closest('#userMenu')) { // dont close if clicking inside the menu itself
            e.stopPropagation();
            const userMenu = document.querySelector('#userMenu');
            if (userMenu) userMenu.classList.toggle('active');
            document.querySelector('#notifMenu')?.classList.remove('active');
        }
    });
};

/* ============================================================
   5. FORM VALIDATION UTILITY
   ============================================================ */
/**
 * Validates a form element by checking required fields.
 * Adds/removes .error class and shows .form-error messages.
 *
 * @param {HTMLFormElement} form
 * @returns {boolean} true if all fields are valid
 */
const validateForm = (form) => {
    if (!form) return false;

    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.form-error.visible').forEach(el => el.classList.remove('visible'));

    const fields = form.querySelectorAll('[required]');
    fields.forEach(field => {
        let fieldValid = true;
        const value = field.value.trim();

        if (!value) {
            fieldValid = false;
        } else if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) fieldValid = false;
        } else if (field.type === 'tel') {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value)) fieldValid = false;
        } else if (field.dataset.minLength) {
            if (value.length < parseInt(field.dataset.minLength)) fieldValid = false;
        }

        if (!fieldValid) {
            isValid = false;
            field.classList.add('error');
            const errorMsg = field.closest('.form-group, .input-group')?.querySelector('.form-error');
            if (errorMsg) errorMsg.classList.add('visible');
        }
    });

    // Shake animation on invalid submit
    if (!isValid) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.style.animation = 'shake 0.4s ease';
            setTimeout(() => submitBtn.style.animation = '', 400);
        }
    }

    return isValid;
};

/* ============================================================
   6. MODAL UTILITY
   ============================================================ */
const ERP_Modal = {
    /**
     * Open a modal by its overlay ID
     * @param {string} overlayId
     */
    open(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) overlay.classList.add('active');
    },

    /**
     * Close a modal by its overlay ID
     * @param {string} overlayId
     */
    close(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) overlay.classList.remove('active');
    },

    /**
     * Initialize close behavior for all modals
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        // Close buttons
        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const overlay = btn.closest('.modal-overlay');
                if (overlay) overlay.classList.remove('active');
            });
        });

        // Open buttons
        document.querySelectorAll('[data-modal-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const overlayId = btn.dataset.modalOpen;
                ERP_Modal.open(overlayId);
            });
        });
    }
};

/* ============================================================
   7. TOAST NOTIFICATIONS
   ============================================================ */
const ERP_Toast = {
    /**
     * Show a toast notification
     * @param {string} message
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {number} duration - milliseconds
     */
    show(message, type = 'info', duration = 3500) {
        // Create container if missing
        let container = document.getElementById('erp-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'erp-toast-container';
            container.style.cssText = `
                position: fixed; bottom: 24px; right: 24px;
                z-index: 99999; display: flex; flex-direction: column; gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        const colors = {
            success: { bg: '#e8f8ee', border: '#1da462', text: '#1da462' },
            error: { bg: '#ffeaea', border: '#d63031', text: '#d63031' },
            warning: { bg: '#fff8e6', border: '#e8a020', text: '#c47d10' },
            info: { bg: '#e8f4fb', border: '#2874a6', text: '#2874a6' },
        };
        const c = colors[type] || colors.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            display: flex; align-items: center; gap: 10px;
            padding: 12px 18px; background: ${c.bg};
            border: 1px solid ${c.border}; border-left: 4px solid ${c.border};
            border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            font-size: 0.88rem; color: ${c.text}; font-family: var(--font-family);
            min-width: 260px; max-width: 360px;
            animation: toastIn 0.3s ease;
        `;

        toast.innerHTML = `
            <span style="font-weight:700;font-size:1rem">${icons[type]}</span>
            <span style="flex:1;color: var(--text-body, #3a4a5c)">${message}</span>
            <button onclick="this.parentElement.remove()" 
                style="background:none;border:none;cursor:pointer;color:var(--text-muted,#6b7c93);font-size:1rem;padding:0;line-height:1">✕</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

/* ============================================================
   8. TABLE SEARCH FILTER
   ============================================================ */
/**
 * Filters a table based on a search input
 * @param {string} inputId   - ID of the search input
 * @param {string} tableId   - ID of the table
 * @param {number[]} columns - Column indices to search (default: all)
 */
const initTableSearch = (inputId, tableId, columns = null) => {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const toSearch = columns ? columns.map(i => cells[i]) : cells;
            const text = toSearch.map(c => c?.textContent.toLowerCase()).join(' ');
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
};

/* ============================================================
   9. PRINT UTILITY
   ============================================================ */
const printSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>College ERP - Print</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #1a3c6e; color: white; }
                .no-print { display: none; }
            </style>
        </head>
        <body>${section.innerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

/* ============================================================
   10. INITIALIZE ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    sidebarToggle();
    initSubmenus();
    setActiveNavLink();
    initDropdowns();
    ERP_Modal.init();

    // Password toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        if (btn.dataset.toggleInit) return;
        btn.dataset.toggleInit = 'true';
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling || btn.closest('.input-group')?.querySelector('input');
            if (!input) return;
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            btn.innerHTML = isText ? '&#128065;&#xFE0E;' : '&#128064;&#xFE0E;';
        });
    });

    // Current date display
    const dateEls = document.querySelectorAll('[data-current-date]');
    if (dateEls.length) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formatted = now.toLocaleDateString('en-IN', options);
        dateEls.forEach(el => el.textContent = formatted);
    }
});
