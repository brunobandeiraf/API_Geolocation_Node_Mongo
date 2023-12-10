import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { UserModel } from '../../repositories/models';
import GeoLocationService from '../../service/GeoLib';
import UsersController from '../../http/controllers/UsersController';

const STATUS = {
  OK: 200,
  CREATED: 201,
  UPDATED: 201,
  NOT_FOUND: 400,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  DEFAULT_ERROR: 418,
};

describe('UsersController', () => {
  let userModelCreateStub: sinon.SinonStub;

  beforeEach(() => {
    userModelCreateStub = sinon.stub(UserModel, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 400 if both address and coordinates are provided', async () => {
    const req: Partial<Request> = { body: { name: 'John', email: 'john@example.com', address: 'Street 123', coordinates: { latitude: 1, longitude: 2 } } };
    const res: any = {
      status: (code: number) => ({ json: (message: any) => expect(code).to.equal(STATUS.BAD_REQUEST) }),
    };

    const controller = new UsersController();

    await controller.create(req as Request, res as Response);
  });




});
