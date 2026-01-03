const SIDEBAR_ELEMENT = 'scrollTarget';

function copyCodeBlock(caller) {
    const content = caller.target.parentNode.querySelector("code").innerText.replace(/\u00a0/g, " ");
    navigator.clipboard.writeText(content).then(() => {
        console.log('Copied!');
    })
}

function toggleTheme() {
    getTheme() == 'dark' ? setTheme('light') : setTheme('dark')
}

function getTheme() {
    return localStorage.getItem('theme') ?? 'dark';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);

    let source_icon = null
    if (theme == 'light') {
        document.body.classList.add('light')
        source_icon = document.getElementById('icon-theme-light')
    } else {
        document.body.classList.remove('light')
        source_icon = document.getElementById('icon-theme-dark')
    }

    if (source_icon) {
        const icon = document.getElementById('theme-icon')
        if (icon)
            icon.src = source_icon.src
    }
}

function showSidebar() {
    const side = document.getElementsByTagName('aside')[0];
    const backdrop = document.getElementById('side-backdrop');
    side.classList.add('active');
    side.style.display = 'block';
    backdrop.style.display = 'block';
}

function hideSidebar() {
    const side = document.getElementsByTagName('aside')[0];
    const backdrop = document.getElementById('side-backdrop');
    side.classList.remove('active');
    side.style.display = '';
    backdrop.style.display = 'none';
}

function loadTheme() {
    setTheme(getTheme())
}

function onThemeButtonClick() {
    toggleTheme()
}

function onNavtreeScroll(e) {
    localStorage.setItem('navtree_scroll', e.srcElement.scrollTop)
}

document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll()
    loadTheme()
    document.querySelector("#navigation_tree").scrollTop = localStorage.getItem('navtree_scroll') || 0
})

// Call immediately to prevent flashing
loadTheme()