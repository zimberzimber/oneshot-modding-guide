// --backlinkprefix=<prefix>
// --localbacklinks : Configure backlinks for local browsing
// --skipcontent : Skips converting page content
// --embedassets : Embed article assets into the generated HTML
// --dryrun : Skips writing to disk

import fs from "fs"
import path from "path"
import { spawnSync } from "child_process"
import filenamify from 'filenamify';
import * as cheerio from 'cheerio';

const element = (html) => cheerio.load(html, {}, false)("*")

const IGNORED_DIRS = [".obsidian", "Assets"]
const IGNORED_FILES = [".gitignore"]
const CODE_COPY_BUTTON_HTML = element("<button class='copy-code-button' onclick='copyCodeBlock(event)'>Copy</button>")

const resourceDir = `${import.meta.dirname}/resources`
const RESOURCES_TO_COPY = [
    "favicon.ico",
    "icon_theme_dark.png",
    "icon_theme_light.png",
    "icon_theme_two.png",
    "script.js",
    "style.css"
]

const rootDir = path.join(import.meta.dirname, '..')
const vaultDir = `${rootDir}/obsidian`
const assetsDir = `${vaultDir}/Assets`

const outputDir = path.resolve("./dist")
if (fs.existsSync(outputDir))
    fs.rmSync(outputDir, { recursive: true })
fs.mkdirSync(outputDir)

const skipContent = process.argv.includes("--skipcontent")
const dryRun = process.argv.includes("--dryrun")
const localbackLinks = process.argv.includes("--localbacklinks")
const embedAssets = process.argv.includes("--embedassets")

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
    ];

    if (embedAssets)
        args.push("--embed-resources")

    const proc = spawnSync("pandoc", args, {
        input: preprocessMarkdown(fs.readFileSync(path, "utf8")),
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 200
    });

    if (proc.error) throw proc.error;
    if (proc.status !== 0)
        throw new Error(proc.stderr || "pandoc failed");

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

function buildHtmlTemplate(nodes) {
    const template = cheerio.load(fs.readFileSync(resourceDir + "/template.html", "utf8"))
    template("#navigation_tree").append(buildNavigationTree(nodes, backlinkPrefix))

    if (embedAssets) {
        template("#custom_script").text(fs.readFileSync(resourceDir + "/script.js", "utf8"))
        template("#custom_style").remove()
        template("head").append(`<style id="custom_style">${fs.readFileSync(resourceDir + "/style.css", "utf8")}</style>`)

        template("#favicon").attr("href", imageToBase64Source(resourceDir + "/favicon.ico"))
        template("#icon-theme-dark").attr("src", imageToBase64Source(resourceDir + "/icon_theme_dark.png"))
        template("#icon-theme-light").attr("src", imageToBase64Source(resourceDir + "/icon_theme_light.png"))
        template("#icon-theme-two").attr("src", imageToBase64Source(resourceDir + "/icon_theme_two.png"))
    } else {
        template("#custom_script").attr("src", backlinkPrefix + "/script.js")
        template("#custom_style").attr("href", backlinkPrefix + "/style.css")

        template("#favicon").attr("href", backlinkPrefix + "/favicon.ico")
        template("#icon-theme-dark").attr("src", backlinkPrefix + "/icon_theme_dark.png")
        template("#icon-theme-light").attr("src", backlinkPrefix + "/icon_theme_light.png")
        template("#icon-theme-two").attr("src", backlinkPrefix + "/icon_theme_two.png")
    }

    return template
}

function imageToBase64Source(filePath) {
    return "data:image/png;base64," + fs.readFileSync(filePath, { encoding: 'base64' })
}

function processToPages(nodes, htmlTemplate, wikilinkDictinary) {
    for (const node of nodes) {
        if (node.content) {
            const html = cheerio.load(htmlTemplate.html())
            html("title").text(node.title)
            html("#page_title").text(node.title)
            html(`a.navtree[nav-title='${node.title.replaceAll(/'/g, "\\'")}']`).attr("selected", true)
            html("#page_content").append(node.content)
            html("pre").prepend(CODE_COPY_BUTTON_HTML)

            for (let e of html("a.wikilink")) {
                e = html(e)
                const title = e.text()
                let href = wikilinkDictinary[title]
                if (!href) {
                    // Might be referring to file instead
                    const elemHref = e.attr("href")
                    if (fs.existsSync(path.join(assetsDir, elemHref))){
                        href = `${backlinkPrefix}/_assets/${elemHref}}`
                    } else {
                        throw new Error(`Href not found for: ${title}`)
                    }
                }

                e.attr("href", href)
            }

            if (!embedAssets) {
                const k = html("img.wikilink,video.wikilink")
                for (const e of k) {
                    const elem = html(e)
                    elem.attr("src", `${backlinkPrefix}/_assets/${elem.attr("src")}`)
                }
            }

            node.content = html.html()
        }

        if (node.children)
            processToPages(node.children, htmlTemplate, wikilinkDictinary)
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
processToPages(contentNodes, htmlTemplate, wikilinkDictinary)

if (!dryRun) {
    outputNodes(contentNodes, outputDir)

    if (!embedAssets) {
        for (const resource of RESOURCES_TO_COPY)
            fs.copyFileSync(`${resourceDir}/${resource}`, `${outputDir}/${resource}`)
        fs.cpSync(assetsDir, `${outputDir}/_assets`, { recursive: true })
    }
}
