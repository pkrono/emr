const Joi = require('joi');
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
        return res.status(404).send('drug with given id not found');
    }
    res.send(drug);
    //res.send(req.query);

})

app.post('/api/drugs', (req, res) => {

    const result = validateDrug(req.body);

    if (result.error) {
        //http status code 400-Bad request
        return res.status(400).send(result.error.details[0].message);
    }

    const drug = {
        id: drugs.length + 1,
        name: req.body.name
    };

    drugs.push(drug);
    res.send(drug);
});

app.put('/api/drugs/:id', (req, res) => {
    //check if exist

    const drug = drugs.find(c => c.id === parseInt(req.params.id));
    if (!drug) { 
        return res.status(404).send('Drug with the given id not found!');
    }
   
    //Validate
   const result = validateDrug(req.body)

    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    //Update drug
    drug.name = req.body.name;
    res.send(drug);
});

app.delete('/api/drugs/:id', (req, res) => {
    //check if exists
    const drug = drugs.find(c => c.id === parseInt(req.params.id));
    if (!drug) { 
        return res.status(404).send('Drug with the given id not found');
    }

    //Delete
    const index = drugs.indexOf(drug);
    drugs.splice(index, 1);

    res.send(drug)
});

function validateDrug(drug) { 
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(drug);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`))