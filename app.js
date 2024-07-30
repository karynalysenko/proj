const express = require('express');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(`App running on port ${port}`)
});
// é um middleware. o que estiver aqui dentro, será acessivel publicamente(no browser)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/help', (req, res) => {
    res.render('help');
}); 

// tem de ficar no fim
app.use((req, res) => {
    res.status(404).render('404');
});

