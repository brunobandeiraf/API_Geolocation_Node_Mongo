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
            const { name, user, coordinates } = request.body;

            // Verifique se já existe uma região com o mesmo nome e coordenadas do usuário informado
            const existingRegion = await RegionModel.findOne({ user, name, coordinates });

            if (existingRegion) {
                return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Region with the same name and coordinates already exists for the informed user' });
            }
            
            // Crie uma nova instância de Region
            const newRegion = new RegionModel({
                name,
                user,
                ...( coordinates && { coordinates: coordinates }),
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

    async findOne(request: Request, response: Response)  {
        // route GET regions/region/:id

        try {
            const { id } = request.params;

            const region = await RegionModel.findOne({ _id: id }).lean();

            if (!region) {
                return response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Region not found' });
            }

            return response.status(STATUS.OK).json(region);

        } catch (error) {
            console.error('Error when searching for region :', error);
            return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
        }
    }

    async update(request: Request, response: Response){
        // route PUT regions/update/:id

        try {
            const { id } = request.params;
            const { name, userID, coordinates} = request.body;
        
            // Verifique se a região com o ID fornecido existe
            const existingRegion = await RegionModel.findById(id);
        
            if (!existingRegion) {
              return response.status(STATUS.NOT_FOUND).json({ message: 'Region not found' });
            }
            
            // Verifique se já existe uma região com o mesmo nome e coordenadas (exceto a região atual) para o mesmo user
            if (name || coordinates || userID) {
                const duplicateRegion = await RegionModel.findOne({
                    _id: { $ne: id },
                    name,
                    coordinates,
                    user: userID,
                  });
        
                if (duplicateRegion) {
                    return response.status(STATUS.NOT_FOUND).json({ message: 'Region with the same name and coordinates already exists for the user' });
                }
            }
            
            // Se deseja atualizar
            if (name) existingRegion.name = name;
            if (userID) existingRegion.user = userID;
            if (coordinates) existingRegion.coordinates = coordinates;
              
            // Salve a região atualizada
            await existingRegion.save();
        
            return response.status(STATUS.UPDATED).json({ message: 'Region updated successfully', region: existingRegion });
        } catch (error) {
            console.error('Error updating region:', error);
            return response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
        }
    }

    async delete(request: Request, response: Response)  {
        // route DELETE regions/delete/:id

        const regionId = request.params.id;
      
        try {
            const deletedRegion = await RegionModel.findByIdAndDelete(regionId);
        
            if (!deletedRegion) 
                return response.status(STATUS.NOT_FOUND).json({ message: 'Region not found' });
          
            return response.status(STATUS.OK).json({ message: 'User deleted successfully', deletedRegion });

        } catch (error) {
          console.error('Error deleting region:', error);
          response.status(500).json({ message: 'Internal server error' });
        }
    }

}

export default RegionsController;