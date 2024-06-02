const express = require('express');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log(`App running on port ${port}`)
});
// é um middleware. o que estiver aqui dentro, será acessivel publicamente(no broweser)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/help', (req, res) => {
    res.render('help');
}); 

// app.post('/import', (req, res) => {
//     const file = req.body
  
//     pool.query('INSERT INTO public.quotes (name, quote) VALUES ($1,$2)', [name, quote], (error, result) => {
//       if (error) {
//         throw error;
//       }
//       console.log('inserted')
//       //res.json(`Inserted new quote`)
//       res.redirect('/')
//     });
//   });
  

// tem de ficar no fim
app.use((req, res) => {
    res.status(404).render('404');
});

