import { Request, Response } from 'express';
import { UserModel } from '../../repositories/models';
import GeoLocationService from '../../service/GeoLocationService';

const STATUS = {
    OK: 200,
    CREATED: 201,
    UPDATED: 201,
    NOT_FOUND: 400,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    DEFAULT_ERROR: 418,
};

interface Coordinates {
    latitude: number;
    longitude: number;
}

class UsersController {

    async create(req: Request, res: Response): Promise<void> {
        
        try {
          const { name, email, address, coordinates } = req.body;
    
          // Verifica se foram fornecidos ambos ou nenhum endereço/coordenadas
          if ((!address && !coordinates) || (address && coordinates)) {
            res.status(400).json({ message: 'Forneça apenas endereço ou coordenadas, não ambos ou nenhum.' });
            return;
          }
    
          const geoLocationService = new GeoLocationService('707fb022eab54eb1a6434dd36f3eb91c');
    
          const resolvedLocation = await geoLocationService.resolveLocation({ address, coordinates });
    
          const user = new UserModel({
            name,
            email,
            ...(resolvedLocation.address && { address: resolvedLocation.address }),
            ...(resolvedLocation.coordinates && { coordinates: resolvedLocation.coordinates }),
          });
    
          await user.save();
    
          res.status(201).json({ message: 'Usuário criado com sucesso', user });
        } catch (error) {
          console.error('Erro ao criar usuário:', error);
          res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
    

    // Desativei o @pre do módulo
    // async create(request, response){
    //     // route POST users/create
    //     try {
    //         const { name, email, address, coordinates } = request.body;

    //         // Verificar se tanto address quanto coordinates não foram fornecidos ou ambos foram fornecidos
    //         if ((!address && !coordinates) || (address && coordinates)) {
    //             return request.status(STATUS.BAD_REQUEST).json({ message: 'Provide only address or coordinates, not both or neither.' });
    //         }
         
    //         const user = await UserModel.create({
    //             name,
    //             email,
    //             ...(address && { address: address }),
    //             ...(coordinates && { coordinates: coordinates as Coordinates }),
    //         });

    //         response.status(STATUS.CREATED).json({ message: 'User created successfully', user });
          
    //     } catch (error) {
    //         console.error('Error creating user:', error);
    //         response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    //     }
    // }

    async show(request: Request, response: Response): Promise<Response>  {
        //route GET users/show

        try {
            const { page, limit } = request.query;

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
            console.error('Error when searching for users:', error);
            return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
        }
    }

    async findOne(request: Request, response: Response)  {
        // route GET users/user/:id

        try {
            const { id } = request.params;

            const user = await UserModel.findOne({ _id: id }).lean();

            if (!user) {
                return response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'User not found' });
            }

            return response.status(STATUS.OK).json(user);

        } catch (error) {
            console.error('Error when searching for user :', error);
            return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
        }
    }

    // async update(req: Request, res: Response): Promise<void> {
    //     // route PUT users/user/:id

    //     try{
    //         const { id } = request.params;
    //         const { name, email, address, coordinates } = request.body;

    //         const user = await UserModel.findById(id).lean();

    //         if (!user) {
    //             return response.status(STATUS.DEFAULT_ERROR).json({ message: 'User not found' });
    //         }

    //         // Atualiza as propriedades do usuário com base nos dados fornecidos
    //         if (name) user.name = name;
    //         if (email) user.email = email;
    //         if (address) user.address = address;
    //         if (coordinates) user.coordinates = coordinates;

    //         // Atualiza diretamente no banco de dados
    //         await UserModel.updateOne({ _id: id }, { $set: user });

    //         return response.status(STATUS.UPDATED).json({ message: 'User updated successfully', user });

    //     }catch (err) { 
    //         console.error('Error updating user:', err);
    //         return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
    //     }
    // }
    async update(req: Request, res: Response): Promise<void> {
        try {
          const userId = req.params.id;
          const { name, email, address, coordinates } = req.body;
    
          const geoLocationService = new GeoLocationService('707fb022eab54eb1a6434dd36f3eb91c');
    
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
    
          res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
        } catch (error) {
          console.error('Erro ao atualizar usuário:', error);
          res.status(500).json({ message: 'Erro interno do servidor' });
        }
      }
    

    async delete(request: Request, response: Response)  {
        // route DELETE users/delete/:id

        const userId = request.params.id;
      
        try {
            const deletedUser = await UserModel.findByIdAndDelete(userId);
        
            if (!deletedUser) 
                return response.status(STATUS.NOT_FOUND).json({ message: 'User not found' });
          
            return response.status(STATUS.OK).json({ message: 'User deleted successfully', deletedUser });

        } catch (error) {
          console.error('Error deleting user:', error);
          response.status(500).json({ message: 'Internal server error' });
        }
      }

}

export default UsersController;