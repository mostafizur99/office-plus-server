const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware    
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test1.trceg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("Office-plus");
        const employeeCollection = database.collection("employees");

        // GET API (for all employees)
        app.get('/employees', async (req, res) => {
            const cursor = employeeCollection.find({});
            const employees = await cursor.toArray();
            res.send(employees);
        });

        // POST API (for Create an Employee) 
        app.post('/employees', async (req, res) => {
            const newEmployee = req.body;
            const result = await employeeCollection.insertOne(newEmployee);
            console.log('added user', result);
            res.json(result);
        });

        // GET API (for single Employee by ID)
        app.get('/employee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const employee = await employeeCollection.findOne(query);
            res.send(employee);
        })

        // DELETE API 
        app.delete('/employee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await employeeCollection.deleteOne(query);
            console.log('deleting user with id', result)
            res.json(result);
        })

        // UPDATE API 
        app.put('/employee/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEmployee = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    employee_name: updatedEmployee.employee_name,
                    email: updatedEmployee.email,
                    employee_age: updatedEmployee.employee_age,
                    employee_salary: updatedEmployee.employee_salary,
                    employee_duration: updatedEmployee.employee_duration

                },
            };
            const result = await employeeCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', updatedEmployee)
            res.json(result)
        })


    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running office-plus server')
})

app.listen(port, () => {
    console.log('Running Server on port', port)
})