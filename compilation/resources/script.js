const SIDEBAR_ELEMENT = 'scrollTarget';

let themeSwaps = 0

function copyCodeBlock(caller) {
    const button = caller.target
    const content = button.parentNode.querySelector("code").innerText.replace(/\u00a0/g, " ");
    navigator.clipboard.writeText(content).then(() => {
        button.classList.add('copied')
        button.disabled = true
        setTimeout(() => {
            button.classList.remove('copied')
            button.disabled = false
        }, 1000)
    })
}

function copyHeaderLink(caller) {
    const button = caller.target
    const heading = button.parentNode
    const url = `${location.origin}${location.pathname}#${heading.id}`

    navigator.clipboard.writeText(url).then(() => {
        const original = button.textContent
        button.textContent = '\u2705'
        button.disabled = true
        setTimeout(() => {
            button.textContent = original
            button.disabled = false
        }, 1000)
    })
}

function toggleTheme() {
    if (isThemeTwoLocked())
        return

    themeSwaps += 1
    switch (getTheme()) {
        case 'light':
            if (!isTwoUnlocked() && themeSwaps > 20)
                return setTheme('two')
            else
                return setTheme('dark')
        case 'dark':
            return isTwoUnlocked() ? setTheme('two') : setTheme('light')
        case 'two':
            return setTheme('light')
        default:
            throw new Error("how")
    }
}

function getTheme() {
    return localStorage.getItem('theme') ?? 'dark';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);

    document.documentElement.classList.remove('light', 'two')

    switch (theme) {
        case 'light':
            document.documentElement.classList.add('light')
            break
        case 'dark':
            break
        case 'two':
            document.documentElement.classList.add('two')
            break
        default:
            throw new Error("how")
    }

    if (theme == 'two' && (!isTwoUnlocked() || isThemeTwoLocked())) {
        setTwoState(1)
        setTimeout(playTwoAnimation, 0)
    }
}

function playTwoAnimation() {
    const src = document.createElement('source')
    src.setAttribute('type', "video/webm")
    src.setAttribute('src', "/oneshot-modding-guide/two.webm") // Lazy

    const video = document.createElement("video")
    video.id = 'ee'
    video.setAttribute('autoplay', true)
    video.setAttribute('muted', true)
    video.setAttribute('playsinline', true)

    video.appendChild(src)

    video.onpause = () => { video.play() }

    video.onended = () => {
        setTwoState(2)
        video.remove()
    }

    video.onerror = (e) => {
        setTwoState(2)
        video.remove()
        console.error("Failed playing TWO")
        throw new Error(e)
    }

    document.body.appendChild(video)
}

function isTwoUnlocked() {
    return getTwoState() > 0
}

function isThemeTwoLocked() {
    return getTwoState() == 1
}

function getTwoState() {
    return localStorage.getItem('twoState') || 0
}

function setTwoState(state) {
    localStorage.setItem('twoState', state)
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

function onThemeButtonClick() {
    toggleTheme()
}

function onNavtreeScroll(e) {
    localStorage.setItem('navtree_scroll', e.srcElement.scrollTop)
}

function highlightFragmentTarget() {
    if (!location.hash)
        return

    const target = document.getElementById(location.hash.slice(1))
    if (!target)
        return

    target.scrollIntoView()

    target.classList.remove('highlight-target')
    void target.offsetWidth // Restart the animation if the same target is highlighted again
    target.classList.add('highlight-target')
}

document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll()
    document.querySelector("#navigation_tree").scrollTop = localStorage.getItem('navtree_scroll') || 0
    highlightFragmentTarget()
})

window.addEventListener('hashchange', highlightFragmentTarget)

setTheme(getTheme())