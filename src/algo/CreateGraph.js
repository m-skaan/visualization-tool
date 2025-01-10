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

import {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { BFS_DFS_ADJ_LIST } from './util/GraphValues';
import Graph from './Graph.js';
import { act } from '../anim/AnimationMain';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

let adjMatrix =
	//A     B      C     D      E     F      G      H
	/*A*/ [
		[0, 1, 0, 1, 0, 0, 0, 0],
		/*B*/ [1, 0, 0, 0, 0, 0, 0, 0],
		/*C*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*D*/ [1, 0, 0, 0, 0, 0, 0, 0],
		/*E*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*F*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*G*/ [0, 0, 0, 0, 0, 0, 0, 0],
		/*H*/ [0, 0, 0, 0, 0, 0, 0, 0],
	].map(row => row.map(x => x || -1));

export default class CreateGraph extends Graph {
	constructor(am, w, h) {
		super(am, w, h, BFS_DFS_ADJ_LIST);
		this.addControls();
		//playground here
		this.nextIndex = 0;
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
		this.listField.value = 'A->B,C,D,E\nB->A,G\nC->A\nD->A,F\nE->A,G\nF->D,G\nG->B,E,F,H\nH->G';

		// Add an input event listener to restrict input
		this.listField.addEventListener('input', function (event) {
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

		addDivisorToAlgorithmBar();

		/*let radioButtonList = addRadioButtonGroupToAlgorithmBar(
			['Small Graph', 'Large Graph'],
			'GraphSize',
		);

		this.smallGraphButton = radioButtonList[0];
		this.smallGraphButton.onclick = this.smallGraphCallback.bind(this, adjMatrix);
		this.smallGraphButton.checked = true;
		this.controls.push(this.smallGraphButton);

		this.largeGraphButton = radioButtonList[1];
		this.largeGraphButton.onclick = this.largeGraphCallback.bind(this);
		this.controls.push(this.largeGraphButton);

		addDivisorToAlgorithmBar();*/

		// We are explicitly not adding the buttons below to this.controls
		// since we don't want them to be disabled
		const radioButtonList = addRadioButtonGroupToAlgorithmBar(
			[
				'Logical Representation',
				'Adjacency List Representation',
				'Adjacency Matrix Representation',
			],
			'GraphRepresentation',
		);

		this.logicalButton = radioButtonList[0];
		this.logicalButton.onclick = this.graphRepChangedCallback.bind(this, 1);

		this.adjacencyListButton = radioButtonList[1];
		this.adjacencyListButton.onclick = this.graphRepChangedCallback.bind(this, 2);

		this.adjacencyMatrixButton = radioButtonList[2];
		this.adjacencyMatrixButton.onclick = this.graphRepChangedCallback.bind(this, 3);
		this.logicalButton.checked = true;
	}

	startCallback() {
		if (this.listField.value !== '') {
			// Parsing the adjacency list from the input
			const adjacencyList = this.listField.value.split('\n').map(line => {
				let [node, neighbors] = line.split('->');
				node = node.trim();
				neighbors = neighbors ? neighbors.split(',') : [];
				return { node: node.trim(), neighbors: neighbors.map(n => n.trim()) };
			});
			this.updateAdjMatrix(adjacencyList);
			this.smallGraphCallback(adjMatrix);
		} else {
			this.shake(this.runButton); // Shake button if no input
		}
	}

	updateAdjMatrix(adjacencyList) {
		adjMatrix = adjMatrix.map(row => row.map(() => -1));

		// Update adjMatrix based on the adjacency list
		adjacencyList.forEach(({ node, neighbors }) => {
			const nodeIdx = node.charCodeAt(0) - 'A'.charCodeAt(0); // Map node to its fixed index
			neighbors.forEach(neighbor => {
				const neighborIdx = neighbor.charCodeAt(0) - 'A'.charCodeAt(0); // Map neighbor to its fixed index
				adjMatrix[nodeIdx][neighborIdx] = 1; // Add edge
				adjMatrix[neighborIdx][nodeIdx] = 1; // Assuming undirected graph
			});
			adjMatrix[nodeIdx][nodeIdx] = 1; // add self loop to enable disconnected graphs
		});
	}

	setup(adjMatrix) {
		super.setup(adjMatrix);
		this.commands = [];
		this.messageID = [];

		this.visited = [];

		this.stackID = [];
		this.listID = [];
		this.visitedID = [];

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.animationManager.setAllLayers([0, 32, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.lastIndex = this.nextIndex;
	}

	reset() {
		this.nextIndex = this.lastIndex;
		this.listID = [];
		this.visitedID = [];
		this.messageID = [];
	}

	clear() {
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], '#FFFFFF');
			this.visited[i] = false;
		}
		for (let i = 0; i < this.listID.length; i++) {
			this.cmd(act.delete, this.listID[i]);
		}
		this.listID = [];
		for (let i = 0; i < this.visitedID.length; i++) {
			this.cmd(act.delete, this.visitedID[i]);
		}
		this.visitedID = [];
		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.messageID = [];
		this.cmd(act.setText, this.infoLabelID, '');
	}

	//overloaded Callback for use with CreateGraph class
	smallGraphCallback(adj_matrix) {
		this.animationManager.resetAll();
		this.setup_small(adj_matrix);
	}
}
