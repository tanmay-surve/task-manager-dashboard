const BASE_URL = 'http://localhost:8080/api';

let currentPage = 0, taskSize = 5;
let logPage = 0, logSize = 5;
let editingTaskId = null;
let confirmationResolve = null;

// DOM Elements
const taskTableBody = document.getElementById('taskTableBody');
const logTableBody = document.getElementById('logTableBody');
const taskPagination = document.getElementById('taskPagination');
const logPagination = document.getElementById('logPagination');
const taskModal = document.getElementById('taskModal');
const confirmationModal = document.getElementById('confirmationModal');
const notificationContainer = document.getElementById('notificationContainer');

// --- Initialization and Event Listeners ---

document.getElementById('tasksTab').onclick = () => showSection('tasks');
document.getElementById('logsTab').onclick = () => showSection('logs');
document.getElementById('createTaskBtn').onclick = openModal;
document.getElementById('closeModal').onclick = closeModal;
document.getElementById('saveTaskBtn').onclick = saveTask;
document.getElementById('searchInput').oninput = () => loadTasks(0);

// Confirmation Modal Listeners
document.getElementById('confirmCancelBtn').onclick = () => { confirmationModal.classList.add('hidden'); if (confirmationResolve) confirmationResolve(false); };
document.getElementById('confirmProceedBtn').onclick = () => { confirmationModal.classList.add('hidden'); if (confirmationResolve) confirmationResolve(true); };


showSection('tasks');
loadTasks(0);

// --- UI Functions (Modal, Notification, Confirmation) ---

/**
 * Shows a custom confirmation modal and returns a Promise resolving to true/false.
 * @param {string} message
 * @returns {Promise<boolean>}
 */
function showConfirmation(message) {
    document.getElementById('confirmationMessage').innerText = message;
    confirmationModal.classList.remove('hidden');
    return new Promise(resolve => {
        confirmationResolve = resolve;
    });
}

/**
 * Shows a transient notification alert.
 * @param {string} message
 * @param {'success' | 'error'} type
 */
function showNotification(message, type = 'success') {
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const notification = document.createElement('div');
    // Tailwind classes for notification styling and animation
    notification.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-x-full opacity-0`;
    notification.innerText = message;

    notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        notification.classList.remove('translate-x-0', 'opacity-100');
        notification.classList.add('translate-x-full', 'opacity-0');

        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showSection(section) {
    document.getElementById('tasksSection').style.display = section === 'tasks' ? 'block' : 'none';
    document.getElementById('logsSection').style.display = section === 'logs' ? 'block' : 'none';

    // Update nav button active state (Tailwind classes)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'font-extrabold');
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-800', 'font-medium');
    });
    const activeBtn = document.getElementById(section + 'Tab');
    activeBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-800', 'font-medium');
    activeBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'font-extrabold');

    // --- ENHANCEMENT: Reset logPage and ensure page 0 loads on tab switch for logs ---
    if (section === 'logs') {
        // Explicitly reset the global log page state to 0
        logPage = 0;
        loadLogs(logPage);
    }
}

function openModal() {
    editingTaskId = null;
    document.getElementById('modalTitle').innerText = 'Create New Task';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    taskModal.classList.remove('hidden');
}

function closeModal() {
    taskModal.classList.add('hidden');
}

// --- API and Data Functions ---

function fetchAPI(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';

    // Authentication header removed as per request.

    return new Promise(async (resolve, reject) => {
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const res = await fetch(url, options);
                if (res.ok) {
                    return resolve(res.json());
                } else {
                    // Attempt to read JSON error body
                    let errorBody = {};
                    try {
                        errorBody = await res.json();
                    } catch (e) {
                        errorBody = { message: res.statusText };
                    }

                    // Reject immediately without retry on non-network errors
                    console.error('API Error (Non-OK Status):', res.status, errorBody);
                    showNotification(`API Error: ${res.status} - ${errorBody.message || res.statusText}`, 'error');
                    return reject(res);
                }
            } catch (err) {
                // This catches network errors (CORS, server down, etc.)
                console.warn(`Fetch attempt ${i + 1} failed for ${url}.`, err);
                if (i === maxRetries - 1) {
                    showNotification('Network error: Could not reach API.', 'error');
                    return reject(err); // Final failure
                }
                // Exponential backoff
                await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
            }
        }
    });
}

function renderPagination(containerEl, totalPages, currentPage, loadFunction) {
    containerEl.innerHTML = '';
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Previous';
    prevBtn.disabled = currentPage === 0;
    prevBtn.className = `px-4 py-2 rounded-lg font-medium transition ${currentPage === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'}`;
    prevBtn.onclick = () => loadFunction(currentPage - 1);
    containerEl.appendChild(prevBtn);

    // Page Number Buttons
    const startPage = Math.max(0, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i + 1;
        pageBtn.className = `px-4 py-2 rounded-lg font-bold transition mx-1 ${i === currentPage ? 'bg-emerald-800 text-white shadow-xl' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        if (i !== currentPage) {
            pageBtn.onclick = () => loadFunction(i);
        }
        containerEl.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.className = `px-4 py-2 rounded-lg font-medium transition ${currentPage === totalPages - 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'}`;
    nextBtn.onclick = () => loadFunction(currentPage + 1);
    containerEl.appendChild(nextBtn);
}

function loadTasks(page) {
    currentPage = page;
    const q = document.getElementById('searchInput').value;
    const url = `${BASE_URL}/tasks?q=${q}&page=${page}&size=${taskSize}`;

    fetchAPI(url)
        .then(data => {
            taskTableBody.innerHTML = '';

            if (data.content && data.content.length > 0) {
                data.content.forEach(t => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-50 transition duration-150 ease-in-out";

                    // Use data-label for mobile responsiveness
                    // Escape single quotes for use in onclick
                    const safeTitle = t.title.replace(/'/g, "\\'");
                    const safeDesc = t.description.replace(/'/g, "\\'");

                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-label="ID">${t.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Title">${t.title}</td>
                        <td class="px-6 py-4 whitespace-normal text-sm text-gray-500" data-label="Description">${t.description}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Created At">${new Date(t.createdAt).toLocaleString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2" data-label="Actions">
                            <button class="px-3 py-1 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition shadow-sm text-xs" onclick="editTask(${t.id},'${safeTitle}', '${safeDesc}')">Edit</button>
                            <button class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm text-xs" onclick="deleteTask(${t.id})">Delete</button>
                        </td>
                    `;
                    taskTableBody.appendChild(tr);
                });
            } else {
                taskTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-500">No tasks found. Try adjusting your search.</td></tr>`;
            }

            renderPagination(taskPagination, data.totalPages, data.number, loadTasks);
        })
        .catch(err => {
             // Error handled in fetchAPI
        });
}

function loadLogs(page) {
    logPage = page;
    const url = `${BASE_URL}/logs?page=${page}&size=${logSize}`;

    fetchAPI(url)
        .then(data => {
            logTableBody.innerHTML = '';

            if (data.content && data.content.length > 0) {
                data.content.forEach(l => {
                    // Safely parse and stringify JSON content for display
                    let content = '';
                    try {
                        // Check if updatedContent is a string that needs parsing
                        content = l.updatedContent && typeof l.updatedContent === 'string'
                            ? JSON.stringify(JSON.parse(l.updatedContent), null, 2)
                            : JSON.stringify(l.updatedContent, null, 2) || '';
                    } catch (e) {
                        content = 'Error parsing content';
                        console.error('Log content parsing error:', e, l.updatedContent);
                    }

                    let colorClass;
                    // FIX: Convert action to lowercase for case-insensitive matching and include common creation verbs
                    const action = (l.action || '').toLowerCase();
                    if (action.includes('create') || action.includes('new') || action.includes('add') || action.includes('created')) { // Added 'created' to catch "TASK_CREATED"
                        colorClass = 'bg-emerald-500 text-white'; // Green for Create (using a bolder background for pill)
                    } else if (action.includes('update')) {
                        colorClass = 'bg-yellow-500 text-gray-800'; // Yellow/Orange for Update
                    } else if (action.includes('delete')) {
                        colorClass = 'bg-red-500 text-white'; // Red for Delete
                    } else {
                        colorClass = 'bg-gray-400 text-gray-800'; // Fallback for unknown
                    }

                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-50 transition duration-150 ease-in-out";

                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Timestamp">${new Date(l.timestamp).toLocaleString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" data-label="Action">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colorClass} shadow-sm">
                                ${l.action}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Task ID">${l.taskId || 'N/A'}</td>
                        <td class="px-6 py-4 text-sm text-gray-500 w-1/2" data-label="Updated Content"><pre class="bg-gray-50 p-2 rounded-lg overflow-x-auto text-xs">${content}</pre></td>
                    `;
                    logTableBody.appendChild(tr);
                });
            } else {
                logTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">No audit logs available.</td></tr>`;
            }

            renderPagination(logPagination, data.totalPages, data.number, loadLogs);
        })
        .catch(err => {
             // Error handled in fetchAPI
        });
}

async function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();

    // Frontend Validation
    if (!title || !desc) {
        return showNotification('Title and Description are required.', 'error');
    }
    if (title.length > 100) {
        return showNotification('Title cannot exceed 100 characters.', 'error');
    }
    if (desc.length > 500) {
        return showNotification('Description cannot exceed 500 characters.', 'error');
    }

    const payload = { title, description: desc };

    try {
        if (editingTaskId) {
            await fetchAPI(`${BASE_URL}/tasks/${editingTaskId}`, { method: 'PUT', body: JSON.stringify(payload) });
            showNotification('Task successfully updated!');
        } else {
            await fetchAPI(`${BASE_URL}/tasks`, { method: 'POST', body: JSON.stringify(payload) });
            showNotification('Task successfully created!');
        }
        closeModal();
        loadTasks(0);
    } catch (error) {
        // The error is already handled and notified in fetchAPI
    }
}

function editTask(id, title, desc) {
    editingTaskId = id;
    document.getElementById('modalTitle').innerText = 'Edit Task';
    document.getElementById('taskTitle').value = title;
    document.getElementById('taskDesc').value = desc;
    taskModal.classList.remove('hidden');
}

async function deleteTask(id) {
    const confirmed = await showConfirmation('Are you sure you want to permanently delete this task?');

    if (confirmed) {
        try {
            await fetchAPI(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' });
            showNotification(`Task ID ${id} deleted.`);
            loadTasks(0);
        } catch (error) {
            // The error is already handled and notified in fetchAPI
        }
    }
}
