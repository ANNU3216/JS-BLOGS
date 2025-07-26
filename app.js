// ======= CONFIG =======
const SUPABASE_URL = 'https://bzrcawqsbahxjliqlndb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cmNhd3FzYmFoeGpsaXFsbmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjI4OTgsImV4cCI6MjA2NTg5ODg5OH0._7zsMUy2-MsD6d2UUn31LguYCx6FZaB1ixGsiEyiYwU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ======= GLOBAL STATE =======
let posts = [];
let filteredPosts = [];
let currentUser = null;
let lastArticleId = null;
let modalFocusTrap = null;

// ======= REMEMBER LOGIN ACTION =======
let pendingAction = null;

function requireLogin(action, id) {
    if (!currentUser) {
        pendingAction = { action, id };
        showAuthModal('login');
        return;
    }
    performAction(action, id);
}

function performAction(action, id) {
    switch (action) {
        case 'blogs':
            document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'about':
            window.location.href = 'about.html';
            break;
        case 'Eggrates':
            window.location.href = 'Eggrates.html';
            break;    
        case 'jsmatrimony':
            window.open('jsmatrimony.html', '_blank', 'noopener,noreferrer');
            break;
        case 'readMore':
            lastArticleId = id;
            showArticleModal(id);
            if (window.history.pushState) {
                window.history.pushState({}, '', '?post=' + id);
            }
            break;
        case 'search':
            filterPosts();
            break;
    }
}

// ======= NAVBAR =======
function renderNavbar() {
    const navLinks = document.getElementById('navLinks');
    navLinks.innerHTML = `
        <li><button onclick="requireLogin('blogs')">Blogs</button></li>
        <li><button onclick="performAction('about')">About</button></li>
        <li><button onclick="performAction('Eggrates')">Eggrates</button></li>
        <li>
          <button onclick="requireLogin('jsmatrimony')">JS Matrimony</button>
        </li>
        ${
            currentUser
            ? `<li><button onclick="logoutUser()" tabindex="0">Logout</button></li>
               <li>
                 <span class="profile-chip">
                   <img src="${currentUser.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.user_metadata?.full_name || currentUser.email.split('@')[0])}" 
                        alt="avatar" style="width:24px;height:24px;border-radius:50%;margin-right:0.5em;object-fit:cover;">
                   ${currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]}
                 </span>
               </li>`
            : `<li><button onclick="showAuthModal('login')" tabindex="0">Login</button></li>
               <li><button onclick="showAuthModal('register')" tabindex="0">Register</button></li>`
        }
    `;
}

// ======= AUTH LOGIC =======
let authMode = 'login'; 
function showAuthModal(mode = 'login') {
    authMode = mode;
    document.getElementById('authModalTitle').textContent = mode === 'login' ? 'Login' : (mode === 'register' ? 'Register' : 'Password Reset');
    document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'Login' : (mode === 'register' ? 'Register' : 'Send Reset');
    document.getElementById('authError').textContent = '';
    document.getElementById('authSuccess').textContent = '';
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    document.getElementById('authPassword').style.display = (mode==='forgot')?'none':'';
    document.querySelector('.password-wrapper').style.display = (mode==='forgot')?'none':'block';
    document.getElementById('switchAuthText').innerHTML =
        mode === 'login'
            ? `Don't have an account? <a href="#" id="switchToRegister">Register</a>`
            : (mode === 'register'
                ? `Already have an account? <a href="#" id="switchToLogin">Login</a>`
                : `Back to <a href="#" id="switchToLogin">Login</a>`);
    document.getElementById('forgotPasswordLink').style.display = (mode==='login') ? 'block' : 'none';
    document.getElementById('authModalOverlay').style.display = 'flex';
    focusTrap(document.getElementById('authModalOverlay'));
    setTimeout(()=>document.getElementById('authEmail').focus(), 120);
}

function closeAuthModal() {
    document.getElementById('authModalOverlay').style.display = 'none';
    untrapFocus();
}

document.getElementById('switchAuthText').onclick = function(e) {
    if (e.target.id === 'switchToRegister') showAuthModal('register');
    if (e.target.id === 'switchToLogin') showAuthModal('login');
};

document.getElementById('forgotPasswordLink').onclick = (e) => {
    e.preventDefault();
    showAuthModal('forgot');
};

document.getElementById('authForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    document.getElementById('authError').textContent = '';
    document.getElementById('authSuccess').textContent = '';
    if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            document.getElementById('authError').textContent = error.message;
        } else {
            currentUser = data.user;
            closeAuthModal();
            renderNavbar();
            showToast("Logged in!");
            if (pendingAction) {
                performAction(pendingAction.action, pendingAction.id);
                pendingAction = null;
            }
        }
    } else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            document.getElementById('authError').textContent = error.message;
        } else {
            document.getElementById('authSuccess').textContent = "Registration successful. Please check your email for verification.";
            showToast("Registration successful, check your email!");
        }
    } else if (authMode === 'forgot') {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            document.getElementById('authError').textContent = error.message;
        } else {
            document.getElementById('authSuccess').textContent = "Password reset email sent. Please check your inbox.";
            showToast("Password reset email sent!");
        }
    }
});

document.getElementById('togglePassword').onclick = function() {
    const pw = document.getElementById('authPassword');
    if (pw.type === 'password') {
        pw.type = 'text';
        this.textContent = "🙈";
    } else {
        pw.type = 'password';
        this.textContent = "👁️";
    }
};

// ======= GOOGLE SIGNUP =======
document.getElementById("googleSignupBtn").onclick = async function(e) {
    e.preventDefault();
    document.getElementById('authError').textContent = '';
    document.getElementById('authSuccess').textContent = '';
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            document.getElementById('authError').textContent = error.message;
        } else {
            document.getElementById('authSuccess').textContent = "Redirecting to Google…";
        }
    } catch (err) {
        document.getElementById('authError').textContent = "Google sign-in failed. Try again.";
    }
};

async function logoutUser() {
    await supabase.auth.signOut();
    currentUser = null;
    renderNavbar();
    showToast("Logged out.");
    closeArticleModal();
}

// ======= AUTH INIT =======
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    renderNavbar();
}

// ======= BLOG POSTS =======
async function loadPosts() {
    try {
        document.getElementById('blogSpinner').style.display = 'block';
        const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .eq("status", "published")
            .order("publish_date", { ascending: false });
        document.getElementById('blogSpinner').style.display = 'none';
        if (error) {
            console.error('Error loading posts:', error);
            document.getElementById('blogList').innerHTML = `<div class="error-message">Error loading posts: ${error.message}</div>`;
            posts = [];
            filteredPosts = [];
        } else {
            posts = data || [];
            filteredPosts = posts.slice();
            renderPosts();
        }
    } catch (err) {
        document.getElementById('blogSpinner').style.display = 'none';
        console.error('Unexpected error loading posts:', err);
        document.getElementById('blogList').innerHTML = `<div class="error-message">An unexpected error occurred while loading posts.</div>`;
    }
}

// ======= FIXED RENDER POSTS FUNCTION =======
function renderPosts() {
    const blogList = document.getElementById('blogList');
    if (!filteredPosts.length) {
        blogList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #888;">
            <h3>No posts found!</h3>
            <p>Try adjusting your search terms or filter settings.</p>
        </div>`;
        return;
    }
    blogList.innerHTML = filteredPosts.map(post => {
        let excerpt = post.excerpt;
        if (!excerpt || excerpt === 'null') {
            excerpt = post.content ? post.content.substring(0, 150) + '...' : 'No preview available';
        }
        return `
            <div class="blog-card" data-id="${post.id}">
                <div class="blog-title">${escapeHTML(post.title)}</div>
                <div class="blog-excerpt">${escapeHTML(excerpt)}</div>
                <div class="blog-meta">
                    <span>📅 ${formatDateSafe(post.publish_date)}</span>
                    <span class="read-more" tabindex="0" onclick="requireLogin('readMore', ${post.id})">Read More →</span>
                </div>
            </div>
        `;
    }).join('');
}

// ======= SEARCH & FILTER =======
document.getElementById('searchInput').addEventListener('input', function() { requireLogin('search'); });
document.getElementById('categoryFilter').addEventListener('change', function() { requireLogin('search'); });

function filterPosts() {
    const searchVal = document.getElementById('searchInput').value.trim().toLowerCase();
    const catVal = document.getElementById('categoryFilter').value;
    filteredPosts = posts.filter(post => {
        const matchesTitle = post.title && post.title.toLowerCase().includes(searchVal);
        const matchesCategory = !catVal || post.category === catVal;
        return matchesTitle && matchesCategory;
    });
    renderPosts();
}

// ======= FIXED ARTICLE MODAL FUNCTIONS =======
async function showArticleModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        showToast("Article not found!");
        return;
    }
    
    // Increment view count
    await incrementViewCount(postId);
    
    // Open the modal with full content
    openArticleModal(post.title, post.content, post.category, post.publish_date, post.views);
    
    // Load comments
    await loadComments(postId);
    renderCommentInput(postId);
}

function openArticleModal(title, content, category, date, views) {
    // Prevent body scrolling
    document.body.classList.add('modal-open');
    document.body.classList.remove('modal-closed');
    
    // Set modal content
    document.getElementById('articleTitle').textContent = title || 'Untitled';
    document.getElementById('articleDate').textContent = formatDateSafe(date);
    document.getElementById('articleCategory').textContent = category || 'General';
    document.getElementById('articleViews').textContent = views ? `${views} views` : '0 views';
    
    // Format and set content - CRITICAL: ensure full content is displayed
    const articleContent = document.getElementById('articleContent');
    articleContent.innerHTML = formatArticleContent(content);
    
    // Show modal
    const modalOverlay = document.getElementById('articleModalOverlay');
    modalOverlay.style.display = 'block';
    
    // Focus trap
    focusTrap(modalOverlay);
    
    // Scroll modal to top
    setTimeout(() => {
        modalOverlay.scrollTop = 0;
    }, 100);
}

function formatArticleContent(content) {
    if (!content) return '<p>Content not available.</p>';
    
    // Convert markdown-style formatting to HTML
    let formattedContent = content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Wrap in paragraph tags if not already HTML
    if (!formattedContent.includes('<p>') && !formattedContent.includes('<div>')) {
        formattedContent = '<p>' + formattedContent + '</p>';
    }
    
    return formattedContent;
}

function closeArticleModal() {
    // Restore body scrolling
    document.body.classList.remove('modal-open');
    document.body.classList.add('modal-closed');
    
    // Hide modal
    const modalOverlay = document.getElementById('articleModalOverlay');
    modalOverlay.style.display = 'none';
    
    // Remove focus trap
    untrapFocus();
    
    // Clear URL parameter
    if (window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Clear content to prevent memory leaks
    setTimeout(() => {
        document.getElementById('articleContent').innerHTML = '';
    }, 300);
}

// ======= COMMENTS LOGIC =======
async function getUserProfiles(userIds) {
    if (!userIds.length) return {};
    const { data, error } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url")
        .in("user_id", userIds);
    if (error) {
        console.error('Error fetching user profiles:', error);
        return {};
    }
    const profiles = {};
    data.forEach(profile => {
        profiles[profile.user_id] = profile;
    });
    return profiles;
}

async function loadComments(post_id) {
    try {
        const { data: comments, error } = await supabase
            .from("comments")
            .select("id,post_id,user_id,content,created_at")
            .eq("post_id", post_id)
            .order("created_at", { ascending: true });
        if (error) {
            console.error('Error loading comments:', error);
            document.getElementById('commentsList').innerHTML = `<div style="color:#c92c2c">Error loading comments: ${error.message}</div>`;
            return;
        }
        if (!comments.length) {
            document.getElementById('commentsList').innerHTML = `<div style="color:#888">No comments yet. Be the first!</div>`;
            return;
        }
        const userIds = [...new Set(comments.map(c => c.user_id))];
        const profiles = await getUserProfiles(userIds);
        let html = '';
        for (const c of comments) {
            const profile = profiles[c.user_id];
            const name = profile?.display_name || 'User';
            const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
            html += `
              <div class="comment">
                <img class="avatar" src="${avatar}" alt="${name}" onerror="this.src='https://ui-avatars.com/api/?name=User'">
                <div class="comment-body">
                  <span class="comment-author">${escapeHTML(name)}</span>
                  <span class="comment-date">${formatDateTime(c.created_at)}</span>
                  <div class="comment-content">${escapeHTML(c.content)}</div>
                </div>
              </div>
            `;
        }
        document.getElementById('commentsList').innerHTML = html;
    } catch (err) {
        console.error('Unexpected error loading comments:', err);
        document.getElementById('commentsList').innerHTML = `<div style="color:#c92c2c">An unexpected error occurred while loading comments.</div>`;
    }
}

function renderCommentInput(post_id) {
    const box = document.getElementById('commentInputBox');
    if (!currentUser) {
        box.innerHTML = `<div style="color:#777;padding:0.8rem 0.1rem;">Log in to write a comment.</div>`;
        return;
    }
    box.innerHTML = `
      <form id="commentForm">
        <textarea id="commentContent" maxlength="600" placeholder="Write your comment..." required></textarea>
        <div class="comment-error" id="commentError"></div>
        <button type="submit">Add Comment</button>
      </form>
    `;
    document.getElementById('commentForm').onsubmit = async function(e) {
        e.preventDefault();
        const content = document.getElementById('commentContent').value.trim();
        document.getElementById('commentError').textContent = '';
        if (!content) {
            document.getElementById('commentError').textContent = "Comment can't be empty.";
            return;
        }
        try {
            const { error } = await supabase.from("comments").insert({
                post_id, 
                user_id: currentUser.id, 
                content
            });
            if (error) {
                console.error('Error adding comment:', error);
                document.getElementById('commentError').textContent = error.message;
            } else {
                document.getElementById('commentContent').value = '';
                showToast("Comment added!");
                await loadComments(post_id);
            }
        } catch (err) {
            console.error('Unexpected error adding comment:', err);
            document.getElementById('commentError').textContent = "An unexpected error occurred. Please try again.";
        }
    };
}

async function incrementViewCount(postId) {
    try {
        await supabase.rpc('increment_post_views', { post_id: postId });
    } catch (error) {
        console.log('View count increment failed:', error);
    }
}

// ======= SHARED LINK HANDLING =======
window.addEventListener('DOMContentLoaded', async function() {
    try {
        await checkAuth();
        await loadPosts();
        renderNavbar();
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        if (postId) {
            const numericPostId = Number(postId);
            if (!isNaN(numericPostId)) {
                requireLogin('readMore', numericPostId);
            }
        }
    } catch (error) {
        console.error('Error during app initialization:', error);
        showToast("Error loading application. Please refresh the page.");
    }
});

// ======= UTILITIES =======
function formatDateSafe(dateString) {
    if (!dateString) return 'Unscheduled';
    try {
        const date = new Date(dateString);
        return isNaN(date) ? 'Unscheduled' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Unscheduled';
    }
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return isNaN(date) ? 'Unscheduled' : date.toLocaleString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Unscheduled';
    }
}

function escapeHTML(str) {
    return (str || '').replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m];
    });
}

function showToast(msg, duration = 2500) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, duration);
    }
}

// ======= ACCESSIBLE MODAL FOCUS TRAP =======
function focusTrap(modal) {
    if (!modal) return;
    const focusableEls = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusableEls.length) return;
    let first = focusableEls[0], last = focusableEls[focusableEls.length - 1];
    modalFocusTrap = function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) { 
                if (document.activeElement === first) { 
                    last.focus(); 
                    e.preventDefault(); 
                } 
            } else { 
                if (document.activeElement === last) { 
                    first.focus(); 
                    e.preventDefault(); 
                } 
            }
        }
        if (e.key === 'Escape') { 
            closeAuthModal(); 
            closeArticleModal(); 
        }
    };
    modal.addEventListener('keydown', modalFocusTrap);
}

function untrapFocus() {
    document.querySelectorAll('.modal-overlay').forEach(modal=>{
        if (modalFocusTrap) {
            modal.removeEventListener('keydown', modalFocusTrap);
        }
    });
}

// ======= EVENT LISTENERS =======
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking overlay
    document.getElementById('articleModalOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeArticleModal();
        }
    });
    
    // Prevent modal content from closing when clicked
    document.querySelector('#articleModalOverlay .modal')?.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

window.onclick = function(e) {
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        closeAuthModal();
        closeArticleModal();
    }
};

function scrollToBlogs() {
    document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
}
