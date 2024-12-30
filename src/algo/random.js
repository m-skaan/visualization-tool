// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { BFS_DFS_ADJ_LIST } from './util/GraphValues';
import Graph from './Graph.js';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

/*const DFS_STACK_TOP_COLOR = '#0000FF';
const VISITED_COLOR = '#99CCFF';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const LIST_START_X = 30;
const LIST_START_Y = 70;
const LIST_SPACING = 20;

const VISITED_START_X = 30;
const VISITED_START_Y = 120;

const CURRENT_VERTEX_LABEL_X = 25;
const CURRENT_VERTEX_LABEL_Y = 145;
const CURRENT_VERTEX_X = 115;
const CURRENT_VERTEX_Y = 151;

const STACK_LABEL_X = 25;
const STACK_LABEL_Y = 170;

const STACK_START_X = 40;
const SMALL_STACK_START_Y = 335;
const LARGE_STACK_START_Y = 465;
const SMALL_STACK_SPACING = 20;
const LARGE_STACK_SPACING = 16;

const RECURSION_START_X = 125;
const RECURSION_START_Y = 185;
const SMALL_RECURSION_SPACING_X = 20;
const LARGE_RECURSION_SPACING_X = 10;
const SMALL_RECURSION_SPACING_Y = 20;
const LARGE_RECURSION_SPACING_Y = 15;

const CODE_START_X = 1000;
const CODE_START_Y = 50;

export const VERTEX_INDEX_COLOR = '#0000FF';

let adjMatrix =
	//A     B      C     D      E     F      G      H
	/*A*/ [
		[0, 0, 0, 0, 0, 0, 0, 0],
		/*B*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*C*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*D*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*E*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*F*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*G*/ [0, 0, 0, 0, 0, 0, 0, 1],
		/*H*/ [0, 0, 0, 0, 0, 0, 0, 0],
	];


export default class GraphCreate extends Algorithm {
    constructor(am, w, h) {
        super(am, w, h);
        this.addControls();
        this.adjList = {};  // Initialize the adjacency list
    }

    addControls() {
        addLabelToAlgorithmBar('Adjacency List: ');
        const verticalGroup = addGroupToAlgorithmBar(false);
        const horizontalGroup = addGroupToAlgorithmBar(true, verticalGroup);
        
        // List text field
        this.listField = document.createElement('textarea'); 
        this.listField.classList.add('scrollable-textbox'); // Add a CSS class for styling
        this.listField.style.width = '200px'; // Adjust width
        this.listField.style.height = '100px'; // Adjust height

        // Add an input event listener to restrict input
        this.listField.addEventListener('input', function(event) {
            const allowedPattern = /^[A-H->,\n]*$/; // Capital letters, ->, and spaces
            if (!allowedPattern.test(this.value)) {
                const cursorPosition = this.selectionStart - 1;
                this.value = this.value.replace(/[^A-H->,\n]/g, ''); // Remove invalid characters
                this.setSelectionRange(cursorPosition, cursorPosition); // Preserve cursor position
            }
        });

        horizontalGroup.appendChild(this.listField);
        addDivisorToAlgorithmBar();
        this.runButton = addControlToAlgorithmBar('Button', 'Run');
        this.runButton.onclick = this.startCallback.bind(this);
    }

    startCallback() {
        if (this.listField.value !== '') {
            console.log(this.listField.value);
            // Parsing the adjacency list from the input
            const adjacencyList = this.listField.value.split("\n").map((line) => {
                let [node, neighbors] = line.split("->");
                neighbors = neighbors ? neighbors.split(',') : [];
                return { node: node.trim(), neighbors: neighbors.map(n => n.trim()) };
            });
            console.log("Parsed Adjacency List: ", adjacencyList);
            this.setup(adjacencyList);
        } else {
            this.shake(this.runButton);  // Shake button if no input
        }
    }

    setup(adjList) {
        console.log('setup called with:', adjList);
        // Create the adjacency list object
        this.buildAdjList(adjList);
		this.buildAdjMatrix();
		this.animationManager.resetAll();
        this.visualizeGraph();
		this.buildAdjMatrix1();
    }

    buildAdjList(adjList) {
        adjList.forEach(({ node, neighbors }) => {
            if (!this.adjList[node]) {
                this.adjList[node] = [];
            }
            neighbors.forEach(neighbor => {
                if (!this.adjList[node].includes(neighbor)) {
                    this.adjList[node].push(neighbor);
                }
                if (!this.adjList[neighbor]) {
                    this.adjList[neighbor] = [];
                }
            });
        });
        console.log("Final Adjacency List:", this.adjList);
    }

	buildAdjMatrix() {
		// Get all unique nodes from the adjacency list
		const nodes = Object.keys(this.adjList);
		const nodeCount = nodes.length;	
	
		// Create a mapping from node to index
		const nodeIndexMap = nodes.reduce((map, node, index) => {
			map[node] = index;
			return map;
		}, {});
	
		// Fill the adjacency matrix based on the adjacency list
		nodes.forEach((node) => {
			const nodeIndex = nodeIndexMap[node];
			this.adjList[node].forEach((neighbor) => {
				const neighborIndex = nodeIndexMap[neighbor];
				adjMatrix[nodeIndex][neighborIndex] = 1;
			});
		});
	
		console.log("Adjacency Matrix:", adjMatrix);
	}

	visualizeGraph() {
		// Create SVG container for the graph
		const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgContainer.setAttribute('width', '500');
		svgContainer.setAttribute('height', '500');
		svgContainer.style.border = '1px solid black'; // Add a border for better visibility
		document.body.appendChild(svgContainer);
	
		console.log("SVG container added to DOM");
	
		// Define the radius of the nodes and the initial positions
		const nodeRadius = 20;
		const nodePositions = this.generateNodePositions(Object.keys(this.adjList).length);
	
		// Create nodes (circles)
		const nodes = {};
		Object.keys(this.adjList).forEach((node, index) => {
			const { x, y } = nodePositions[index];
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', x);
			circle.setAttribute('cy', y);
			circle.setAttribute('r', nodeRadius);
			circle.setAttribute('fill', 'lightblue');
			circle.setAttribute('stroke', 'black');  // Add border for nodes to make them visible
			svgContainer.appendChild(circle);
	
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', x);
			text.setAttribute('y', y);
			text.setAttribute('dy', '4');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('fill', 'black'); // Text color
			text.textContent = node;
			svgContainer.appendChild(text);
	
			nodes[node] = { x, y };
		});
	
		// Create edges (lines)
		Object.keys(this.adjList).forEach(node => {
			const { x: startX, y: startY } = nodes[node];
			this.adjList[node].forEach(neighbor => {
				const { x: endX, y: endY } = nodes[neighbor];
				const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', startX);
				line.setAttribute('y1', startY);
				line.setAttribute('x2', endX);
				line.setAttribute('y2', endY);
				line.setAttribute('stroke', 'black');
				svgContainer.appendChild(line);
			});
		});
	
		console.log("Graph visualization complete");
	}

	generateNodePositions(numNodes) {
		const positions = [];
		const maxX = 450; // Max X position for nodes
		const maxY = 450; // Max Y position for nodes
	
		for (let i = 0; i < numNodes; i++) {
			// Generate random x and y positions within the max range
			const x = Math.random() * maxX + 25; // Adding 25 for padding from edges
			const y = Math.random() * maxY + 25;
			positions.push({ x, y });
		}
	
		return positions;
	}	

	buildAdjMatrix1() {
		this.cmd(
			act.createCircle,
			1,
			"B",
			500,
			500,
		);
		/*const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext("2d");

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Set up node positions (we'll arrange them in a circular layout)
		const nodeCount = adjMatrix.length;
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const radius = Math.min(centerX, centerY) - 50; // Leave some padding
		const nodePositions = [];

		for (let i = 0; i < nodeCount; i++) {
			const angle = (2 * Math.PI * i) / nodeCount;
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			nodePositions.push({ x, y });
		}
		console.log("Node Positions:", nodePositions);
		// Command to draw edges
		if (this.cmd === "draw" && act === "edges") {
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			for (let i = 0; i < nodeCount; i++) {
				for (let j = 0; j < nodeCount; j++) {
					if (adjMatrix[i][j] === 1) {
						ctx.beginPath();
						ctx.moveTo(nodePositions[i].x, nodePositions[i].y);
						ctx.lineTo(nodePositions[j].x, nodePositions[j].y);
						ctx.stroke();
					}
				}
			}
		}

		// Command to draw nodes
		if (this.cmd === "draw" && act === "nodes") {
			ctx.fillStyle = "blue";
			for (let i = 0; i < nodeCount; i++) {
				const { x, y } = nodePositions[i];
				ctx.beginPath();
				ctx.arc(x, y, 10, 0, 2 * Math.PI); // Nodes as circles
				ctx.fill();

				// Label the nodes
				ctx.fillStyle = "white";
				ctx.font = "12px Arial";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(i, x, y);
				ctx.fillStyle = "blue";
			}
		}*/
	}
}