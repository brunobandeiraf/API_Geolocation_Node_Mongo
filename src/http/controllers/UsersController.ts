import { UserModel } from '../../repositories/models';

const STATUS = {
    OK: 200,
    CREATED: 201,
    UPDATED: 201,
    NOT_FOUND: 400,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    DEFAULT_ERROR: 418,
};

class UsersController {

    async show(request, response) {
        //route: '/user'
        // GET

        try {
            const { page, limit } = request.query;

            const [users, total] = await Promise.all([
                UserModel.find().lean(),
                UserModel.count(),
            ]);

            return response.json({
                rows: users,
                page,
                limit,
                total,
            });

        } catch (err) {
            return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
        }
    }

    async findOne(request, response) {
        // route: '/users/:id'
        // GET

        try {
            const { id } = request.params;

            const user = await UserModel.findOne({ _id: id }).lean();

            if (!user) {
                response.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Region not found' });
            }

            return user;

        } catch (err) {
            return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
        }
    }

    // async update(request, response){
    //     // route: '/users/:id'
    //     // PUT

    //     try{
    //         const { id } = request.params;
    //         const { update } = request.body;

    //         const user = await UserModel.findOne({ _id: id }).lean();

    //         if (!user) {
    //             response.status(STATUS.DEFAULT_ERROR).json({ message: 'Region not found' });
    //         }

    //         user.name = update.name;

    //         await user.save();

    //         return response.sendStatus(201);

    //     }catch (err) { 
    //         return response.status(STATUS.DEFAULT_ERROR).json({ message: 'Unexpected error' });
    //     }
    // }

}

export default UsersController;