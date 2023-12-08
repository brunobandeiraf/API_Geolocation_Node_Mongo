import { Request, Response } from 'express';
import { RegionModel } from '../../repositories/models';

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

class RegionsController {

    async create(request: Request, response: Response){
        // route POST region/create
        try {
            const { name, user } = request.body;

            // Crie uma nova instância de Region
            const newRegion = new RegionModel({
                name,
                user,
            });

            // A lógica de pré-salvamento será acionada automaticamente para gerar o _id e associar à User
            await newRegion.save();
            
            response.status(STATUS.CREATED).json({ message: 'Region created successfully', region: newRegion });
          
        } catch (error) {
            console.error('Error creating region:', error);
            response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }

    async show(request: Request, response: Response): Promise<Response>  {
        //route GET regions/show

        try {
            const { page, limit } = request.query;

            const [regions, total] = await Promise.all([
                RegionModel.find().lean(),
                RegionModel.count(),
            ]);

            if (total === undefined) {
                return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Failed to count regions' });
            }

            return response.status(STATUS.OK).json({
                rows: regions,
                page,
                limit,
                total,
            });

        } catch (error) {
            console.error('Error when searching for regions:', error);
            return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
        }
    }

    // async findOne(request: Request, response: Response)  {
    //     // route GET users/user/:id

    //     try {
    //         const { id } = request.params;

    //         const user = await UserModel.findOne({ _id: id }).lean();

    //         if (!user) {
    //             return response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'User not found' });
    //         }

    //         return response.status(STATUS.OK).json(user);

    //     } catch (error) {
    //         console.error('Error when searching for user :', error);
    //         return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
    //     }
    // }

    // async update(request, response){
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

    // async delete(request: Request, response: Response)  {
    //     // route DELETE users/delete/:id

    //     const userId = request.params.id;
      
    //     try {
    //         const deletedUser = await UserModel.findByIdAndDelete(userId);
        
    //         if (!deletedUser) 
    //             return response.status(STATUS.NOT_FOUND).json({ message: 'User not found' });
          
    //         return response.status(STATUS.OK).json({ message: 'User deleted successfully', deletedUser });

    //     } catch (error) {
    //       console.error('Error deleting user:', error);
    //       response.status(500).json({ message: 'Internal server error' });
    //     }
    //   }

}

export default RegionsController;