import fs from "fs"
import path from "path"
import { spawnSync } from "child_process"
import filenamify from 'filenamify';

// --skipcontent : Skips converting page content
// --debugoutput : Output into two documents containing all nodes and backlins
// --backlinkprefix=<path> : Sets a prefix for backlinks

const IGNORED_DIRS = [".obsidian", "Assets"]
const RESOURCE_DIR = "./resources"

const vaultDir = process.argv[2]
if (!vaultDir)
    throw "No vault diretory given."

const outputDir = process.argv[3]
if (!outputDir)
    throw "No output diretory given."

const skipContent = process.argv.includes("--skipcontent")
const debugOutput = process.argv.includes("--debugoutput")

let backlinkPrefix = ""
const backlinkPrefixArg = process.argv.find(arg => arg.startsWith("--backlinkprefix="))
if (backlinkPrefixArg)
    backlinkPrefix = backlinkPrefixArg.replace("--backlinkprefix=", '')

const htmlTemplate = fs.readFileSync(RESOURCE_DIR + "/template.html", "utf8")
    .replace("{{STATIC.SCRIPT}}", fs.readFileSync(RESOURCE_DIR + "/script.js", "utf8"))
    .replace("{{STATIC.STYLE}}", fs.readFileSync(RESOURCE_DIR + "/style.css", "utf8"))

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

function getContent(path) {
    if (skipContent)
        return "CONTENT SKIPPED"

    const args = [
        path,
        "-f", "markdown+wikilinks_title_after_pipe+lists_without_preceding_blankline",
        "-t", "html",
        `--resource-path=${assetsDir}`,
        "--embed-resources",
        "--wrap=preserve"
    ];

    const proc = spawnSync("pandoc", args, {
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

function postProcessContent(nodes, navData) {
    for (const node of nodes) {
        if (node.content) {
            node.content = htmlTemplate
                .replaceAll("{{PAGE.TITLE}}", node.title)
                .replace("{{PAGE.NAV_DATA}}", "const BACKLINK_NAV_DATA = " + JSON.stringify(navData))
                .replace("{{PAGE.CONTENT}}", node.content)
        }

        if (node.children)
            postProcessContent(node.children, navData)
    }
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
    const list = []

    for (const node of nodes) {
        if (!node.content && !node.children)
            continue

        const link = {
            title: node.title,
            path: null,
            children: null
        }

        if (node.content)
            link.path = `${relativePath}/${node.path_part}.html`

        if (node.children)
            link.children = buildNavigationHierarchy(node.children, `${relativePath}/${node.path_part}`)

        list.push(link)
    }

    return list
}

const contentNodes = gather(vaultDir)

const navHierarchy = buildNavigationHierarchy(contentNodes, backlinkPrefix)
postProcessContent(contentNodes, navHierarchy)

if (debugOutput) {
    fs.writeFileSync(outputDir + "/nodes.json", JSON.stringify(contentNodes, null, 2))
    fs.writeFileSync(outputDir + "/navigation_hierarchy.json", JSON.stringify(navHierarchy, null, 2))
} else {
    outputNodes(contentNodes, outputDir)
}
