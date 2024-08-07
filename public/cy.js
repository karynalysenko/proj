
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
    const expressionFileInput = document.getElementById('expression-file-input');
    const expressionRunBtn = document.getElementById('expression-run-btn');
    const menuBtn = document.getElementById('menu-btn');
    const configurations = document.getElementById('configurations');
    let proportionalNodeSizeEnabled = false;
    const nodeSizeOnBtn = document.getElementById('node-size-on');
    const nodeSizeOffBtn = document.getElementById('node-size-off');
    var modal = document.getElementById("modal");
    var span = document.getElementsByClassName("close")[0];
    
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy')
    });

    nodeSizeOnBtn.addEventListener('click', function() {
        proportionalNodeSizeEnabled = true;
    
        nodeSizeOnBtn.classList.add('selected');
        nodeSizeOffBtn.classList.remove('selected');
    
        adjustNodeSizes(proportionalNodeSizeEnabled, nodeSizeSlider.value);
    });
    
    nodeSizeOffBtn.addEventListener('click', function() {
        proportionalNodeSizeEnabled = false;
        // console.log(proportionalNodeSizeEnabled);
    
        nodeSizeOffBtn.classList.add('selected');
        nodeSizeOnBtn.classList.remove('selected');
    
        adjustNodeSizes(proportionalNodeSizeEnabled, nodeSizeSlider.value);
    });

    menuBtn.addEventListener('click', () => {
        if (configurations.style.display === 'none' || configurations.style.display === '') {
            configurations.style.display = 'block';
        } else {
            configurations.style.display = 'none';
        }
    });

    window.addEventListener('resize', function() {
        cy.resize(); 
    });

    bgColorPicker.addEventListener('input', function () {
        document.getElementById('cy').style.backgroundColor = bgColorPicker.value;
        styleSelect.value = 'new';
    });

    fontColorPicker.addEventListener('input', function () {
        cy.style().selector('node').style('color', fontColorPicker.value).update();
        styleSelect.value = 'new';
    });

    nodeColorPicker.addEventListener('input', function () {
        cy.style().selector('node').style('background-color', nodeColorPicker.value).update();
        
        if (expressionData){
            updateNodeColorsBasedOnExpression(expressionData);
        }
    });

    edgeColorPicker.addEventListener('input', function () {
        cy.style().selector('edge').style('line-color', edgeColorPicker.value).update();
        cy.style().selector('edge').style('target-arrow-color', edgeColorPicker.value).update();
        styleSelect.value = 'new';
    });

    styleSelect.addEventListener('input', function() {
        const selectedStyle = styleSelect.value;
        switch (selectedStyle) {
            case 'default':
                applyStyle(defaultStyle);
                nodeColorPicker.value = '#666666';
                bgColorPicker.value = '#ffffff';
                edgeColorPicker.value = '#cccccc';
                fontColorPicker.value = '#000000';
                cy.container().style.backgroundColor = stylesBackgroundColor.default;
                break;
            case 'molecule':
                applyStyle(moleculeStyle);
                nodeColorPicker.value = '#0000ff';
                bgColorPicker.value = '#ffffe0';
                edgeColorPicker.value = '#ff0000';
                fontColorPicker.value = '#9962a9';
                cy.container().style.backgroundColor = stylesBackgroundColor.molecule;
                break;
            default:
                break;
            
        }
        if (expressionData){
            updateNodeColorsBasedOnExpression(expressionData);
        }
    });

    layoutIcons.addEventListener('click', function(event) {
        const selectedIcon = event.target.closest('button');
        document.querySelectorAll('.layout-icon-group .btn').forEach(btn => btn.classList.remove('active'));
        selectedIcon.classList.add('active');

        switch (selectedIcon.id) {
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
        const selectedIcon = event.target.closest('button');
        document.querySelectorAll('.node-icon-group .btn').forEach(btn => btn.classList.remove('active'));
        selectedIcon.classList.add('active');

        switch (selectedIcon.id) {
            case 'ellipse-icon':
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
        adjustNodeSizes(proportionalNodeSizeEnabled, nodeSizeSlider.value);
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
        handleFileUpload(event, 'main Graph', function(jsonData) {
            window.parsedData = jsonData;
    
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
        // console.log(layoutIcons.value)
        applyLayout(layoutIcons.value);
        adjustNodeSizes(proportionalNodeSizeEnabled, nodeSizeSlider.value);

        // nodeSizeSlider.disabled = false;
        nodeSizeSlider.value = 1;

        // document.querySelectorAll('.additional-controls').forEach(element => {
        //     element.style.display = 'block';
        // });
    });

    expressionFileInput.addEventListener('change', function(event) {
        handleFileUpload(event,'Expression', function(jsonData) {
            expressionData = jsonData;
            // console.log('Expression data:', expressionData);
        });
    });

    expressionRunBtn.addEventListener('click', function() {
        if (!expressionData) {
            alert('Please select a CSV file for expression values first.');
            return;
        }

        const expressionElem = updateNodeColorsBasedOnExpression(expressionData)

        let highestExpressionNodes = [];
        let lowestExpressionNodes = [];

        expressionElem.expressionMap.forEach((value, node) => {
            if (value === expressionElem.maxValue) {
                highestExpressionNodes.push(node);
            }
            if (value === expressionElem.minValue) {
                lowestExpressionNodes.push(node);
            }
        });

        const topHighestExpressionNodes = highestExpressionNodes.slice(0, 3);
        const topLowestExpressionNodes = lowestExpressionNodes.slice(0, 3);
        
        const expressionDetails = document.getElementById('expression-details');
        expressionDetails.style.display = 'block';
        const highestNodeDisplay = document.getElementById('highest-expression-node');
        const lowestNodeDisplay = document.getElementById('lowest-expression-node');
        highestNodeDisplay.innerHTML = `Top 3 nodes with highest expression: <br>(${expressionElem.maxValue})<br>${topHighestExpressionNodes}`;
        lowestNodeDisplay.innerHTML = `Top 3 nodes lowest expression: <br>(${expressionElem.minValue})<br>${topLowestExpressionNodes}`;   

        console.log("Expression Map:", expressionElem.expressionMap);
        
    });



    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    exportBtn.addEventListener('click', function() {
        const pngData = cy.png({
            bg: bgColorPicker.value
        });
        const link = document.createElement('a');
        link.href = pngData;
        link.download = 'network.png';
        link.click();
    });


 //FUNCTIONS////////////////////////
    function setDefault() {
        styleSelect.value = 'default';
        layoutIcons.value = 'grid';
        nodeColorPicker.value = '#666666';
        bgColorPicker.value = '#ffffff';
        fileInput.value = '';
        nodeSizeSlider.value = 1;
        nodeSearchInput.value = '';
        fontColorPicker.value = '#000000';
        expressionFileInput.value = '';
        edgeColorPicker.value = '#CCCCCC';
        nodeIcons.value = 'circular'
        document.getElementById('grid-icon').click(); 
        document.getElementById('ellipse-icon').click();
        nodeSizeOffBtn.classList.add('selected');
        applyStyle(defaultStyle);
    }
 
    function applyStyle(style) {
        // cy.style().clear(); // Clear existing styles
        cy.style().fromJson(style).update();
    }
    
    function applyLayout(layoutName) {
        cy.layout({ name: layoutName }).run();
    }

    function applyNodeShape(selectedShape) {
        cy.style().selector('node').style('shape', selectedShape).update();
        if (selectedShape !== 'ellipse'){
            styleSelect.value = 'new';
        }
    }

    function adjustNodeSizes(proportional, multiplier) {
        cy.nodes().forEach(node => {
            const degree = node.degree();
            let size = proportional ? 10 * degree * multiplier : 10 * multiplier;
            node.style('width', size);
            node.style('height', size);
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

    function handleFileUpload(event, typeFile, callback) {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (!file) return;
        
        reader.onload = function(event) {
            const data = event.target.result;
            
            try {
                const parsedData = Papa.parse(data, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true
                });
    
                if (parsedData.errors.length) {
                    throw new Error(parsedData.errors.map(e => e.message).join(', '));
                }
    
                // console.log('Parsed Data:', parsedData.data);
                if (validateFile(parsedData.data, typeFile)) {
                    callback(parsedData.data);
                } else {
                    showModal('The file does not meet the requirements for the ' + typeFile + ' file.');
                }
            } catch (error) {
                showModal('The file could not be parsed: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    function updateNodeColorsBasedOnExpression(expressionData) {
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

        adjustNodeColors(expressionMap, minValue, maxValue);
        return{expressionMap, minValue, maxValue};
    }

    function showModal(message) {
        var modalMessage = document.getElementById("modal-message");
        modalMessage.textContent = message;
        modal.style.display = "block";
    }

    function validateFile(jsonData, typeFile) {
        if (typeFile === 'main Graph') {
            for (let row of jsonData) {
                if (!row.hasOwnProperty('source') || !row.hasOwnProperty('target')) {
                    return false;
                }
                if (row.hasOwnProperty('directed')) {
                    if (row.directed === null) {
                        row.directed = 'false'; // Treat null as 'false'
                    } else if (typeof row.directed === 'boolean') {
                        row.directed = row.directed.toString(); // Convert boolean to string
                    } else if (typeof row.directed !== 'string' || 
                        (row.directed.toLowerCase() !== 'true' && row.directed.toLowerCase() !== 'false')) {
                            return false;
                    }
                }
            }
        } else if (typeFile === 'Expression') {
            for (let row of jsonData) {
                if (!row.hasOwnProperty('GENE') || !row.hasOwnProperty('EXPRESSION')) {
                    return false;
                
                } else if (typeof row.EXPRESSION !== 'number'){
                    showModal('The EXPRESSION values must be only numbers!');
                    // return false;
                }
            }
        } else {
            // Unsupported file type
            return false;
        }
        return true;
    }
    setDefault();
    
});

