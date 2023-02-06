import { prisma } from "@/config";

async function getHotels(){
    return prisma.hotel.findMany();
}
async function getHotelsRooms(hotelId: number) {

    return prisma.hotel.findUnique({
        where: {
          id: hotelId,
        },
        include:{
            Rooms: true,
        }
    });
}

const hotelRepository = {
    getHotels,
    getHotelsRooms
  };
  
  export default hotelRepository;
  