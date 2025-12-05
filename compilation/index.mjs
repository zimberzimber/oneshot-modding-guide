// --backlinkprefix=<prefix>
// --localbacklinks : Configure backlinks for local browsing
// --skipcontent : Skips converting page content
// --dryrun : Skips writing to disk

import fs from "fs"
import path from "path"
import { execSync, spawnSync } from "child_process"
import filenamify from 'filenamify';
import * as cheerio from 'cheerio';

const element = (html) => cheerio.load(html, {}, false)("*")

const IGNORED_DIRS = [".obsidian", "Assets"]

const resourceDir = `${import.meta.dirname}/resources`

const rootDir = path.join(import.meta.dirname, '..')
const vaultDir = `${rootDir}/obsidian`
const outputDir = `${rootDir}/docs`

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
    if (backlinkPrefix.length == 0)
        throw "Invalid argument: --backlinkPrefixArg=<prefix>"

    backlinkPrefix = `/${backlinkPrefix}`
}

const assetsDir = `${vaultDir}/Assets`

function gather(directory) {
    const collection = fs.readdirSync(directory, { withFileTypes: true }).reduce((res, e) => {
        if (e.isDirectory()) {
            if (!IGNORED_DIRS.includes(e.name))
                res.dirs[e.name] = e
        }
        else {
            if (e.name == "sortspec.md")
                res.sortSpec = processSortspecEntry(path.resolve(e.path, e.name))
            else
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
        node.content = getContent(path.resolve(fileEntity.path, fileEntity.name))

    if (dirEntity)
        node.children = gather(path.resolve(dirEntity.path, dirEntity.name))

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
        "--embed-resources",
        "--wrap=preserve"
    ];

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
    if (sortspecIndex != -1)
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

function buildNavigationHierarchy(nodes, relativePath) {
    nodes = nodes.filter(n => n.content || (n.children && n.children.length > 0))
    if (nodes.length == 0)
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
            const children = buildNavigationHierarchy(node.children, `${relativePath}/${node.path_part}`)
            if (children){
                li.append(children)
                li.addClass("parent")
            }
        }

        ul.append(li)
    }

    return ul
}

function buildHtmlTemplate(nodes) {
    const navHierarchy = buildNavigationHierarchy(nodes, backlinkPrefix)

    const template = cheerio.load(fs.readFileSync(resourceDir + "/template.html", "utf8"))
    template("#custom_script").text(fs.readFileSync(resourceDir + "/script.js", "utf8"))
    template("#custom_style").text(fs.readFileSync(resourceDir + "/style.css", "utf8"))
    template("#navigation_tree").append(navHierarchy)
    return template
}

function processToPages(nodes, htmlTemplate) {
    for (const node of nodes) {
        if (node.content) {
            const html = cheerio.load(htmlTemplate.html())
            html("title").text(node.title)
            html("#page_title").text(node.title)
            html(`a.navtree[nav-title='${node.title.replaceAll(/'/g, "\\'")}']`).attr("selected", true)
            html(`#page_content`).append(node.content)
            node.content = html.html()
        }

        if (node.children)
            processToPages(node.children, htmlTemplate)
    }
}

const contentNodes = gather(vaultDir)
const htmlTemplate = buildHtmlTemplate(contentNodes)
processToPages(contentNodes, htmlTemplate)

if (!dryRun)
    outputNodes(contentNodes, outputDir)
