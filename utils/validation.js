const path = require('path');

const allowedProjectRoles = new Set(['admin', 'viewer']);

const trimString = (value) => typeof value === 'string' ? value.trim() : '';

const requireText = (value, fieldName) => {
    const trimmed = trimString(value);
    if (!trimmed) return { error: `${fieldName} is required.` };
    return { value: trimmed };
};

const normalizeProjectRole = (role) => {
    const normalized = trimString(role).toLowerCase();
    return allowedProjectRoles.has(normalized) ? normalized : null;
};

const cleanOriginalFileName = (name) => {
    const base = path.basename(trimString(name)).replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, '_');
    return base || 'uploaded-file';
};

module.exports = {
    trimString,
    requireText,
    normalizeProjectRole,
    cleanOriginalFileName
};
