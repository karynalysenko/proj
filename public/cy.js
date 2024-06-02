// import cytoscape from 'cytoscape';
import { defaultStyle, moleculeStyle, stylesBackgroundColor } from './styles.js';

let expressionData = null;

document.addEventListener('DOMContentLoaded', function() {
    const bgColorPicker = document.getElementById('bg-color-picker');
    const fontColorPicker = document.getElementById('font-color-picker');
    const nodeColorPicker = document.getElementById('node-color-picker');
    const edgeColorPicker = document.getElementById('edge-color-picker');
    const styleSelect = document.getElementById('style-select');
    const layoutIcons = document.getElementById('layout-icons');
    const nodeIcons = document.getElementById('node-icons');
    const nodeSizeSlider = document.getElementById('node-size-slider');
    const nodeSearchInput = document.getElementById('node-search-input');
    const nodeSearchBtn = document.getElementById('node-search-btn');
    const runBtn = document.getElementById('run-btn');
    const fileInput = document.getElementById('file-input');
    const nodeCountDisplay = document.getElementById('node-count');
    const edgeCountDisplay = document.getElementById('edge-count');
    const exportBtn = document.getElementById('export-btn');
    const expressionYes = document.getElementById('expression-yes');
    const expressionNo = document.getElementById('expression-no');
    const expressionContainer = document.getElementById('expression-container');
    const expressionFileInput = document.getElementById('expression-file-input');
    const expressionRunBtn = document.getElementById('expression-run-btn');
    const menuBtn = document.getElementById('menu-btn');
    const configurations = document.getElementById('configurations');

    
    menuBtn.addEventListener('click', () => {
        if (configurations.style.display === 'none' || configurations.style.display === '') {
            configurations.style.display = 'block';
        } else {
            configurations.style.display = 'none';
        }
    });

    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),
        // style: defaultStyle,
        elements: []
        // layout:{ name : 'grid' },
        // style: 
        //     { name: 'default' }
    });

    window.addEventListener('resize', function() {
        cy.resize(); // Resize the cytoscape container
        // cy.layout({ name: 'random' }).run(); // Run the layout to adjust the network elements
    });

    bgColorPicker.addEventListener('input', function () {
        document.getElementById('cy').style.backgroundColor = bgColorPicker.value;
        // cy.style().selector('cy').style('background-color', bgColorPicker.value).update();
        
    });

    fontColorPicker.addEventListener('input', function () {
        cy.style().selector('node').style('color', fontColorPicker.value).update();
    });

    nodeColorPicker.addEventListener('input', function () {
        cy.style().selector('node').style('background-color', nodeColorPicker.value).update();
    });

    edgeColorPicker.addEventListener('input', function () {
        cy.style().selector('edge').style('line-color', edgeColorPicker.value).update();
        cy.style().selector('edge').style('target-arrow-color', edgeColorPicker.value).update();
    });

    styleSelect.addEventListener('input', function() {
        const selectedStyle = styleSelect.value;
        switch (selectedStyle) {
            case 'default':
                applyStyle(defaultStyle);
                nodeColorPicker.value = '#666666';
                bgColorPicker.value = '#f0f0f0';
                cy.container().style.backgroundColor = stylesBackgroundColor.default;
                break;
            case 'molecule':
                applyStyle(moleculeStyle);
                nodeColorPicker.value = '#0000ff';
                bgColorPicker.value = '#ffffe0';
                cy.container().style.backgroundColor = stylesBackgroundColor.molecule;
                break;
            default:
                break;
        }
    });

    layoutIcons.addEventListener('click', function(event) {
        const selectedIcon = event.target.id;

        switch (selectedIcon) {
            case 'grid-icon':
                applyLayout('grid');
                break;
            case 'circle-icon':
                applyLayout('circle');
                break;
            case 'random-icon':
                applyLayout('random');
                break;
            default:
                break;
        }
    });

    nodeIcons.addEventListener('click', function(event) {
        const selectedIcon = event.target.id;

        switch (selectedIcon) {
            case 'circle-icon':
                applyNodeShape('ellipse');
                break;
            case 'triangle-icon':
                applyNodeShape('triangle');
                break;
            case 'rectangle-icon':
                applyNodeShape('rectangle');
                break;
            case 'star-icon':
                applyNodeShape('star');
                break;
            default:
                break;
        }
    });

    nodeSizeSlider.addEventListener('input', function() {
        const multiplier = nodeSizeSlider.value;
        const nodeCounts = calculateNodeCounts(window.parsedData).nodeCounts;
        adjustNodeSizes(nodeCounts, multiplier);
    });
    
    nodeSearchBtn.addEventListener('click', function() {
        const searchValue = nodeSearchInput.value.trim();
        if (searchValue) {
            const node = cy.$id(searchValue);
            if (node.length > 0) {
                cy.zoom({
                    level: 2, // Adjust the zoom level as needed
                    position: node.position()
                });
                cy.center(node); // Center the node in the viewport
            } else {
                alert('Node not found');
            }
        } else {
            alert('Please enter a node ID');
        }
    });

    fileInput.addEventListener('change', function(event) {
        handleFileUpload(event, function(jsonData) {
            window.parsedData = jsonData;
            // console.log('Parsed data:', window.parsedData);
        });
    });

    runBtn.addEventListener('click', function() {

        if (!window.parsedData) {
            alert('Please select a CSV file first.');
            return;
        }
        cy.elements().remove();

        const hasDirectedColumn = window.parsedData[0] && window.parsedData[0].hasOwnProperty('directed');
        window.parsedData.forEach(row => {
            const source = row['source'];
            const target = row['target'];
            const direction = hasDirectedColumn && row['directed'] && row['directed'].toLowerCase() === 'true';

            if (source && target) {
                cy.add([
                    { group: 'nodes', data: { id: source } },
                    { group: 'nodes', data: { id: target } },
                    {
                        group: 'edges',
                        data: { id: `${source}-${target}`, source: source, target: target },
                        classes: direction ? 'directed' : ''
                    }
                ]);
                console.log(`Edge added: ${source} -> ${target}, directed: ${direction}`);
            }
            
        });

        const elemCounts = calculateNodeCounts(window.parsedData);
        nodeCountDisplay.textContent = `Node Count: ${elemCounts.nodeCounts.size}`;
        edgeCountDisplay.textContent = `Edge Count: ${elemCounts.edges.length}`;
        
        applyLayout(layoutIcons.value);
        
        adjustNodeSizes(elemCounts.nodeCounts);
        // nodeSizeSlider.disabled = false;
        nodeSizeSlider.value = 1;

        document.querySelectorAll('.additional-controls').forEach(element => {
            element.style.display = 'block';
        });
    });

    expressionYes.addEventListener('change', function() {
        if (expressionYes.checked) {
            expressionContainer.style.display = 'block';
        }
    });

    expressionNo.addEventListener('change', function() {
        if (expressionNo.checked) {
            expressionContainer.style.display = 'none';
        }
    });
  
    expressionFileInput.addEventListener('change', function(event) {
        handleFileUpload(event, function(jsonData) {
            expressionData = jsonData;
            // console.log('Expression data:', expressionData);
        });
    });

    expressionRunBtn.addEventListener('click', function() {
        if (!expressionData) {
            alert('Please select a CSV file for expression values first.');
            return;
        }

        const expressionMap = new Map();
        expressionData.forEach(row => {
            const node = row['GENE'];
            const value = parseFloat(row['EXPRESSION']);
            if (node && !isNaN(value)) {
                expressionMap.set(node, value);
            }
        });

        const minValue = Math.min(...expressionMap.values());
        const maxValue = Math.max(...expressionMap.values());
        
        console.log("Expression Map:", expressionMap);
        // console.log("Min Value:", minValue, "Max Value:", maxValue);
        

        adjustNodeColors(expressionMap, minValue, maxValue);
        // addNodesAndEdges(expressionData);
    });




    exportBtn.addEventListener('click', function() {
        const pngData = cy.png();
        const link = document.createElement('a');
        link.href = pngData;
        link.download = 'network.png';
        link.click();
    });

 //FUNCTIONS////////////////////////
 
    function applyStyle(style) {
        // cy.style().clear(); // Clear existing styles
        cy.style().fromJson(style).update(); // Apply new style
    }
    
    function applyLayout(layoutName) {
        cy.layout({ name: layoutName }).run();
    }
    function applyNodeShape(selectedShape) {
        cy.style().selector('node').style('shape', selectedShape).update();
    }

    function setDefault() {
        applyStyle(defaultStyle);
        styleSelect.value = 'new';
        layoutIcons.value = 'grid';
        nodeColorPicker.value = '#666666';
        bgColorPicker.value = '#f0f0f0';
        fileInput.value = ''
        nodeSizeSlider.value = 1;
        nodeSearchInput.value = '';
        fontColorPicker.value = '#000000';
        expressionNo.checked = true;
        expressionYes.checked = false;
        expressionFileInput.value = '';
        edgeColorPicker.value = '#CCCCCC';
        nodeIcons.value = 'circular'

    }
    
    function adjustNodeSizes(nodeCounts, multiplier = 1) {
        nodeCounts.forEach((count, node) => {
            const cyNode = cy.$id(node);
            if (cyNode.length > 0) {
                const size = count * 10 * multiplier;
                cyNode.style('width', size + 'px').style('height', size + 'px');
            }
        });
    }

    function calculateNodeCounts(data) {
        const nodeCounts = new Map();
        const edges = []; //not being used

        data.forEach(entry => {
            if (entry.source && entry.target) {
                edges.push(entry);

                // Increment edge count for source node
                nodeCounts.set(entry.source, (nodeCounts.get(entry.source) || 0) + 1);
                // Increment edge count for target node
                nodeCounts.set(entry.target, (nodeCounts.get(entry.target) || 0) + 1);
            }
        });
        return {nodeCounts, edges};
    }
    
    function adjustNodeColors(expressionMap, minValue, maxValue) {
        const nodeColorSelect = document.getElementById('node-color-picker').value;

        expressionMap.forEach((value, node) => {
            const cyNode = cy.$id(node);
            if (cyNode.length > 0) {
                const intensity = (value - minValue) / (maxValue - minValue);
                const rgbaColor = gradientColor('#ffffff', nodeColorSelect, intensity);
                console.log(`Node: ${node}, Value: ${value}, Intensity: ${intensity}, RGBA Color: ${rgbaColor}`);
                cyNode.style('background-color', rgbaColor);
            } else {
                console.log(`Node ${node} not found in the graph.`);
            }
        });
    }

    function gradientColor(startColor, endColor, percentage) {
        const startRGB = hexToRGB(startColor);
        const endRGB = hexToRGB(endColor);
        const r = startRGB[0] + percentage * (endRGB[0] - startRGB[0]);
        const g = startRGB[1] + percentage * (endRGB[1] - startRGB[1]);
        const b = startRGB[2] + percentage * (endRGB[2] - startRGB[2]);
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    function hexToRGB(hex) {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16)
        ];
    }

    function handleFileUpload(event, callback) {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            const jsonData = Papa.parse(data, { header: true }).data;
            callback(jsonData);
        };
        reader.readAsText(file);
    }

    setDefault();
    // function addNodesAndEdges(data) {
    //     const nodes = new Set();
    //     const edges = [];

    //     data.forEach(row => {
    //         const source = row['source'];
    //         const target = row['target'];
    //         const directed = row['direction'] && row['direction'].toLowerCase() === 'true';



    //         if (source && target) {
    //             cy.add([
    //                 { group: 'nodes', data: { id: source } },
    //                 { group: 'nodes', data: { id: target } },
    //                 {
    //                     group: 'edges',
    //                     data: { id: `${source}-${target}`, source: source, target: target },
    //                     classes: directed ? 'directed' : ''
    //                 }
    //             ]);
    //             console.log(`FUNCTION - Edge added: ${source} -> ${target}, directed: ${direction}`);
    //         }
    //     });
    //     applyLayout(layoutIcons.value);
    // }
});


