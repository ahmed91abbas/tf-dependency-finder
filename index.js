const core = require('@actions/core');
const glob = require('@actions/glob');
const fs = require('fs')
const path = require('path');
const DepGraph = require('dependency-graph').DepGraph;


async function findModulesFiles(pathToTerraform) {
  const globber = await glob.create(path.join(pathToTerraform, '**/main.tf'))
  const result = []
  for await (const file of globber.globGenerator()) {
    result.push(file)
  }
  return result;
}

const moduleFromFile = (file)=> path.basename(path.dirname(file))

let filterFiles = (filter, files)=> files.filter(m => !filter.includes(moduleFromFile(m)));
async function findDependencies() {
  const pathToTerraform = core.getInput('path-to-terraform');
  const modulesIgnore = core.getInput('modules-ignore').split(' ');

  let files = filterFiles(modulesIgnore,await findModulesFiles(pathToTerraform))

  const deps = {}
  const graph = new DepGraph()

  let modules = files.map(moduleFromFile)
  modules.forEach((m)=>graph.addNode(m))


  for (const file of files) {
    const module = moduleFromFile(file)
    deps[module] = []
    const data = fs.readFileSync(file).toString();
    let re = /join\(\"\/\", compact\(\[\"terraform-state\", \"(.*)\"/g
    const matches = [...data.matchAll(re)];
    deps[module] = matches.map(element => {
      graph.addDependency(module, element[1])
      return element[1]
    } );
  }

  return { deps, graph }
}

const publishResults = (data) => {
  core.setOutput("all-modules", data.graph.overallOrder());
  core.setOutput("dependency-chart", data.deps);
  core.setOutput("run-order", recursiveDepFinder(data.graph, []));
}

findDependencies().then(publishResults).catch(error => {
  console.log(error)
  core.setFailed(error.message);
})

function removeLeaves(leaves, graph){
  leaves.forEach((l)=>graph.removeNode(l))
}

function recursiveDepFinder(graph, result) {
  leaves = graph.overallOrder(leavesOnly=true)
  if (leaves.length == 0) {
    return result
  }
  result.push(leaves)
  removeLeaves(leaves, graph)
  return recursiveDepFinder(graph, result)
}
