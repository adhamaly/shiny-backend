import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleModel } from './schemas/vehicles.schema';
import { CreateVehicleDTO } from './dto/createVehicle.dto';
import { FirebaseService } from '../common/services/firebase/firebase.service';
import { NotFoundResponse } from '../common/errors/NotFoundResponse';

@Injectable()
export class VehiclesRepository {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleModel>,
    private firebaseService: FirebaseService,
  ) {}

  async create(
    userId: string,
    createVehicleDTO: CreateVehicleDTO,
    image: Express.Multer.File,
  ) {
    // Create Vehicle
    const createdVehicle = await this.vehicleModel.create({
      type: createVehicleDTO.type,
      brand: createVehicleDTO.brand,
      model: createVehicleDTO.model,
      plateNumber: createVehicleDTO.plateNumber,
      color: createVehicleDTO.color,
      user: userId,
    });

    if (image) {
      // Upload Image to Firebase
      const { fileLink, filePath } = await this.firebaseService.uploadImage(
        image,
      );

      // Update Vehicle with image
      createdVehicle.imageLink = fileLink;
      createdVehicle.imagePath = filePath;
      await createdVehicle.save();
    }

    return createdVehicle.toObject();
  }

  async findAll(userId: string) {
    return await this.vehicleModel.find({ user: userId }).exec();
  }

  async findByIdOr404(id: string) {
    const vehicle = await this.vehicleModel.findById(id).exec();

    if (!vehicle)
      throw new NotFoundResponse({
        ar: 'لاتوجد هذه السيارة',
        en: 'Vehicle Not Found',
      });
    return vehicle.toObject();
  }

  async delete(id: string) {
    await this.vehicleModel.deleteOne({ _id: id }).exec();
  }

  async update(
    id: string,
    createVehicleDTO: CreateVehicleDTO,
    image: Express.Multer.File,
  ) {
    const vehicle = await this.vehicleModel.findById(id).exec();

    vehicle.type = createVehicleDTO.type;
    vehicle.brand = createVehicleDTO.brand;
    vehicle.model = createVehicleDTO.model;
    vehicle.plateNumber = createVehicleDTO.plateNumber;
    vehicle.color = createVehicleDTO.color;
    await vehicle.save();

    if (image) {
      if (vehicle.imagePath)
        await this.firebaseService.deleteFileFromStorage(vehicle.imagePath);

      // Upload Image to Firebase
      const { fileLink, filePath } = await this.firebaseService.uploadImage(
        image,
      );

      // Update Vehicle with image
      vehicle.imageLink = fileLink;
      vehicle.imagePath = filePath;
      await vehicle.save();
    }

    return vehicle.toObject();
  }

  async findById(id: string) {
    const vehicle = await this.vehicleModel.findById(id).exec();

    return vehicle;
  }
}
