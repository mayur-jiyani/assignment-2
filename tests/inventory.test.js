const request = require('supertest');
const app = require('../src/app')

test('Should create inventory', async () => {
    await request(app)
        .post('/inventory/create')
        .field({

            "inventory_name": "tomato",
            "inventory_category": "veg",
            "expiry_time": "2023-11-19 03:35:30",
            "quantity": "56",
            "manufacturing_time": "2020-11-19 03:35:30"
            // var inventory_image = upload;

        })
        .attach('avatar', 'tests/fixtures/inventory-pic.jpg')
        .expect(200)
    // .attach('avatar', 'tests/fixtures/inventory-pic.jpg')

})

test('Should retrieve tasks', async () => {
    const response = await request(app)
        .get('/inventory/search')
        .send({
            inventory_name: "zunk"
        })
        .expect(200)

    // const arr = response.body
    // console.log(response.body);
    // expect(Object.keys(response.body).length).toEqual(7)
    // expect(Object.keys(arr[0]).length).toEqual(7)
    // expect(response.body[0].length).toEqual(7)
})


test('Should update the quantity of inventory', async () => {
    await request(app)
        .patch('/inventory/update/2')
        .send({
            "quantity": 101
        })
        .expect(200)
})

test('Should update valid field', async () => {
    await request(app)
        .patch('/inventory/update/2')
        .send({
            "location": 101
        })
        .expect(400)
})

test('Should delete record from mysql database by id', async () => {
    const response = await request(app)
        .delete('/delete/inventory/43')
        .send()
        .expect(200)

})

test('Should delete record from mysql database by inventory name', async () => {
    const response = await request(app)
        .delete('/inventory/delete/name')
        .send({
            inventory_name: "tomato"
        })
        .expect(200)
})

test('Should delete image from mysql database', async () => {
    const response = await request(app)
        .patch('/inventory/delete/image/21')
        .send()
        .expect(200)

})
