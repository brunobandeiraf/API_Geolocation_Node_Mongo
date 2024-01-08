import 'reflect-metadata'
import supertest from 'supertest'
import * as sinon from 'sinon'
import { faker } from '@faker-js/faker'
import { expect } from 'chai'

import { UserModel } from '../../repositories/models'
import server from '../../server'
import { describe, it, beforeEach, afterEach } from 'mocha'
import UsersController from '../../http/controllers/UsersController'

describe('UsersController', () => {
  const STATUS = {
    OK: 200,
    CREATED: 201,
    UPDATED: 201,
    NOT_FOUND: 400,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    DEFAULT_ERROR: 418,
  }

  describe('create', () => {
    beforeEach(async () => {
      await UserModel.deleteMany({})
    })

    afterEach(async () => {
      await UserModel.deleteMany({})
    })

    // Deve retornar 400 se o endereço e as coordenadas forem fornecidos
    it('should return 400 if both address and coordinates are provided', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          address: {
            street: 'Statue of Liberty',
            city: 'Flagpole Plaza',
            zipCode: 'New York',
          },
          coordinates: {
            latitude: 40.689247,
            longitude: -74.044502,
          },
        })

      expect(response.status).to.equal(400)
      expect(response.body).to.have.property(
        'message',
        'Provide only address or coordinates, not both or neither',
      )
    })

    // Teste de criação de usuário com endereço
    it('should create a user with address', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          address: {
            street: 'Statue of Liberty',
            city: 'Flagpole Plaza',
            zipCode: 'New York',
          },
        })

      expect(response.status).to.equal(STATUS.CREATED)
      expect(response.body).to.have.property(
        'message',
        'User created successfully',
      )
      expect(response.body).to.have.property('user')

      const createdUser = await UserModel.findById(
        response.body.user._id,
      ).lean()

      expect(createdUser).to.have.property('name', response.body.user.name)
      expect(createdUser).to.have.property('email', response.body.user.email)
      expect(createdUser.address).to.deep.equal(response.body.user.address)
    })

    // Teste de criação de usuário com coordenadas
    it('should create a user with coordinates', async () => {
      const response = await supertest(server)
        .post('/users/create')
        .send({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          coordinates: {
            latitude: 40.689247,
            longitude: -74.044502,
          },
        })

      expect(response.status).to.equal(STATUS.CREATED)
      expect(response.body).to.have.property(
        'message',
        'User created successfully',
      )
      expect(response.body).to.have.property('user')

      const createdUser = await UserModel.findById(
        response.body.user._id,
      ).lean()

      // eslint-disable-next-line no-unused-expressions
      expect(createdUser).to.exist
      expect(createdUser).to.have.property('name', response.body.user.name)
      expect(createdUser).to.have.property('email', response.body.user.email)
      expect(createdUser.coordinates).to.deep.equal(
        response.body.user.coordinates,
      )
    })

    // Teste para entrada inválida
    it('should create a user without address or coordinates', async () => {
      const response = await supertest(server).post('/users/create').send({
        name: faker.person.firstName(),
        email: faker.internet.email(),
      })

      expect(response.status).to.equal(STATUS.BAD_REQUEST)
      expect(response.body).to.have.property(
        'message',
        'Provide only address or coordinates, not both or neither',
      )
    })
  })

  describe('Route GET users/', () => {
    // Teste para obter uma lista de regiões
    it('should return a list of users', async () => {
      const response = await supertest(server).get('/users/')
      expect(response.status).to.equal(STATUS.OK)
    })
  })

  describe('Route GET users/show/:id - findOne', () => {
    let userModelFindOneStub: sinon.SinonStub

    beforeEach(() => {
      userModelFindOneStub = sinon.stub(UserModel, 'findOne')
    })

    afterEach(() => {
      sinon.restore()
    })

    // Teste para lidar com usuário não encontrado
    it('should handle user not found', async () => {
      const userId = 'nonExistentUserId'
      // Simula que o usuário não foi encontrado
      userModelFindOneStub.resolves(null)
      const req = { params: { id: userId } } as any
      const res: any = {
        status: (code: number) => ({
          json: (message: any) => expect(code).to.equal(500),
        }),
      }
      const controller = new UsersController()
      await controller.findOne(req, res)
      sinon.assert.calledOnceWithExactly(userModelFindOneStub, { _id: userId })
    })

    // Teste para lidar com erro interno do servidor
    it('should handle internal server error', async () => {
      const userId = 'exampleUserId'

      userModelFindOneStub.rejects(new Error('Simulated internal server error'))

      const req = { params: { id: userId } } as any
      const res: any = {
        status: (code: number) => ({
          json: (message: any) =>
            // expect(code).to.equal(STATUS.INTERNAL_SERVER_ERROR) }), Esperado
            expect(code).to.equal(STATUS.INTERNAL_SERVER_ERROR),
        }),
      }

      const controller = new UsersController()
      await controller.findOne(req, res)
      sinon.assert.calledOnceWithExactly(userModelFindOneStub, { _id: userId })
    })
  })

  describe('Route DELETE users/delete', () => {
    let userModelFindByIdAndDeleteStub: sinon.SinonStub

    beforeEach(() => {
      userModelFindByIdAndDeleteStub = sinon.stub(
        UserModel,
        'findByIdAndDelete',
      )
    })

    afterEach(() => {
      sinon.restore()
    })

    // Teste para excluir um usuário por ID
    it('should delete a user and return 200 status', async () => {
      const userId = 'exampleUserId'
      const deletedUser = {
        _id: userId,
        name: 'John',
        email: 'john@example.com',
      }

      userModelFindByIdAndDeleteStub.resolves(deletedUser)

      const req = { params: { id: userId } } as any
      const res: any = {
        status: (code: number) => ({
          json: (message: any) => expect(code).to.equal(STATUS.OK),
        }),
      }

      const controller = new UsersController()
      await controller.delete(req, res)
      sinon.assert.calledOnceWithExactly(userModelFindByIdAndDeleteStub, userId)
    })

    // Teste para lidar com usuário não encontrado
    it('should handle user not found', async () => {
      const userId = 'nonExistentUserId'

      // Simula que o usuário não foi encontrado
      userModelFindByIdAndDeleteStub.resolves(null)

      const req = { params: { id: userId } } as any
      const res: any = {
        status: (code: number) => ({
          json: (message: any) => expect(code).to.equal(500),
        }),
      }

      const controller = new UsersController()
      await controller.delete(req, res)
      sinon.assert.calledOnceWithExactly(userModelFindByIdAndDeleteStub, userId)
    })

    // Teste para lidar com erro interno do servidor
    it('should handle internal server error', async () => {
      const userId = 'exampleUserId'

      userModelFindByIdAndDeleteStub.rejects(
        new Error('Simulated internal server error'),
      )

      const req = { params: { id: userId } } as any
      const res: any = {
        status: (code: number) => ({
          json: (message: any) =>
            expect(code).to.equal(STATUS.INTERNAL_SERVER_ERROR),
        }),
      }

      const controller = new UsersController()
      await controller.delete(req, res)
      sinon.assert.calledOnceWithExactly(userModelFindByIdAndDeleteStub, userId)
    })
  })
})
