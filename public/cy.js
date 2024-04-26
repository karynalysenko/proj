// import cytoscape from 'cytoscape';
import { defaultStyle, moleculeStyle } from './styles.js';

document.addEventListener('DOMContentLoaded', function() {
    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [],
        layout:{ name : 'grid' },
        style: { name: 'default' }
    });

    // Function to apply the selected style
    function applyStyle(style) {
        // cy.style().clear(); // Clear existing styles
        cy.style().fromJson(style).update(); // Apply new style

    }


    // Apply the selected style
    const styleSelect = document.getElementById('style-select');
    styleSelect.addEventListener('change', function() {
        const selectedStyle = styleSelect.value;
        switch (selectedStyle) {
            case 'default':
                applyStyle(defaultStyle);
                break;
            case 'molecule':
                applyStyle(moleculeStyle);
                break;
            default:
                break;
        }
    });

    // Function to apply the selected layout
    function applyLayout(layoutName) {
        cy.layout({ name: layoutName }).run();
    }

    function setDefault() {
        applyStyle(defaultStyle);
        styleSelect.value = 'default';
        layoutIcons.value = 'grid';
        fileInput.value = ''
    }
    // Apply the selected layout
    // const layoutSelect = document.getElementById('layout-select');
    // layoutSelect.addEventListener('change', function() {
    //     const selectedLayout = layoutSelect.value;
    //     applyLayout(selectedLayout);
    // });
    // Apply the selected layout
    const layoutIcons = document.getElementById('layout-icons');

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


    // Event listener for file input change
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return; // No file selected

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        const jsonData = Papa.parse(data, { header: true }).data;

        // Store the parsed data in a variable accessible to the 'Run' button click event
        window.parsedData = jsonData;

        console.log('Parsed data:', window.parsedData);
    };
    reader.readAsText(file);
    });


    // Event listener for 'Run' button click
    const runBtn = document.getElementById('run-btn');
    runBtn.addEventListener('click', function() {
        console.log('Run button clicked');

        if (!window.parsedData) {
            alert('Please select an XLSX file first.');
            return;
        }

        // Process the parsed data and create nodes and edges
        window.parsedData.forEach(row => {
            const source = row['source'];
            const target = row['target'];

            if (source && target) {
                cy.add([
                    { data: { id: source } },
                    { data: { id: target } },
                    { data: { id: `${source}-${target}`, source: source, target: target } }
                ]);
            }
        });

        applyLayout(layoutIcons.value);

    });

    setDefault();

    window.addEventListener('resize', function() {
        cy.resize(); // Resize the cytoscape container
        cy.layout({ name: 'grid' }).run(); // Run the layout to adjust the network elements
    });
});
