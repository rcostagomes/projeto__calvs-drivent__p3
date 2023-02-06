import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import paymentRepository from "@/repositories/payment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, conflictError } from "@/errors";


async function getAllHotels(userId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }
    const ticketType = await ticketRepository.findTickeWithTypeById(ticket.id);
    if (ticketType.TicketType.isRemote === true || ticketType.TicketType.includesHotel === false){
        throw conflictError("non-stay event");
    }
    const payment = await paymentRepository.findPaymentByTicketId(ticket.id)
    if (!payment) {
        throw conflictError("Payment not concluded");
    }

    const allHotels = await hotelRepository.getHotels();
    if (!allHotels) {
        throw notFoundError();
    }
    return allHotels
}

async function getHotelRooms(hotelId: number, userId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }
    const ticketType = await ticketRepository.findTickeWithTypeById(ticket.id);
    if (ticketType.TicketType.isRemote === true || ticketType.TicketType.includesHotel === false){
        throw conflictError("non-stay event");
    }

    const payment = await paymentRepository.findPaymentByTicketId(ticket.id)
    if (!payment) {
        throw conflictError("Payment not concluded");
    }

    const Rooms = await hotelRepository.getHotelsRooms(hotelId);
    if(!Rooms){
         throw notFoundError();
     }

    return Rooms;
}

const hotelService = {
    getAllHotels,
    getHotelRooms
}

export default hotelService;