function createGraph(people, rooms, restrictions) {
  /*
  Create graph (adjacency matrix) with source (first index) and
  sink (last index), where source is connected to people, people are
  connected to rooms and rooms are connected to sink 
  */
  let graph = [];
  let source = 0;
  let sink = people.length + rooms.length + 1;

  // Start with no connections
  for (let i = 0; i < people.length + rooms.length + 2; i++) {
    graph[i] = [];
    for (let j = 0; j < people.length + rooms.length + 2; j++) {
      graph[i][j] = 0;
    }
  }

  // Connect source to people
  for (let i = 0; i < people.length; i++) {
    graph[source][i + 1] = 1;
  }

  // Connect rooms to sink
  for (let i = 0; i < rooms.length; i++) {
    graph[people.length + i + 1][sink] = 1;
  }

  // Connect people to rooms based on restrictions
  for (let i = 0; i < people.length; i++) {
    for (let j = 0; j < rooms.length; j++) {
      if (
        !restrictions.hasOwnProperty(people[i]) ||
        !restrictions[people[i]].includes(rooms[j])
      ) {
        graph[i + 1][people.length + j + 1] = 1;
      }
    }
  }

  return graph;
}

function edmondsKarp(graph, source, sink) {
  // Initialize residual graph with the same capacities as the original graph
  let residualGraph = [];
  for (let i = 0; i < graph.length; i++) {
    residualGraph[i] = [];
    for (let j = 0; j < graph[i].length; j++) {
      residualGraph[i][j] = graph[i][j];
    }
  }

  // Initialize parent array for BFS and flow array for each edge
  let parent = new Array(graph.length);
  let flowGraph = [];
  for (let i = 0; i < graph.length; i++) {
    flowGraph[i] = [];
    for (let j = 0; j < graph[i].length; j++) {
      flowGraph[i][j] = 0;
    }
  }

  // Initialize maximum flow to 0
  // let maxFlow = 0;

  // Repeat BFS until no augmenting path is found
  while (bfs(residualGraph, source, sink, parent)) {
    // Find bottleneck capacity of the augmenting path
    let bottleneckCapacity = Number.MAX_VALUE;
    for (let v = sink; v != source; v = parent[v]) {
      let u = parent[v];
      bottleneckCapacity = Math.min(bottleneckCapacity, residualGraph[u][v]);
    }

    // Update residual graph, flow, and maximum flow
    for (let v = sink; v != source; v = parent[v]) {
      let u = parent[v];
      residualGraph[u][v] -= bottleneckCapacity;
      residualGraph[v][u] += bottleneckCapacity;
      flowGraph[u][v] += bottleneckCapacity;
      flowGraph[v][u] -= bottleneckCapacity;
    }
    // maxFlow += bottleneckCapacity;
  }

  // Can return the max flow in the graph
  // return maxFlow;

  return flowGraph;
}

function bfs(graph, source, sink, parent) {
  // Initialize visited array and queue for BFS
  let visited = new Array(graph.length).fill(false);
  let queue = [];
  queue.push(source);
  visited[source] = true;
  parent[source] = -1;

  // BFS loop
  while (queue.length > 0) {
    let u = queue.shift();
    for (let v = 0; v < graph.length; v++) {
      if (!visited[v] && graph[u][v] > 0) {
        queue.push(v);
        visited[v] = true;
        parent[v] = u;
      }
    }
  }

  // Return true if sink is reachable from source
  return visited[sink];
}

module.exports = {
  createGraph: createGraph,
  edmondsKarp: edmondsKarp,
};
