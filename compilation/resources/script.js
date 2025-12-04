
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
	addCodeBlockCopyButtons()
}