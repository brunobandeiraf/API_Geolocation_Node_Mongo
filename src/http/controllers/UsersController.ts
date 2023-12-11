import { Request, Response } from 'express';
import { UserModel } from '../../repositories/models';
import GeoLocationService from '../../service/GeoLib';

const STATUS = {
  OK: 200,
  CREATED: 201,
  UPDATED: 201,
  NOT_FOUND: 400,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  DEFAULT_ERROR: 418,
};

const apiKey = "707fb022eab54eb1a6434dd36f3eb91c";

class UsersController {

  async create(request: Request, response: Response) {

    try {
      const { name, email, address, coordinates } = request.body;

      // Verifica se foram fornecidos ambos ou nenhum endereço/coordenadas
      if ((!address && !coordinates) || (address && coordinates))
        return response.status(STATUS.BAD_REQUEST).json({ message: 'Provide only address or coordinates, not both or neither.' });

      const geoLocationService = new GeoLocationService(apiKey);
      const resolvedLocation = await geoLocationService.resolveLocation({ address, coordinates });

      const user = new UserModel({
        name,
        email,
        ...(resolvedLocation.address && { address: resolvedLocation.address }),
        ...(resolvedLocation.coordinates && { coordinates: resolvedLocation.coordinates }),
      });

      await user.save();

      return response.status(STATUS.CREATED).json({ message: 'User created successfully', user });

    } catch (error) {
      //console.error('Error creating user:', error);
      return response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Unexpected error' });
    }
  }

  async show(request: Request, response: Response): Promise<Response> {
    //route GET users/show

    try {
      const { page , limit} = request.query;

      const [users, total] = await Promise.all([
        UserModel.find().lean(),
        UserModel.count(),
      ]);

      if (total === undefined) {
        return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Failed to count users' });
      }

      return response.status(STATUS.OK).json({
        rows: users,
        page,
        limit,
        total,
      });

    } catch (error) {
      //console.error('Error when searching for users:', error);
      return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
    }
  }

  async findOne(request: Request, response: Response) {
    // route GET users/user/:id

    try {
      const { id } = request.params;

      const user = await UserModel.findOne({ _id: id }).lean();

      if (!user) {
        return response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'User not found' });
      }

      return response.status(STATUS.OK).json(user);

    } catch (error) {
      //console.error('Error when searching for user :', error);
      return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
    }
  }

  async update(request: Request, response: Response) {
    try {
      const userId = request.params.id;
      const { name, email, address, coordinates } = request.body;

      // Verifica se o ID do usuário está presente nos parâmetros da solicitação
      if (!userId)
        return response.status(STATUS.BAD_REQUEST).json({ message: 'User ID is required for updating.' });

      const user = await UserModel.findById(userId);
      if (!user)
        return response.status(STATUS.NOT_FOUND).json({ message: 'User not found.' });

      const geoLocationService = new GeoLocationService(apiKey);
      const resolvedLocation = await geoLocationService.resolveLocation({ address, coordinates });

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          name,
          email,
          ...(resolvedLocation.address && { address: resolvedLocation.address }),
          ...(resolvedLocation.coordinates && { coordinates: resolvedLocation.coordinates }),
        },
        { new: true } // Retorna o documento atualizado
      );

      return response.status(STATUS.UPDATED).json({ message: 'User updated successfully', updatedUser });

    } catch (error) {
      //console.error('Error updating user:', error);
      return response.status(500).json({ message: 'Unexpected error' });
    }
  }

  async delete(request: Request, response: Response) {
    // route DELETE users/delete/:id

    const userId = request.params.id;

    try {
      const deletedUser = await UserModel.findByIdAndDelete(userId);

      if (!deletedUser)
        return response.status(STATUS.NOT_FOUND).json({ message: 'User not found' });

      return response.status(STATUS.OK).json({ message: 'User deleted successfully', deletedUser });

    } catch (error) {
      //console.error('Error deleting user:', error);
      response.status(500).json({ message: 'Internal server error' });
    }
  }

}

export default UsersController;