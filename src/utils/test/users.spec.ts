import 'reflect-metadata';

import * as mongoose from 'mongoose';
import supertest from 'supertest';
import * as sinon from 'sinon';
import { faker } from '@faker-js/faker';
import { expect, assert } from 'chai';

import '../../db/database';
import { Region, RegionModel, UserModel } from '../../repositories/models';
import GeoLib from '../../service/lib';
import server from '../../server';
import { describe, it, beforeEach, afterEach } from 'mocha';
import GeoLocationService from '../../service/GeoLib';


describe('UsersController', () => {
  let geoLocationServiceStub: sinon.SinonStubbedInstance<GeoLocationService>;

  const STATUS = {
    OK: 200,
    CREATED: 201,
    UPDATED: 201,
    NOT_FOUND: 400,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    DEFAULT_ERROR: 418,
  };

  beforeEach(() => {
    geoLocationServiceStub = sinon.createStubInstance(GeoLocationService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    beforeEach(async () => {
      // Configuração de inicialização para cada teste
      await UserModel.deleteMany({});
    });

    afterEach(async () => {
      // Limpeza após cada teste
      await UserModel.deleteMany({});
    });

    // Deve retornar 400 se o endereço e as coordenadas forem fornecidos
    it.skip('should return 400 if both address and coordinates are provided', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          address: {
            street: faker.location.streetName(),
            city: faker.address.city(),
            zipCode: faker.address.zipCode(),
          },
          coordinates: {
            latitude: faker.address.latitude(),
            longitude: faker.address.longitude(),
          },
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'Forneça apenas endereço ou coordenadas, não ambos ou nenhum.');
    });

    // Teste de criação de usuário com endereço
    it.skip('should create a user with address', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          address: {
            street: "Street",
            city: "City",
            zipCode: "0000000",
            //   street: faker.location.streetName(),
            //   city: faker.address.city(),
            //   zipCode: faker.address.zipCode(),
          },
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Usuário criado com sucesso');
      expect(response.body).to.have.property('user');

      const createdUser = await UserModel.findById(response.body.user._id).lean();

      expect(createdUser).to.exist;
      expect(createdUser).to.have.property('name', response.body.user.name);
      expect(createdUser).to.have.property('email', response.body.user.email);
      expect(createdUser.address).to.deep.equal(response.body.user.address);
      expect(createdUser.coordinates).to.not.exist;
    });

    // Teste de criação de usuário com coordenadas
    it.skip('should create a user with coordinates', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          coordinates: {
            latitude: faker.address.latitude(),
            longitude: faker.address.longitude(),
          },
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Usuário criado com sucesso');
      expect(response.body).to.have.property('user');

      const createdUser = await UserModel.findById(response.body.user._id).lean();

      expect(createdUser).to.exist;
      expect(createdUser).to.have.property('name', response.body.user.name);
      expect(createdUser).to.have.property('email', response.body.user.email);
      expect(createdUser.coordinates).to.deep.equal(response.body.user.coordinates);
      expect(createdUser.address).to.not.exist;
    });

    // Teste para entrada inválida
    it.skip('should create a user without address or coordinates', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Usuário criado com sucesso');
      expect(response.body).to.have.property('user');

      const createdUser = await UserModel.findById(response.body.user._id).lean();

      expect(createdUser).to.exist;
      expect(createdUser).to.have.property('name', response.body.user.name);
      expect(createdUser).to.have.property('email', response.body.user.email);
      expect(createdUser.address).to.not.exist;
      expect(createdUser.coordinates).to.not.exist;
    });

    // Teste para erro interno do servidor
    it.skip('should handle internal server error', async () => {
      const createStub = sinon.stub(UserModel, 'create').throws('Internal Server Error');

      const userData = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        //address: faker.address.streetAddress(),
        address: faker.location.streetAddress({ useFullAddress: true }),
      };

      const response = await supertest(server)
        .post('/users/create')
        .send(userData)
        .expect(500);

      expect(response.body.message).to.equal('Erro interno do servidor');

      createStub.restore(); // Restaura o stub para evitar efeitos colaterais em outros testes
    });
  });

  describe('Route GET users/user/show', () => {
    it('should return a list of users', async () => {
      // Teste para obter uma lista de usuários
    });

    it('should handle unexpected error', async () => {
      // Teste para lidar com erro inesperado
    });
  });

  describe('Route GET users/user/:id - findOne', () => {
    it('should return a user by ID', async () => {
      // Teste para obter um usuário por ID
    });

    it('should handle user not found', async () => {
      // Teste para lidar com usuário não encontrado
    });

    it('should handle unexpected error', async () => {
      // Teste para lidar com erro inesperado
    });
  });

  describe('Route PUT users/update', () => {
    it('should update a user by ID', async () => {
      // Teste para atualizar um usuário por ID
    });

    it('should handle user not found', async () => {
      // Teste para lidar com usuário não encontrado
    });

    it('should handle unexpected error', async () => {
      // Teste para lidar com erro inesperado
    });
  });

  describe('Route DELETE users/delete', () => {
    it('should delete a user by ID', async () => {
      // Teste para excluir um usuário por ID
    });

    it('should handle user not found', async () => {
      // Teste para lidar com usuário não encontrado
    });

    it('should handle internal server error', async () => {
      // Teste para lidar com erro interno do servidor
    });
  });
});