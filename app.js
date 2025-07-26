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
let authMode = 'login'; // or 'register' or 'forgot'
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
            // Perform pending action if it was set before login
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
async function showArticleModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        console.error('Post not found:', postId);
        return;
    }
    
    // Open modal with full content
    openArticleModal(post.title, post.content, post.category, post.publish_date, post.views, post.image_url);
    
    // Load comments and input
    await loadComments(postId);
    renderCommentInput(postId);
    
    // Focus trap for accessibility
    focusTrap(document.getElementById('articleModalOverlay'));
}

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

// FIXED: Enhanced renderPosts function with proper image handling
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
        
        // Get proper image URL from post data or use fallback
        const imageUrl = post.image_url || post.featured_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
        
        return `
            <div class="enhanced-blog-card" data-id="${post.id}">
                <div class="card-image-container">
                    <img src="${imageUrl}" 
                         alt="${escapeHTML(post.title)}" 
                         class="card-image"
                         onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'">
                    <div class="category-badge" style="background: ${getCategoryColor(post.category)}">${post.category || 'General'}</div>
                    <div class="reading-time">📖 ${calculateReadingTime(post.content)} min</div>
                </div>
                
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="blog-title-enhanced">${escapeHTML(post.title)}</h3>
                        <div class="post-stats">
                            <div class="stat-item">👁️ ${post.views || 0}</div>
                            <div class="stat-item">💬 ${post.comment_count || 0}</div>
                        </div>
                    </div>
                    
                    <p class="blog-excerpt-enhanced">${escapeHTML(excerpt)}</p>
                    
                    <div class="card-footer">
                        <div class="post-meta">
                            <div class="author-info">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'Admin')}&background=4f46e5&color=fff&size=40" 
                                     alt="${post.author || 'Admin'}" class="author-avatar">
                                <div class="author-details">
                                    <div class="author-name">${post.author || 'Admin'}</div>
                                    <div class="post-date">${formatDateSafe(post.publish_date)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <button class="read-more-btn" onclick="requireLogin('readMore', ${post.id})">
                            Read Full Article
                            <span class="arrow-icon">→</span>
                        </button>
                    </div>
                </div>
                <div class="card-hover-effect"></div>
            </div>
        `;
    }).join('');
}

// ======= SEARCH & FILTER =======
document.getElementById('searchInput').addEventListener('input', function() { requireLogin('search'); });
document.getElementById('categoryFilter').addEventListener('change', function() { requireLogin('search'); });

// ======= FILTER FUNCTION =======
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

// FIXED: Enhanced function to open article modal with full content and image
function openArticleModal(title, content, category, date, views, imageUrl) {
    // Prevent body scrolling
    document.body.classList.add('modal-open');
        
    // Set modal content
    document.getElementById('articleTitle').textContent = title || 'Untitled';
    document.getElementById('articleDate').textContent = formatDateSafe(date);
    document.getElementById('articleCategory').textContent = category || 'General';
    document.getElementById('articleViews').textContent = views ? `${views} views` : '0 views';
    
    // Set featured image if exists
    const articleImage = document.getElementById('articleImage');
    if (articleImage) {
        if (imageUrl) {
            articleImage.src = imageUrl;
            articleImage.style.display = 'block';
            articleImage.onerror = function() {
                this.style.display = 'none';
            };
        } else {
            articleImage.style.display = 'none';
        }
    }
    
    // Format and set content - CRITICAL: ensure full content is displayed
    const articleContent = document.getElementById('articleContent');
    if (content && content.trim()) {
        articleContent.innerHTML = formatArticleContent(content);
    } else {
        articleContent.innerHTML = '<p>Content not available.</p>';
    }
    
    // Show modal
    const modalOverlay = document.getElementById('articleModalOverlay');
    modalOverlay.style.display = 'block';
    modalOverlay.classList.add('active');
    
    // Scroll modal to top
    setTimeout(() => {
        modalOverlay.scrollTop = 0;
        const modal = modalOverlay.querySelector('.modal');
        if (modal) modal.scrollTop = 0;
    }, 100);
    
    console.log('Modal opened with content length:', content ? content.length : 0);
}

// FIXED: Enhanced content formatting function
function formatArticleContent(content) {
    if (!content || typeof content !== 'string') {
        return '<p>Content not available.</p>';
    }
    
    // Clean and format content
    let formattedContent = content
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove extra blank lines
        .replace(/\n\n/g, '</p><p>')  // Convert double newlines to paragraphs
        .replace(/\n/g, '<br>')  // Convert single newlines to breaks
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')  // Italic
        .replace(/`(.*?)`/g, '<code>$1</code>')  // Inline code
        .replace(/#{3}\s*(.*?)$/gm, '<h3>$1</h3>')  // H3 headers
        .replace(/#{2}\s*(.*?)$/gm, '<h2>$1</h2>')  // H2 headers
        .replace(/#{1}\s*(.*?)$/gm, '<h1>$1</h1>'); // H1 headers
    
    // Wrap in paragraph tags if not already HTML
    if (!formattedContent.includes('<p>') && !formattedContent.includes('<div>')) {
        formattedContent = '<p>' + formattedContent + '</p>';
    }
    
    return formattedContent;
}

// FIXED: Enhanced close modal function
function closeArticleModal() {
    // Restore body scrolling
    document.body.classList.remove('modal-open');
    
    // Hide modal
    const modalOverlay = document.getElementById('articleModalOverlay');
    modalOverlay.style.display = 'none';
    modalOverlay.classList.remove('active');
    
    // Clear URL
    if (window.history.pushState) {
        window.history.pushState({}, '', window.location.pathname);
    }
    
    // Clear content to prevent memory leaks
    setTimeout(() => {
        document.getElementById('articleContent').innerHTML = '';
        const articleImage = document.getElementById('articleImage');
        if (articleImage) {
            articleImage.style.display = 'none';
        }
    }, 300);
}

// FIXED: Helper functions
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function calculateReadingTime(content) {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getCategoryColor(category) {
    const colors = {
        'JavaScript': '#f7df1e',
        'React': '#61dafb',
        'Node.js': '#339933',
        'CSS': '#1572b6',
        'HTML': '#e34f26',
        'Tutorial': '#ff6b6b',
        'Tips & Tricks': '#4ecdc4',
        'General': '#6c63ff'
    };
    return colors[category] || '#6c63ff';
}

async function incrementViewCount(postId) {
    try {
        await supabase.rpc('increment_post_views', { post_id: postId });
    } catch (error) {
        console.log('View count increment failed:', error);
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

window.onclick = function(e) {
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        closeAuthModal();
        closeArticleModal();
    }
};
