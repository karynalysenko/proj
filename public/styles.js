// Default style
const defaultStyle = [
    {
        selector: 'node',
        style: {
            'background-color': '#666',
            'label': 'data(id)'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
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
            'label': 'data(id)'
        }
    },
    {
        selector: 'edge',
        style: {
            'line-color': 'red',
            'target-arrow-color': 'green'
        }
    }
];

export { defaultStyle, moleculeStyle };