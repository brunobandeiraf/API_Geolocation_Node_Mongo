import 'reflect-metadata';

import * as mongoose from 'mongoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { pre, getModelForClass, Prop, Ref, modelOptions } from '@typegoose/typegoose';
import lib from '../db/lib';

import ObjectId = mongoose.Types.ObjectId;

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Address {
  street: string;
  city: string;
  zipCode: string;
}

class Base extends TimeStamps {
  @Prop({ required: true, default: () => (new ObjectId()).toString() })
  _id: string;
}

// Class User
// Define um middleware pré-save para a classe User. 
// Este middleware é executado antes de salvar um documento do tipo User. 
// As coordenadas são obtidas a partir do endereço ou vice-versa antes de salvar.
// @pre<User>('save', async function (next) {
//   const region = this as Omit<any, keyof User> & User;

//   if (region.isModified('coordinates')) {
//     region.address = await lib.getAddressFromCoordinates(region.coordinates);
//   } else if (region.isModified('address')) {
//     const { latitude, longitude } = await lib.getCoordinatesFromAddress(region.address);

//     region.coordinates = [latitude, longitude];
//   }

//   next();
// })

export class User extends Base {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  //@Prop({ required: true })
  @Prop({ required: false })
  //address: string;
  address: {
    street: { type: String },
    city: { type: String },
    zipCode: { type: String },
  }

  //@Prop({ required: true, type: () => [Number] })
  @Prop({ required: false})
  //coordinates: [number, number];
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  }

  @Prop({ required: true, default: [], ref: () => Region, type: () => String })
  regions: Ref<Region>[];
}

// Define um middleware pré-save para a classe Region
// Este middleware é executado antes de salvar um documento do tipo Region. 
// No middleware, há uma lógica que atribui um ID à região se ainda não existir 
// e adiciona a região ao array regions do usuário associado.
@pre<Region>('save', async function (next) {
  const region = this as Omit<any, keyof Region> & Region;

  if (!region._id) {
    region._id = new ObjectId().toString();
  }

  if (region.isNew) {
    const user = await UserModel.findOne({ _id: region.user });
    user.regions.push(region._id);
    await user.save({ session: region.$session() });
  }

  next(region.validateSync());
})

// Desativa a validação antes de salvar um documento, permitindo que a validação
// seja tratada manualmente no middleware.
@modelOptions({ schemaOptions: { validateBeforeSave: false } })
export class Region extends Base {
  @Prop({ required: true, auto: true })
  _id: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false})
  //coordinates: [number, number];
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  }
  
  @Prop({ ref: () => User, required: true, type: () => String })
  user: Ref<User>;
}

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);
