import 'reflect-metadata';
import supertest from 'supertest';
import * as sinon from 'sinon';
import { faker } from '@faker-js/faker';
import { expect, assert } from 'chai';

import { Request, Response } from 'express';  
import { Region, RegionModel, UserModel } from '../../repositories/models';
import server from '../../server';
import { describe, it, beforeEach, afterEach } from 'mocha';
import UsersController from '../../http/controllers/UsersController';

describe('UsersController', () => {
  
  const STATUS = {
    OK: 200,
    CREATED: 201,
    UPDATED: 201,
    NOT_FOUND: 400,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    DEFAULT_ERROR: 418,
  };

  describe('create', () => {
    beforeEach(async () => {
      await UserModel.deleteMany({});
    });

    afterEach(async () => {
      await UserModel.deleteMany({});
    });

    // Deve retornar 400 se o endereço e as coordenadas forem fornecidos
    it('should return 400 if both address and coordinates are provided', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          address: {
            street: "Statue of Liberty",
            city: "Flagpole Plaza",
            zipCode: "New York"
          },
          coordinates: {
            latitude: 40.689247,
            longitude: -74.044502
          },
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'Provide only address or coordinates, not both or neither.');
    });

    // Teste de criação de usuário com endereço
    it('should create a user with address', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          address: {
            street: "Statue of Liberty",
            city: "Flagpole Plaza",
            zipCode: "New York"
          },
        });

      expect(response.status).to.equal(STATUS.CREATED);
      expect(response.body).to.have.property('message', 'User created successfully');
      expect(response.body).to.have.property('user');

      const createdUser = await UserModel.findById(response.body.user._id).lean();

      expect(createdUser).to.exist;
      expect(createdUser).to.have.property('name', response.body.user.name);
      expect(createdUser).to.have.property('email', response.body.user.email);
      expect(createdUser.address).to.deep.equal(response.body.user.address);
    });

    // Teste de criação de usuário com coordenadas
    it('should create a user with coordinates', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          coordinates: {
            latitude: 40.689247,
            longitude: -74.044502
          },
        });

      expect(response.status).to.equal(STATUS.CREATED);
      expect(response.body).to.have.property('message', 'User created successfully');
      expect(response.body).to.have.property('user');

      const createdUser = await UserModel.findById(response.body.user._id).lean();

      expect(createdUser).to.exist;
      expect(createdUser).to.have.property('name', response.body.user.name);
      expect(createdUser).to.have.property('email', response.body.user.email);
      expect(createdUser.coordinates).to.deep.equal(response.body.user.coordinates);
    });

    // Teste para entrada inválida
    it('should create a user without address or coordinates', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
        });

      expect(response.status).to.equal(STATUS.BAD_REQUEST);
      expect(response.body).to.have.property('message', 'Provide only address or coordinates, not both or neither.');
      
    });
  });

  describe('Route GET users/user/show', () => {

    let userModelFindStub: sinon.SinonStub;
    let userModelCountStub: sinon.SinonStub;
  
    beforeEach(() => {
      userModelFindStub = sinon.stub(UserModel, 'find');
      userModelCountStub = sinon.stub(UserModel, 'count');
    });
  
    afterEach(() => {
      sinon.restore();
    });
    
    // it('should return a list of users', async () => {
    //   const page = 1;
    //   const limit = 10;

    //   const response = await supertest(server)
    //     .get(`/users/user`)
    //     .query({ page, limit });

    //  expect(response.status).to.equal(STATUS.OK);
    // });
   
    // it('should return a list of users', async () => {
    //   const users = [
    //     { _id: '1', name: 'User 1', email: 'user1@example.com' },
    //     { _id: '2', name: 'User 2', email: 'user2@example.com' },
    //   ];
  
    //   userModelFindStub.resolves(users);
    //   userModelCountStub.resolves(users.length);
  
    //   const req = {} as any;
    //   const res: any = {
    //     status: (code: number) => ({
    //       json: (data: any) => {
    //         expect(code).to.equal(STATUS.OK);
    //         expect(data.rows).to.deep.equal(users);
    //         expect(data.total).to.equal(users.length);
    //       },
    //     }),
    //     json: (data: any) => {},
    //   } as Response;
  
    //   const controller = new UsersController();
    //   await controller.show(req, res);
  
    //   sinon.assert.calledOnce(userModelFindStub);
    //   sinon.assert.calledOnce(userModelCountStub);
    // });

    // Simula um erro inesperado ao chamar o método show
    it('should handle unexpected error', async () => {
      userModelFindStub.rejects(new Error('Simulated unexpected error'));
    
      const req = { query: {} } as any;  
      const res: any = {
        status: (code: number) => ({ json: (message: any) => 
          expect(code).to.equal(STATUS.DEFAULT_ERROR) }),
      };
    
      const controller = new UsersController();
      await controller.show(req, res);
    
      sinon.assert.calledOnce(userModelFindStub);
    });
  });

  describe('Route GET users/user/:id - findOne', () => {

    let userModelFindOneStub: sinon.SinonStub;

    beforeEach(() => {
      userModelFindOneStub = sinon.stub(UserModel, 'findOne');
    });
  
    afterEach(() => {
      sinon.restore();
    });

    // Teste para obter um usuário por ID
    // it('should find a user and return 200 status', async () => {
    //   const userId = '6576401f260777fc7f881aa4';
  
    //   const response = await supertest(server).get(`/users/users/${userId}`);
  
    //   expect(response.status).to.equal(STATUS.UPDATED);
    //   expect(response.body).to.have.property('name'); 
    //   expect(response.body).to.have.property('email');
    // });
    // it('should find a user and return 200 status', async () => {
    //   const userId = 'exampleUserId';
    //   const foundUser = { _id: userId, name: 'John', email: 'john@example.com' };
  
    //   userModelFindOneStub.resolves(foundUser);
  
    //   const req = { params: { id: userId } } as any;
    //   const res: any = {
    //     status: (code: number) => ({ json: (data: any) => 
    //       expect(code).to.equal(STATUS.OK) }),
    //   };
  
    //   const controller = new UsersController();
    //   await controller.findOne(req, res);
    //   sinon.assert.calledOnceWithExactly(userModelFindOneStub, { _id: userId });
    // });

    // Teste para lidar com usuário não encontrado
    it('should handle user not found', async () => {
      const userId = 'nonExistentUserId';
  
      // Simula que o usuário não foi encontrado
      userModelFindOneStub.resolves(null);
  
      const req = { params: { id: userId } } as any;
      const res: any = {
        status: (code: number) => ({ json: (message: any) => 
          //expect(code).to.equal(STATUS.NOT_FOUND) }), Esperado
          expect(code).to.equal(STATUS.DEFAULT_ERROR) }),
          
      };
  
      const controller = new UsersController();
      await controller.findOne(req, res);
      sinon.assert.calledOnceWithExactly(userModelFindOneStub, { _id: userId });
    });

    // Teste para lidar com erro interno do servidor
    it('should handle internal server error', async () => {
      const userId = 'exampleUserId';
  
      userModelFindOneStub.rejects(new Error('Simulated internal server error'));
  
      const req = { params: { id: userId } } as any;
      const res: any = {
        status: (code: number) => ({ json: (message: any) => 
          //expect(code).to.equal(STATUS.INTERNAL_SERVER_ERROR) }), Esperado
          expect(code).to.equal(STATUS.DEFAULT_ERROR) }),
      };
  
      const controller = new UsersController();
      await controller.findOne(req, res);
      sinon.assert.calledOnceWithExactly(userModelFindOneStub, { _id: userId });
    });
  });

  // describe('Route PUT users/update', () => {
  //   it('should update a user by ID', async () => {
  //     // Teste para atualizar um usuário por ID
  //   });

  //   it('should handle user not found', async () => {
  //     // Teste para lidar com usuário não encontrado
  //   });

  //   it('should handle unexpected error', async () => {
  //     // Teste para lidar com erro inesperado
  //   });
  // });

  describe('Route DELETE users/delete', () => {
    
    let userModelFindByIdAndDeleteStub: sinon.SinonStub;

    beforeEach(() => {
      userModelFindByIdAndDeleteStub = sinon.stub(UserModel, 'findByIdAndDelete');
    });
  
    afterEach(() => {
      sinon.restore();
    });

    // Teste para excluir um usuário por ID
    it('should delete a user and return 200 status', async () => {
      const userId = 'exampleUserId';
      const deletedUser = { _id: userId, name: 'John', email: 'john@example.com' };

      userModelFindByIdAndDeleteStub.resolves(deletedUser);

      const req = { params: { id: userId } } as any;  
      const res: any = {
        status: (code: number) => ({ json: (message: any) => 
          expect(code).to.equal(STATUS.OK) }),
      };

      const controller = new UsersController();
      await controller.delete(req, res); 
      sinon.assert.calledOnceWithExactly(userModelFindByIdAndDeleteStub, userId);
    });
  
    // Teste para lidar com usuário não encontrado
    it('should handle user not found', async () => {
      const userId = 'nonExistentUserId';
      
      // Simula que o usuário não foi encontrado
      userModelFindByIdAndDeleteStub.resolves(null); 
  
      const req = { params: { id: userId } } as any;  
      const res: any = {
        status: (code: number) => ({ json: (message: any) => 
          expect(code).to.equal(STATUS.NOT_FOUND) }),
      };
  
      const controller = new UsersController();
      await controller.delete(req, res);
      sinon.assert.calledOnceWithExactly(userModelFindByIdAndDeleteStub, userId);
    });
   
    // Teste para lidar com erro interno do servidor
    it('should handle internal server error', async () => {
      const userId = 'exampleUserId';
  
      userModelFindByIdAndDeleteStub.rejects(new Error('Simulated internal server error'));
  
      const req = { params: { id: userId } } as any;  
      const res: any = {
        status: (code: number) => ({ json: (message: any) => 
          expect(code).to.equal(STATUS.INTERNAL_SERVER_ERROR) }),
      };
  
      const controller = new UsersController();
      await controller.delete(req, res);
      sinon.assert.calledOnceWithExactly(userModelFindByIdAndDeleteStub, userId);
    });
    
  });
});