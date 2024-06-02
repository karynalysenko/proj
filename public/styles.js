// Default style
const defaultStyle = [
    {   selector: 'cy',
        style: {
            'background-color': '#666'
        }
    },
    {
        selector: 'node',
        style: {
            'background-color': '#666',
            'label': 'data(id)',
            // 'text-valign': 'center',
            // 'color': '#000',
            'border-width': 2,
            'border-color': '#000'
        }
    },
    {
        selector: 'edge.directed',
        style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ccc'
        }
    }
];

// Molecule style
const moleculeStyle = [
    {
        selector: 'node',
        style: {
            'background-color': 'blue',
            'shape': 'rectangle',
            'label': 'data(id)',
            'border-width': 2,
            'border-color': '#000'
        }
    },
    {
        selector: 'edge',
        style: {
            'line-color': 'red',
            'target-arrow-color': 'green',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
        }
    }
];
const stylesBackgroundColor = {
    default: '#ffffff',   // white
    molecule: '#ffffe0'   // light yellow
};

export { defaultStyle, moleculeStyle, stylesBackgroundColor };