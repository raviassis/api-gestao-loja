const request = require('supertest')(require('../../app'));
const constants = require('../../util/constants');
const db = require('../../data');
const products = require('./products.seed');

describe('/products', () => {
    beforeAll(async () => {
        await db.migrate.rollback(undefined, true);
        await db.migrate.latest();
        await db('products').insert(products);
    });

    afterAll(async () => {
        await db.destroy();
    });

    it('should list first 10th products', (done) => {
        const expected = products.slice(0, 9);
        request
            .get('/products')
            .expect(constants.http.OK)
            .expect(resp => {
                const {q, limit, offset, data} = resp.body;
                expect(q).toBe('');
                expect(limit).toBe(10);
                expect(offset).toBe(0);
                expect(data).toBe(expected);
            })
            .end(done);
    });
});