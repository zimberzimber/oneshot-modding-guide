

function normalizeWikilinks() {
	const openNodes = [...BACKLINK_NAV_DATA]
	const linkDictionary = {}
	while (openNodes.length > 0) {
		node = openNodes.pop()

		if (node.path)
			linkDictionary[node.title] = node.path

		if (node.children)
			openNodes.push(...node.children)
	}

	for (const wikilink of document.querySelectorAll("a.wikilink")) {
		const fixedLink = linkDictionary[wikilink.innerText]
		if (fixedLink)
			wikilink.href = fixedLink
	}
}

function buildNavigationTree(data) {
	const ul = document.createElement('ul')
	ul.classList.add("navtree")

	for (const node of data) {
		const li = document.createElement('li')
		li.classList.add("navtree")

		if (node.path) {
			const a = document.createElement('a')
			a.classList.add("navtree")

			a.textContent = node.title;
			a.href = node.path;
			li.appendChild(a);
		} else {
			const span = document.createElement('span')
			span.classList.add("navtree")

			span.textContent = node.title;
			li.appendChild(span)
		}

		if (node.children)
			li.appendChild(buildNavigationTree(node.children))

		ul.appendChild(li)
	}

	return ul;
}


function addCodeBlockCopyButtons() {
	const codeBlocks = document.querySelectorAll("div.sourceCode")
	for (block of codeBlocks) {
		const button = createCodeBlockCopyButton()
		block.prepend(button)
	}
}

function createCodeBlockCopyButton() {
	const b = document.createElement("button")
	b.type = "button"
	b.className = "copy-code-block-button"
	b.title = "Copy"
	b.onclick = copyCodeBlock
	b.innerText = "copy"
	return b
}

function copyCodeBlock(caller) {
	console.log(caller.target.parentNode)
	g = caller.target.parentNode.querySelector("code")
	const content = caller.target.parentNode.querySelector("code").innerText.replace(/\u00a0/g, " ");
	navigator.clipboard.writeText(content)
}

window.onload = () => {
	hljs.highlightAll()
	normalizeWikilinks()
	addCodeBlockCopyButtons()

	const xd = buildNavigationTree(BACKLINK_NAV_DATA)
	document.querySelector(".side").appendChild(xd)
}