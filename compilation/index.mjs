// --backlinkprefix=<prefix>
// --localbacklinks : Configure backlinks for local browsing
// --skipcontent : Skips converting page content
// --dryrun : Skips writing to disk
// --domain : The domain where the guide is hosted

import fs from "fs"
import path from "path"
import { spawnSync } from "child_process"
import filenamify from 'filenamify'
import * as cheerio from 'cheerio'

const element = (html) => cheerio.load(html, {}, false)("*")

const IGNORED_DIRS = [".obsidian", "Assets"]
const IGNORED_FILES = [".gitignore"]
const CODE_COPY_BUTTON_HTML = element("<button class='copy-code-button' onclick='copyCodeBlock(event)'>Copy</button>")

const resourceDir = `${import.meta.dirname}/resources`
const styleFilename = "style.css"
const RESOURCES_TO_COPY = [
    "favicon.ico",
    "icon_theme_dark.png",
    "icon_theme_light.png",
    "icon_theme_two.png",
    "Discord-Symbol-Black.svg",
    "Discord-Symbol-White.svg",
    "github-mark.svg",
    "github-mark-white.svg",
    "script.js",
    "two.webm"
]

const rootDir = path.join(import.meta.dirname, '..')
const vaultDir = `${rootDir}/obsidian`
const assetsDir = `${vaultDir}/Assets`

const outputDir = path.resolve("./dist").replaceAll('\\', '/')
if (fs.existsSync(outputDir))
    fs.rmSync(outputDir, { recursive: true })
fs.mkdirSync(outputDir)

const skipContent = process.argv.includes("--skipcontent")
const dryRun = process.argv.includes("--dryrun")
const localbackLinks = process.argv.includes("--localbacklinks")

const backlinkPrefixArg = process.argv.find(arg => arg.startsWith("--backlinkprefix="))
if (!backlinkPrefixArg && !localbackLinks)
    throw "Must specify either `--localbackLinks` or `--backlinkPrefixArg=<prefix>`"

let backlinkPrefix
if (localbackLinks) {
    backlinkPrefix = `file://${outputDir}`
} else {
    backlinkPrefix = backlinkPrefixArg.replace("--backlinkprefix=", "")
    if (backlinkPrefix.length === 0)
        throw "Invalid argument: --backlinkPrefixArg=<prefix>"

    backlinkPrefix = `/${backlinkPrefix}`
}

let domain = ""
const domainArg = process.argv.find(arg => arg.startsWith("--domain="))
if (domainArg) 
    domain = domainArg.replace("--domain=", "")

function gather(directory) {
    const collection = fs.readdirSync(directory, { withFileTypes: true }).reduce((res, e) => {
        if (e.isDirectory()) {
            if (!IGNORED_DIRS.includes(e.name))
                res.dirs[e.name] = e
        }
        else {
            if (e.name === "sortspec.md")
                res.sortSpec = processSortspecEntry(path.resolve(e.parentPath, e.name))
            else if (!IGNORED_FILES.includes(e.name))
                res.files[e.name.replace(/\.md$/, '')] = e
        }

        return res
    }, { dirs: {}, files: {}, sortSpec: [] })

    let nodes = []
    let order = new Set([...collection.sortSpec, ...Object.keys(collection.dirs), ...Object.keys(collection.files)])
    for (const key of order) {
        const node = buildNode(key, collection.files[key], collection.dirs[key])
        nodes.push(node)
        delete collection.dirs[key]
        delete collection.files[key]
    }

    return nodes
}

function buildNode(title, fileEntity, dirEntity) {
    let node = {
        title: title,
        path_part: filenamify(title).toLowerCase().replaceAll(' ', '_'),
        content: null,
        children: null
    }

    if (fileEntity)
        node.content = getContent(path.resolve(fileEntity.parentPath, fileEntity.name))

    if (dirEntity)
        node.children = gather(path.resolve(dirEntity.parentPath, dirEntity.name))

    return node
}

function preprocessMarkdown(content) {
    return content.replaceAll(/```embed-ruby([\s\S]*?)```/gm, (match, g1) => {
        const embedConfig = JSON.parse(g1)
        const scriptPath = embedConfig.PATH.replace("vault:/", vaultDir)
        const scriptContent = fs.readFileSync(scriptPath, "utf8")
        return `\`\`\`ruby\n${scriptContent}\n\`\`\``
    })
}

function getContent(path) {
    if (skipContent)
        return "CONTENT SKIPPED"

    const args = [
        "-f", "markdown+wikilinks_title_after_pipe+lists_without_preceding_blankline",
        "-t", "html",
        `--resource-path=${assetsDir}`,
        "--wrap=preserve",
        "--syntax-highlighting=none"
    ]

    const proc = spawnSync("pandoc", args, {
        input: preprocessMarkdown(fs.readFileSync(path, "utf8")),
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 200
    })

    if (proc.error) throw proc.error
    if (proc.status !== 0)
        throw new Error(proc.stderr || "pandoc failed")

    return proc.stdout
}

function processSortspecEntry(filePath) {
    let content = fs.readFileSync(filePath, "utf8")
        .replaceAll(/^\-+/gm, "")
        .replace(/^sorting\-spec.*$/m, "")
        .replaceAll(/^\s+/gm, "")
        .trim()
        .split('\n')

    const sortspecIndex = content.indexOf("sortspec")
    if (sortspecIndex !== -1)
        content.splice(sortspecIndex, 1)

    return content
}

function outputNodes(nodes, dir) {
    for (const node of nodes) {
        if (node.content) {
            const filePath = path.resolve(dir, node.path_part) + ".html"
            fs.writeFileSync(filePath, node.content)
        }

        if (node.children) {
            const childPath = path.resolve(dir, node.path_part)
            if (!fs.existsSync(childPath))
                fs.mkdirSync(childPath)
            outputNodes(node.children, childPath)
        }
    }
}

function buildNavigationTree(nodes, relativePath) {
    nodes = nodes.filter(n => n.content || (n.children && n.children.length > 0))
    if (nodes.length === 0)
        return null

    const ul = element('<ul class="navtree"></ul>')

    for (const node of nodes) {
        const li = element('<li class="navtree"></li>')

        let label
        if (node.content) {
            label = element(`<a class="navtree"></a>`)
            label.attr("href", `${relativePath}/${node.path_part}.html`)
        }
        else
            label = element(`<span class="navtree"></span>`)

        label.text(node.title)
        label.attr("nav-title", node.title)
        li.append(label)

        if (node.children) {
            const children = buildNavigationTree(node.children, `${relativePath}/${node.path_part}`)
            if (children) {
                li.append(children)
                li.addClass("parent")
            }
        }

        ul.append(li)
    }

    return ul
}

function getGitLink() {
    return spawnSync("git", [ "config", "--get", "remote.origin.url" ], { encoding: "utf8" }).stdout.replace(/\.git\n*$/, '')
}

function getDiscordLink() {
    const discordLinkArg = process.argv.find(arg => arg.startsWith("--discordlink="))
    if (!discordLinkArg)
        return null

    const discordLink = discordLinkArg.replace("--discordlink=", "").trim()
    if (!discordLink)
        return null
    
    return discordLink
}

function buildHtmlTemplate(nodes) {
    const template = cheerio.load(fs.readFileSync(resourceDir + "/template.html", "utf8"))
    
    template("meta[property=og\\:url]").attr("content", domain)
    
    template("#navigation_tree").append(buildNavigationTree(nodes, backlinkPrefix))

    template("#custom_script").attr("src", backlinkPrefix + "/script.js")
    template("#custom_style").attr("href", backlinkPrefix + "/style.css")

    template("#favicon").attr("href", backlinkPrefix + "/favicon.ico")

    const gitLink = getGitLink()
    if (gitLink)
        template("#github-icon").attr("href", gitLink)
    else
        template("#github-icon").addClass("hidden")

    const discordLink = getDiscordLink()
    if (discordLink)
        template("#discord-icon").attr("href", discordLink)
    else
        template("#discord-icon").addClass("hidden")

    return template
}

function buildCss() {
    return fs.readFileSync(`${resourceDir}/${styleFilename}`, "utf8").replaceAll("#ROOT_PATH#", backlinkPrefix)
}

function processToPages(nodes, htmlTemplate, wikilinkDictinary, parent_path) {
    for (const node of nodes) {
        const url_path = `${parent_path}/${node.path_part}`

        if (node.content) {
            const html = cheerio.load(htmlTemplate.html())
            html("title").text(node.title)
            html("meta[property=og\\:title]").attr("content", node.title)
            html("#page_title").text(node.title)
            html(`a.navtree[nav-title='${node.title.replaceAll(/'/g, "\\'")}']`).attr("selected", true)
            html("#page_content").append(node.content)
            html("pre").prepend(CODE_COPY_BUTTON_HTML)

            const url = html("meta[property=og\\:url]").attr("content")
            html("meta[property=og\\:url]").attr("content", `${url}${backlinkPrefix}${url_path}.html`)

            for (let e of html("a.wikilink")) {
                e = html(e)
                const title = e.text()
                let href = wikilinkDictinary[title]
                if (!href) {
                    // Might be referring to file instead
                    const elemHref = e.attr("href")
                    if (fs.existsSync(path.join(assetsDir, elemHref))) {
                        href = `${backlinkPrefix}/_assets/${elemHref}`
                    } else {
                        throw new Error(`Href not found for: ${title}`)
                    }
                }

                e.attr("href", href)
            }

            for (const e of html("img.wikilink,video.wikilink")) {
                const elem = html(e)
                elem.attr("src", `${backlinkPrefix}/_assets/${elem.attr("src")}`)
            }

            node.content = html.html()
        }

        if (node.children)
            processToPages(node.children, htmlTemplate, wikilinkDictinary, url_path)
    }
}

function buildWikilinkDictionary(nodes, relativePath, dictionary) {
    for (const node of nodes) {
        if (node.content) {
            if (dictionary[node.title])
                throw new Error(`Link with title '${node.title}' already registered.`)

            dictionary[node.title] = `${relativePath}/${node.path_part}.html`
        }

        if (node.children)
            buildWikilinkDictionary(node.children, `${relativePath}/${node.path_part}`, dictionary)
    }
}

const contentNodes = gather(vaultDir)
const wikilinkDictinary = {}
buildWikilinkDictionary(contentNodes, backlinkPrefix, wikilinkDictinary)
const htmlTemplate = buildHtmlTemplate(contentNodes)
processToPages(contentNodes, htmlTemplate, wikilinkDictinary, '')
const style = buildCss()

if (!dryRun) {
    outputNodes(contentNodes, outputDir)

    fs.writeFileSync(`${outputDir}/${styleFilename}`, style)
    fs.cpSync(assetsDir, `${outputDir}/_assets`, { recursive: true })

    for (const resource of RESOURCES_TO_COPY)
        fs.copyFileSync(`${resourceDir}/${resource}`, `${outputDir}/${resource}`)
}
