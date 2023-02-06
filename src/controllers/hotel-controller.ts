import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import hotelService from "@/services/hotel-service";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelService.getAllHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send({});
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotelId = Number(req.params.hotelId);
    try {
        const hotelRooms = await hotelService.getHotelRooms(hotelId, userId);
        console.log(hotelRooms)
        return res.status(httpStatus.OK).send(hotelRooms);
    } catch (error) {
        return res.status(httpStatus.NOT_FOUND).send({});
      }
}