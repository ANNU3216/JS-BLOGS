// ======= CONFIG =======
const SUPABASE_URL = 'https://bzrcawqsbahxjliqlndb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cmNhd3FzYmFoeGpsaXFsbmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjI4OTgsImV4cCI6MjA2NTg5ODg5OH0._7zsMUy2-MsD6d2UUn31LguYCx6FZaB1ixGsiEyiYwU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Enhanced meta tag update function
function updateMetaTags(blogPost) {
    // Create better description
    let description = blogPost.excerpt;
    if (!description || description === 'null' || description.trim() === '') {
        // Extract text from HTML content and create excerpt
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = blogPost.content || '';
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        description = textContent.substring(0, 160).trim() + (textContent.length > 160 ? '...' : '');
    }
    
    // Ensure description is not too short
    if (description.length < 50) {
        description = `Read about ${blogPost.title} on JS BLOGS - Discover the latest in tech and development.`;
    }
    
    // Get high-quality image URL
    const coverImage = getHighQualityImageUrl(blogPost);
    
    // Create the canonical post URL (better for SEO)
    const postUrl = `${window.location.origin}${window.location.pathname}?post=${blogPost.id}`;
    
    // Update all meta tags with enhanced data
    const metaUpdates = {
        // Open Graph tags
        'og:title': blogPost.title,
        'og:description': description,
        'og:image': coverImage,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': blogPost.title,
        'og:url': postUrl,
        'og:type': 'article',
        'og:site_name': 'JS BLOGS',
        'article:author': blogPost.author || 'JS BLOGS Team',
        'article:published_time': blogPost.publish_date || new Date().toISOString(),
        'article:section': blogPost.category || 'Technology',
        'article:tag': blogPost.category || 'Programming',
        
        // Twitter Card tags
        'twitter:card': 'summary_large_image',
        'twitter:title': blogPost.title,
        'twitter:description': description,
        'twitter:image': coverImage,
        'twitter:image:alt': blogPost.title,
        'twitter:url': postUrl,
        
        // Basic meta tags
        'description': description,
        'keywords': `${blogPost.category || 'programming'}, javascript, web development, tutorial, ${blogPost.title.toLowerCase()}`,
        'author': blogPost.author || 'JS BLOGS Team'
    };
    
    // Apply all meta tag updates
    Object.entries(metaUpdates).forEach(([key, value]) => {
        updateMetaTag(key, value);
    });
    
    // Update page title with better format
    document.title = `${blogPost.title} | JS BLOGS - Tech & Development`;
    
    // Update canonical URL
    updateLinkTag('canonical', postUrl);
    
    // Add structured data for better SEO
    addStructuredData(blogPost, postUrl, coverImage, description);
}

// Helper function to update meta tags
function updateMetaTag(property, content) {
    let selector;
    
    if (property.startsWith('og:')) {
        selector = `meta[property="${property}"]`;
    } else {
        selector = `meta[name="${property}"]`;
    }
    
    let element = document.querySelector(selector);
    
    if (element) {
        element.setAttribute('content', content);
    } else {
        // Create new meta tag if it doesn't exist
        element = document.createElement('meta');
        if (property.startsWith('og:')) {
            element.setAttribute('property', property);
        } else {
            element.setAttribute('name', property);
        }
        element.setAttribute('content', content);
        document.head.appendChild(element);
    }
}

// Helper function to update link tags (like canonical)
function updateLinkTag(rel, href) {
    let element = document.querySelector(`link[rel="${rel}"]`);
    
    if (element) {
        element.setAttribute('href', href);
    } else {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('href', href);
        document.head.appendChild(element);
    }
}

// Function to reset meta tags to default (for homepage)
function resetMetaTags() {
    updateMetaTag('og:title', 'JS BLOGS - Modern Tech Blog');
    updateMetaTag('og:description', 'Discover the latest in tech. Read, share, and explore insightful articles.');
    updateMetaTag('og:image', 'https://bzrcawqsbahxjliqlndb.supabase.co/storage/v1/object/public/blog-images/cover_1755576950927_dfyv8dol.jpg');
    updateMetaTag('og:url', window.location.origin);
    updateMetaTag('og:type', 'website');
    
    updateMetaTag('twitter:title', 'JS BLOGS - Modern Tech Blog');
    updateMetaTag('twitter:description', 'Discover the latest in tech. Read, share, and explore insightful articles.');
    updateMetaTag('twitter:image', 'https://bzrcawqsbahxjliqlndb.supabase.co/storage/v1/object/public/blog-images/cover_1755576950927_dfyv8dol.jpg');
    
    document.title = 'JS BLOGS - Modern Tech Blog';
    updateLinkTag('canonical', window.location.origin);
}

// Enhanced share buttons with more options
function createShareButtons(postId, title) {
    const post = posts.find(p => p.id === postId);
    const description = post?.excerpt || `Check out this article: ${title}`;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    
    return `
        <div class="share-buttons-enhanced">
            <h4>🚀 Share this article:</h4>
            <div class="share-button-group">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" 
                   target="_blank" rel="noopener" class="share-btn facebook" 
                   aria-label="Share on Facebook">
                    <span class="share-icon">📘</span>
                    <span class="share-text">Facebook</span>
                </a>
                
                <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" 
                   target="_blank" rel="noopener" class="share-btn twitter"
                   aria-label="Share on Twitter">
                    <span class="share-icon">🐦</span>
                    <span class="share-text">Twitter</span>
                </a>
                
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" 
                   target="_blank" rel="noopener" class="share-btn linkedin"
                   aria-label="Share on LinkedIn">
                    <span class="share-icon">💼</span>
                    <span class="share-text">LinkedIn</span>
                </a>
                
                <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" 
                   target="_blank" rel="noopener" class="share-btn whatsapp"
                   aria-label="Share on WhatsApp">
                    <span class="share-icon">💬</span>
                    <span class="share-text">WhatsApp</span>
                </a>
                
                <a href="https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}" 
                   target="_blank" rel="noopener" class="share-btn reddit"
                   aria-label="Share on Reddit">
                    <span class="share-icon">🔶</span>
                    <span class="share-text">Reddit</span>
                </a>
                
                <button onclick="copyToClipboard('${shareUrl}', '${title.replace(/'/g, "\\'")}', this)" 
                        class="share-btn copy" aria-label="Copy link">
                    <span class="share-icon">📋</span>
                    <span class="share-text">Copy Link</span>
                </button>
                
                <button onclick="shareNative('${shareUrl}', '${title.replace(/'/g, "\\'")}', '${description.replace(/'/g, "\\'")}'); return false;" 
                        class="share-btn native" aria-label="Share via device" 
                        style="display: none;" id="nativeShareBtn-${postId}">
                    <span class="share-icon">📤</span>
                    <span class="share-text">Share</span>
                </button>
            </div>
            
            <div class="share-stats">
                <small>💡 Tip: Link previews work best on social media!</small>
            </div>
        </div>
    `;
}

// Enhanced copy to clipboard with better UX
function copyToClipboard(url, title, buttonElement) {
    const textToCopy = `${title}\n\n${url}`;
    
    navigator.clipboard.writeText(textToCopy).then(function() {
        // Update button temporarily
        const originalIcon = buttonElement.querySelector('.share-icon').textContent;
        const originalText = buttonElement.querySelector('.share-text').textContent;
        
        buttonElement.querySelector('.share-icon').textContent = '✅';
        buttonElement.querySelector('.share-text').textContent = 'Copied!';
        buttonElement.style.background = '#10b981';
        
        showToast('✅ Link copied to clipboard!');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            buttonElement.querySelector('.share-icon').textContent = originalIcon;
            buttonElement.querySelector('.share-text').textContent = originalText;
            buttonElement.style.background = '';
        }, 2000);
        
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('✅ Link copied to clipboard!');
    });
}

// ======= GLOBAL STATE =======
let posts = [];
let filteredPosts = [];
let currentUser = null;
let lastArticleId = null;
let modalFocusTrap = null;
let sidebarVisible = true;

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
        case 'jsmatrimony':
            window.open('jsmatrimony.html', '_blank', 'noopener,noreferrer');
            break;
        case 'contact':
            window.location.href = 'contact.html';
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
        <li><button onclick="performAction('contact')">contact</button></li>
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

// ======= ENHANCED ARTICLE MODAL WITH SIDEBAR =======
async function showArticleModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        console.error('Post not found:', postId);
        return;
    }
    
    // Update meta tags for social sharing
    updateMetaTags(post);
    
    // Increment view count
    await incrementViewCount(postId);
    
    // Open enhanced modal with sidebar
    openEnhancedArticleModal(post, postId);
    
    // Load comments and input
    await loadComments(postId);
    renderCommentInput(postId);
    
    // Load sidebar with other posts
    renderSidebar(postId);
    
    // Focus trap for accessibility
    focusTrap(document.getElementById('articleModalOverlay'));
}

// ======= ENHANCED MODAL OPENING FUNCTION =======
function openEnhancedArticleModal(post, postId) {
    document.body.classList.add('modal-open');
    const modalOverlay = document.getElementById('articleModalOverlay');
    const processedImageUrl = processSupabaseImageUrl(post.image_url);
    
    modalOverlay.innerHTML = `
        <div class="modal-container">
            <!-- Sidebar -->
            <div class="article-sidebar ${sidebarVisible ? '' : 'collapsed'}" id="articleSidebar">
                <div class="sidebar-header">
                    <h3>📚 More Articles</h3>
                    <button class="close-sidebar" onclick="toggleSidebar()" aria-label="Close sidebar">×</button>
                </div>
                <div class="sidebar-content" id="sidebarContent">
                    <div class="sidebar-loading">Loading articles...</div>
                </div>
            </div>

            <!-- Main Article -->
            <div class="article-modal">
                <div class="modal-header">
                    <button class="toggle-sidebar-btn ${sidebarVisible ? 'active' : ''}" onclick="toggleSidebar()" title="Toggle Sidebar">
                        <span class="sidebar-icon">📋</span>
                    </button>
                    <button class="close-btn" onclick="closeArticleModal()" aria-label="Close article">×</button>
                </div>
                
                <div class="modal-body">
                    <!-- Article Header -->
                    <div class="article-header">
                        ${processedImageUrl ? `
                            <img src="${processedImageUrl}" 
                                 alt="${escapeHTML(post.title)}" 
                                 class="article-featured-image"
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="article-meta-top">
                            <span class="article-category" style="background: ${getCategoryColor(post.category)}">
                                ${post.category || 'General'}
                            </span>
                            <span class="article-views">👁️ ${(post.views || 0) + 1} views</span>
                        </div>
                        <h1 class="article-title">${escapeHTML(post.title || 'Untitled')}</h1>
                        <div class="article-meta">
                            <span class="article-date">📅 ${formatDateSafe(post.publish_date)}</span>
                            <span class="article-reading-time">📖 ${calculateReadingTime(post.content)} min read</span>
                        </div>
                    </div>
                    
                    <!-- Article Content -->
                    <div class="article-content" id="articleContent">
                        ${formatArticleContent(post.content)}
                        ${createShareButtons(postId, post.title)}
                    </div>
                    
                    <!-- Comments Section -->
                    <div class="comments-section">
                        <h3>💬 Discussion</h3>
                        <div id="commentInputBox"></div>
                        <div id="commentsList"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalOverlay.style.display = 'flex';
    modalOverlay.classList.add('active');
    
    setTimeout(() => {
        modalOverlay.scrollTop = 0;
        const modal = modalOverlay.querySelector('.modal-body');
        if (modal) modal.scrollTop = 0;
    }, 100);
}

// ======= SIDEBAR FUNCTIONS =======
function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    const sidebar = document.getElementById('articleSidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar-btn');
    
    if (sidebarVisible) {
        sidebar.classList.remove('collapsed');
        toggleBtn.classList.add('active');
    } else {
        sidebar.classList.add('collapsed');
        toggleBtn.classList.remove('active');
    }
}

function renderSidebar(currentPostId) {
    const sidebarContent = document.getElementById('sidebarContent');
    if (!sidebarContent) return;
    
    // Filter out current post and get other posts
    const otherPosts = posts.filter(p => p.id !== currentPostId).slice(0, 8);
    
    if (otherPosts.length === 0) {
        sidebarContent.innerHTML = `
            <div class="no-posts">
                <div class="no-posts-icon">📝</div>
                <p>No other articles available</p>
            </div>
        `;
        return;
    }
    
    sidebarContent.innerHTML = otherPosts.map(post => {
        const imageUrl = getSupabaseImageUrl(post);
        return `
            <div class="sidebar-post" onclick="switchToPost(${post.id})" tabindex="0" role="button" aria-label="Read ${escapeHTML(post.title)}">
                <img src="${imageUrl}" 
                     alt="${escapeHTML(post.title)}" 
                     class="sidebar-post-image"
                     loading="lazy"
                     onerror="this.src='${getCategoryPlaceholderImage(post.category)}'">
                <div class="sidebar-post-content">
                    <h4 class="sidebar-post-title">${escapeHTML(post.title)}</h4>
                    <div class="sidebar-post-meta">
                        <span class="sidebar-post-category" style="background: ${getCategoryColor(post.category)}">
                            ${post.category || 'General'}
                        </span>
                        <span class="sidebar-post-date">${formatDateSafe(post.publish_date)}</span>
                    </div>
                    <div class="sidebar-post-stats">
                        <span>👁️ ${post.views || 0}</span>
                        <span>📖 ${calculateReadingTime(post.content)}m</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Function to switch to another post from sidebar
async function switchToPost(postId) {
    if (lastArticleId === postId) return;
    
    lastArticleId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Update meta tags for new post
    updateMetaTags(post);
    
    // Update URL
    if (window.history.pushState) {
        window.history.pushState({}, '', '?post=' + postId);
    }
    
    // Increment view count
    await incrementViewCount(postId);
    
    // Update main content
    const processedImageUrl = processSupabaseImageUrl(post.image_url);
    
    // Update article header
    const articleHeader = document.querySelector('.article-header');
    articleHeader.innerHTML = `
        ${processedImageUrl ? `
            <img src="${processedImageUrl}" 
                 alt="${escapeHTML(post.title)}" 
                 class="article-featured-image"
                 onerror="this.style.display='none'">
        ` : ''}
        <div class="article-meta-top">
            <span class="article-category" style="background: ${getCategoryColor(post.category)}">
                ${post.category || 'General'}
            </span>
            <span class="article-views">👁️ ${(post.views || 0) + 1} views</span>
        </div>
        <h1 class="article-title">${escapeHTML(post.title || 'Untitled')}</h1>
        <div class="article-meta">
            <span class="article-date">📅 ${formatDateSafe(post.publish_date)}</span>
            <span class="article-reading-time">📖 ${calculateReadingTime(post.content)} min read</span>
        </div>
    `;
    
    // Update article content with share buttons
    document.getElementById('articleContent').innerHTML = formatArticleContent(post.content) + createShareButtons(postId, post.title);
    
    // Reload comments and update sidebar
    await loadComments(postId);
    renderCommentInput(postId);
    renderSidebar(postId);
    
    // Scroll to top
    document.querySelector('.modal-body').scrollTop = 0;
    
    showToast(`Switched to: ${post.title.substring(0, 30)}...`);
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

function renderPosts() {
    const blogList = document.getElementById('blogList');
    if (!filteredPosts.length) {
        blogList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #888;">
            <h3>No posts found!</h3>
            <p>Try adjusting your search terms or filter settings.</p>
        </div>`;
        return;
    }
    
    blogList.innerHTML = filteredPosts.map((post, index) => {
        let excerpt = post.excerpt;
        if (!excerpt || excerpt === 'null') {
            excerpt = post.content ? post.content.substring(0, 150) + '...' : 'No preview available';
        }
        
        const imageUrl = getSupabaseImageUrl(post);
        
        return `
            <div class="enhanced-blog-card" data-id="${post.id}" style="--card-delay: ${index * 0.1}s">
                <div class="card-image-container">
                    <img src="${imageUrl}" 
                         alt="${escapeHTML(post.title)}" 
                         class="card-image"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='${getCategoryPlaceholderImage(post.category)}';">
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

// ======= ENHANCED COMMENTS LOGIC =======
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
            document.getElementById('commentsList').innerHTML = `<div class="error-message">Error loading comments: ${error.message}</div>`;
            return;
        }
        
        if (!comments.length) {
            document.getElementById('commentsList').innerHTML = `
                <div class="no-comments">
                    <div class="no-comments-icon">💭</div>
                    <p>No comments yet. Start the conversation!</p>
                </div>
            `;
            return;
        }
        
        const userIds = [...new Set(comments.map(c => c.user_id))];
        const profiles = await getUserProfiles(userIds);
        
        let html = '';
        for (const c of comments) {
            const profile = profiles[c.user_id];
            const name = profile?.display_name || c.user_id === currentUser?.id ? 
                (currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]) : 'User';
            const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            
            html += `
                <div class="comment" data-comment-id="${c.id}">
                    <img class="avatar" src="${avatar}" alt="${escapeHTML(name)}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=random'">
                    <div class="comment-body">
                        <div class="comment-header">
                            <span class="comment-author">${escapeHTML(name)}</span>
                            <span class="comment-date">${formatDateTime(c.created_at)}</span>
                            ${c.user_id === currentUser?.id ? `
                                <button class="delete-comment-btn" onclick="deleteComment(${c.id}, ${post_id})" title="Delete comment">
                                    🗑️
                                </button>
                            ` : ''}
                        </div>
                        <div class="comment-content">${escapeHTML(c.content)}</div>
                    </div>
                </div>
            `;
        }
        document.getElementById('commentsList').innerHTML = html;
    } catch (err) {
        console.error('Unexpected error loading comments:', err);
        document.getElementById('commentsList').innerHTML = `<div class="error-message">An unexpected error occurred while loading comments.</div>`;
    }
}

// ======= DELETE COMMENT FUNCTION =======
async function deleteComment(commentId, postId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId)
            .eq("user_id", currentUser.id); // Extra security - only delete own comments
        
        if (error) {
            console.error('Error deleting comment:', error);
            showToast("Error deleting comment: " + error.message, 3000);
        } else {
            showToast("Comment deleted successfully!");
            await loadComments(postId);
        }
    } catch (err) {
        console.error('Unexpected error deleting comment:', err);
        showToast("An unexpected error occurred while deleting comment.", 3000);
    }
}

function renderCommentInput(post_id) {
    const box = document.getElementById('commentInputBox');
    if (!currentUser) {
        box.innerHTML = `
            <div class="login-prompt">
                <div class="login-prompt-icon">🔐</div>
                <p>Please <button onclick="showAuthModal('login')" class="inline-login-btn">log in</button> to join the discussion</p>
            </div>
        `;
        return;
    }
    
    box.innerHTML = `
        <div class="comment-input-container">
            <div class="comment-input-header">
                <img src="${currentUser.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]) + '&background=random'}" 
                     alt="Your avatar" class="comment-input-avatar">
                <span class="comment-input-name">${currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]}</span>
            </div>
            <form id="commentForm">
                <div class="comment-input-wrapper">
                    <textarea id="commentContent" 
                              maxlength="1000" 
                              placeholder="Share your thoughts..." 
                              required
                              rows="3"></textarea>
                    <div class="comment-input-footer">
                        <span class="character-count">0 / 1000</span>
                        <button type="submit" class="submit-comment-btn">
                            <span class="submit-icon">💬</span>
                            Post Comment
                        </button>
                    </div>
                </div>
                <div class="comment-error" id="commentError"></div>
            </form>
        </div>
    `;
    
    // Add character counter
    const textarea = document.getElementById('commentContent');
    const counter = document.querySelector('.character-count');
    textarea.addEventListener('input', function() {
        const count = this.value.length;
        counter.textContent = `${count} / 1000`;
        if (count > 900) {
            counter.style.color = '#dc2626';
        } else {
            counter.style.color = '#64748b';
        }
    });
    
    document.getElementById('commentForm').onsubmit = async function(e) {
        e.preventDefault();
        const content = document.getElementById('commentContent').value.trim();
        const errorEl = document.getElementById('commentError');
        const submitBtn = e.target.querySelector('.submit-comment-btn');
        
        errorEl.textContent = '';
        
        if (!content) {
            errorEl.textContent = "Please write a comment before posting.";
            return;
        }
        
        if (content.length > 1000) {
            errorEl.textContent = "Comment is too long. Maximum 1000 characters allowed.";
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="submit-icon">⏳</span> Posting...';
        
        try {
            // Add timestamp to make comments unique (removing unique constraint workaround)
            const { error } = await supabase.from("comments").insert({
                post_id, 
                user_id: currentUser.id, 
                content,
                created_at: new Date().toISOString()
            });
            
            if (error) {
                console.error('Error adding comment:', error);
                errorEl.textContent = error.message || "Failed to post comment. Please try again.";
            } else {
                document.getElementById('commentContent').value = '';
                showToast("Comment posted successfully! 🎉");
                await loadComments(post_id);
            }
        } catch (err) {
            console.error('Unexpected error adding comment:', err);
            errorEl.textContent = "An unexpected error occurred. Please try again.";
        } finally {
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="submit-icon">💬</span> Post Comment';
        }
    };
}

// ======= HELPER FUNCTIONS =======
// Get high-quality image URL with fallbacks
function getHighQualityImageUrl(blogPost) {
    let imageUrl = blogPost.image_url || blogPost.featured_image || blogPost.thumbnail_url || blogPost.cover_image;
    
    if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
        // Process Supabase URLs
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        if (imageUrl.startsWith('blog-images/') || imageUrl.includes('/blog-images/')) {
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
            return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
        }
        
        if (!imageUrl.includes('/')) {
            return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${imageUrl}`;
        }
        
        return imageUrl;
    }
    
    // Return high-quality placeholder based on category
    return getHighQualityPlaceholder(blogPost.category);
}

// High-quality placeholder images (1200x630 for social sharing)
function getHighQualityPlaceholder(category) {
    const placeholders = {
        'JavaScript': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=630&fit=crop&auto=format&q=80',
        'React': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&auto=format&q=80',
        'Node.js': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&auto=format&q=80',
        'CSS': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop&auto=format&q=80',
        'HTML': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&auto=format&q=80',
        'Tutorial': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop&auto=format&q=80',
        'Tips & Tricks': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&auto=format&q=80',
        'General': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=630&fit=crop&auto=format&q=80'
    };
    return placeholders[category] || placeholders['General'];
}

// Add structured data (JSON-LD) for better SEO
function addStructuredData(blogPost, postUrl, imageUrl, description) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
        existingScript.remove();
    }
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blogPost.title,
        "description": description,
        "image": {
            "@type": "ImageObject",
            "url": imageUrl,
            "width": 1200,
            "height": 630
        },
        "author": {
            "@type": "Person",
            "name": blogPost.author || "JS BLOGS Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "JS BLOGS",
            "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/logo.png`,
                "width": 200,
                "height": 60
            }
        },
        "datePublished": blogPost.publish_date || new Date().toISOString(),
        "dateModified": blogPost.updated_at || blogPost.publish_date || new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": postUrl
        },
        "articleSection": blogPost.category || "Technology",
        "keywords": `${blogPost.category || 'programming'}, javascript, web development, tutorial`,
        "wordCount": calculateWordCount(blogPost.content),
        "timeRequired": `PT${calculateReadingTime(blogPost.content)}M`
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// Calculate word count for structured data
function calculateWordCount(content) {
    if (!content) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return textContent.split(/\s+/).filter(word => word.length > 0).length;
}

// Native sharing API for mobile devices
function shareNative(url, title, description) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: description || `Check out this article: ${title}`,
            url: url
        }).then(() => {
            console.log('Shared successfully');
            showToast('✅ Shared successfully!');
        }).catch((error) => {
            console.log('Error sharing:', error);
            // Fallback to copy
            copyToClipboard(url, title, document.querySelector('.share-btn.native'));
        });
    } else {
        // Fallback for browsers without native sharing
        copyToClipboard(url, title, document.querySelector('.share-btn.native'));
    }
}

// Check for native sharing support and show button
function checkNativeSharing() {
    if (navigator.share) {
        setTimeout(() => {
            const nativeShareBtns = document.querySelectorAll('[id^="nativeShareBtn-"]');
            nativeShareBtns.forEach(btn => {
                btn.style.display = 'flex';
            });
        }, 1000);
    }
}

// Initialize basic meta tags
function initializeBasicMetaTags() {
    const head = document.head;
    
    // Basic meta tags that should always be present
    const basicMetaTags = [
        { property: 'og:site_name', content: 'JS BLOGS' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'robots', content: 'index, follow' }
    ];
    
    basicMetaTags.forEach(tag => {
        const existing = document.querySelector(
            tag.property ? `meta[property="${tag.property}"]` : `meta[name="${tag.name}"]`
        );
        
        if (!existing) {
            const meta = document.createElement('meta');
            if (tag.property) {
                meta.setAttribute('property', tag.property);
            } else {
                meta.setAttribute('name', tag.name);
            }
            meta.setAttribute('content', tag.content);
            head.appendChild(meta);
        }
    });
}

// Initialize enhanced sharing system
function initializeEnhancedSharing() {
    // Initialize basic meta tags
    initializeBasicMetaTags();
    
    // Check for native sharing support
    checkNativeSharing();
    
    console.log('Enhanced sharing system initialized');
}
function getSupabaseImageUrl(post) {
    let imageUrl = post.image_url || post.featured_image || post.thumbnail_url || post.cover_image;
    
    if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        if (imageUrl.startsWith('blog-images/') || imageUrl.includes('/blog-images/')) {
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
            return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
        }
        
        if (!imageUrl.includes('/')) {
            return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${imageUrl}`;
        }
        
        return imageUrl;
    }
    
    return getCategoryPlaceholderImage(post.category);
}

function getCategoryPlaceholderImage(category) {
    const placeholders = {
        'JavaScript': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop&auto=format',
        'React': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format',
        'Node.js': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop&auto=format',
        'CSS': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format',
        'HTML': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&auto=format',
        'Tutorial': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop&auto=format',
        'Tips & Tricks': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format',
        'General': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop&auto=format'
    };
    return placeholders[category] || placeholders['General'];
}

function processSupabaseImageUrl(imageUrl) {
    if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
        return null;
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    if (imageUrl.startsWith('blog-images/') || imageUrl.includes('/blog-images/')) {
        const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
        return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
    }
    
    if (!imageUrl.includes('/')) {
        return `${SUPABASE_URL}/storage/v1/object/public/blog-images/${imageUrl}`;
    }
    
    return imageUrl;
}

function formatArticleContent(content) {
    if (!content || typeof content !== 'string') {
        return '<p>Content not available.</p>';
    }
    
    let formattedContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/#{3}\s*(.*?)$/gm, '<h3>$1</h3>')
        .replace(/#{2}\s*(.*?)$/gm, '<h2>$1</h2>')
        .replace(/#{1}\s*(.*?)$/gm, '<h1>$1</h1>');
    
    // Process images in content
    formattedContent = formattedContent.replace(
        /<img([^>]*?)src=['"]([^'"]*?)['"]([^>]*?)>/gi,
        function(match, beforeSrc, src, afterSrc) {
            const processedSrc = processSupabaseImageUrl(src);
            return `<img${beforeSrc}src="${processedSrc}"${afterSrc} style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;">`;
        }
    );
    
    formattedContent = formattedContent.replace(
        /!\[([^\]]*?)\]\(([^)]*?)\)/g,
        function(match, alt, src) {
            const processedSrc = processSupabaseImageUrl(src);
            return `<img src="${processedSrc}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;">`;
        }
    );
    
    if (!formattedContent.includes('<p>') && !formattedContent.includes('<div>')) {
        formattedContent = '<p>' + formattedContent + '</p>';
    }
    
    return formattedContent;
}

function closeArticleModal() {
    document.body.classList.remove('modal-open');
    const modalOverlay = document.getElementById('articleModalOverlay');
    modalOverlay.style.display = 'none';
    modalOverlay.classList.remove('active');
    untrapFocus();
    
    if (window.history.pushState) {
        window.history.pushState({}, '', window.location.pathname);
    }
    
    setTimeout(() => {
        modalOverlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="articleTitle">
                <button class="close-btn" aria-label="Close" onclick="closeArticleModal()">×</button>
                <h2 id="articleTitle"></h2>
                <div class="article-meta">
                    <span id="articleDate"></span> • 
                    <span id="articleCategory"></span> • 
                    <span id="articleViews"></span>
                </div>
                <div class="article-content" id="articleContent"></div>
                <div class="comments-section" id="commentsSection">
                    <h3>Comments</h3>
                    <div id="commentsList"></div>
                    <div id="commentInputBox"></div>
                </div>
            </div>
        `;
    }, 300);
}

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
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].views = (posts[postIndex].views || 0) + 1;
        }
    } catch (error) {
        console.log('View count increment failed:', error);
    }
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return isNaN(date) ? 'Recently' : date.toLocaleString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Recently';
    }
}

function formatDateSafe(dateString) {
    if (!dateString) return 'Unscheduled';
    try {
        const date = new Date(dateString);
        return isNaN(date) ? 'Unscheduled' : date.toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
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
        toast.style.opacity = '1';
        setTimeout(() => { 
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, duration);
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

// ======= SHARED LINK HANDLING =======
window.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize enhanced sharing first
        initializeEnhancedSharing();
        
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

// Enhanced window click handler for modal closing
window.onclick = function(e) {
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        closeAuthModal();
        closeArticleModal();
    }
    if (e.target.id === 'articleModalOverlay') {
        closeArticleModal();
    }
};

// ======= KEYBOARD NAVIGATION FOR SIDEBAR =======
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('sidebar-post') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
    }
});










