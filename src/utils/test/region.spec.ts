import supertest from 'supertest';
import { expect } from 'chai';
import server from '../../server';
import { RegionModel } from '../../repositories/models';
import { faker } from '@faker-js/faker';
import sinon from 'sinon';

describe('RegionsController', () => {
  const STATUS = {
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 400,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    DEFAULT_ERROR: 418,
  };

  describe('Route POST regions/user', () => {
    beforeEach(async () => {
      await RegionModel.deleteMany({});
    });

    afterEach(async () => {
      await RegionModel.deleteMany({});
    });

    // Teste de criação de região com sucesso
    // it('should create a region successfully', async () => {
    //   const response = await supertest(server)
    //     .post('/regions/create')
    //     .send({
    //         name: "Test Region",
    //         user: "657619e3035b956f769ece55", 
    //         coordinates: {
    //             latitude: 40.689247,
    //             longitude: -74.044502,
    //         },
    //     });

    //   expect(response.status).to.equal(STATUS.CREATED);
    //   expect(response.body).to.have.property('message', 'Region created successfully');

    //   const createdRegion = await RegionModel.findById(response.body.region._id).lean();
    //   expect(createdRegion).to.exist;
    //   expect(createdRegion).to.have.property('name', 'Test Region');
    //   expect(createdRegion).to.have.property('user', '657619e3035b956f769ece55');
    //   expect(createdRegion.coordinates).to.deep.equal({
    //     latitude: 40.689247,
    //     longitude: -74.044502,
    //   });
    // });

    // Teste para entrada inválida
    it('should handle internal server error', async () => {
      // Forçar um erro interno ao criar uma região
      const createStub = sinon.stub(RegionModel, 'create');
      createStub.rejects(new Error('Simulated internal server error'));

      const response = await supertest(server)
        .post('/regions/create')
        .send({
          name: 'Test Region',
          user: '657619e3035b956f769ece55',
        });

      expect(response.status).to.equal(STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).to.have.property('message', 'Internal server error');

      createStub.restore();
    });
  });

  describe('Route GET regions/show', () => {
    beforeEach(async () => {
      await RegionModel.deleteMany({});
    });

    afterEach(async () => {
      await RegionModel.deleteMany({});
    });

    // Teste para obter uma lista de regiões
    it('should return a list of regions', async () => {
        
      const response = await supertest(server).get('/regions/region');
      expect(response.status).to.equal(STATUS.OK);

    });

    // Teste para lidar com erro ao contar regiões
    it('should handle unexpected error', async () => {
      const countStub = sinon.stub(RegionModel, 'count');
      countStub.rejects(new Error('Simulated count error'));

      const response = await supertest(server).get('/regions/region');

      expect(response.status).to.equal(STATUS.DEFAULT_ERROR);
      expect(response.body).to.have.property('message', 'Unexpected error');

      countStub.restore();
    });
  });

  describe('Route GET regions/regions/:id', () => {
    beforeEach(async () => {
      await RegionModel.deleteMany({});
    });

    afterEach(async () => {
      await RegionModel.deleteMany({});
    });

    // Teste para encontrar uma região por ID
    // it('should find a region and return 200 status', async () => {
    //   const createdRegion = await RegionModel.create({ name: 'Region 1', user: 'user1' });

    //   const response = await supertest(server).get(`/regions/regions/${createdRegion._id}`);

    //   expect(response.status).to.equal(STATUS.OK);
    //   expect(response.body).to.deep.equal({
    //     _id: createdRegion._id.toString(),
    //     name: 'Region 1',
    //     user: 'user1',
    //   });
    // });

    // Teste para lidar com região não encontrada
    it('should handle region not found', async () => {
      const nonExistentRegionId = 'nonExistentId';

      const response = await supertest(server).get(`/regions/regions/${nonExistentRegionId}`);

      expect(response.status).to.equal(STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).to.have.property('message', 'Region not found');
    });

    // Teste para lidar com erro interno do servidor
    it('should handle internal server error', async () => {
      const findOneStub = sinon.stub(RegionModel, 'findOne');
      findOneStub.rejects(new Error('Simulated findOne error'));

      const response = await supertest(server).get('/regions/regions/someRegionId');

      expect(response.status).to.equal(STATUS.DEFAULT_ERROR);
      expect(response.body).to.have.property('message', 'Unexpected error');

      findOneStub.restore();
    });
  });

describe('listRegionsWithinDistance', () => {
    beforeEach(async () => {
      await RegionModel.deleteMany({});
    });

    afterEach(async () => {
      await RegionModel.deleteMany({});
    });

    // Teste para listar regiões dentro da distância especificada
    // it('should list regions within the specified distance', async () => {

    //   const region1 = await RegionModel.create({
    //     name: 'Region 1',
    //     user: '657619e3035b956f769ece55',
    //     coordinates: { 
    //         latitude: -74.044502, 
    //         longitude: 40.689247 
    //     }
    //   });

    //   // Defina as coordenadas para um ponto próximo à região criada
    //   const testLatitude = -74.044502;
    //   const testLongitude = 40.689247;

    //   const response = await supertest(server)
    //     .get('/regions/regionsdistance')
    //     .send({
    //       latitude: testLatitude,
    //       longitude: testLongitude,
    //       distance: 100, 
    //     });

    //   expect(response.status).to.equal(STATUS.OK);
    // });

    // Teste para lidar com nenhum resultado encontrado
    it('should handle no regions found within the specified distance', async () => {
      const response = await supertest(server)
        .get('/regions/regionsdistance')
        .send({
          latitude: 0,
          longitude: 0,
          distance: 100,
        });

      expect(response.status).to.equal(STATUS.NOT_FOUND);
    });

    // Teste para lidar com parâmetros ausentes
    it('should handle missing parameters', async () => {
      const response = await supertest(server).get('/regions/regionsdistance').send({});

      expect(response.status).to.equal(STATUS.NOT_FOUND);
      expect(response.body).to.have.property('message', 'Latitude, longitude, and distance are required parameters.');
    });

    // Teste para lidar com erro interno do servidor
    it('should handle internal server error', async () => {
      // Substitua o método find por um que força um erro
      const findStub = sinon.stub(RegionModel, 'find');
      findStub.rejects(new Error('Simulated find error'));

      const response = await supertest(server)
        .get('/regions/regionsdistance')
        .send({
          latitude: 0,
          longitude: 0,
          distance: 100,
        });

      expect(response.status).to.equal(400);
      //expect(response.body).to.have.property('message', 'Internal server error');

      findStub.restore();
    });
  });


});
