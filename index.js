const express = require('express');

const app = express();

app.use(express.json()); //parsing Json Objects

const drugs = [
    { id: 1, name: 'drug1' },
    { id: 2, name: 'drug2' },
    { id: 3, name: 'drug3' }
];

app.get('/', (req, resp) => {
    resp.send('OK')
});

//Get all drugs
app.get('/api/drugs', (req, res) =>  { 

    res.send(drugs);
});

//Get drug with given id
app.get('/api/drugs/:id', (req, res) => { 

    //res.send({ 'id': req.params.id });
    const drug = drugs.find(c => c.id === parseInt(req.params.id));
    if (!drug) {
      res.status(404).send('drug with given id not found');
    }
    res.send(drug);
    //res.send(req.query);

})

app.post('/api/drugs', (req, res) => {
    const drug = {
        id: drugs.length + 1,
        name: req.body.name
    };

    drugs.push(drug);
    res.send(drug);
});
//app.put()
//app.delete()

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`))