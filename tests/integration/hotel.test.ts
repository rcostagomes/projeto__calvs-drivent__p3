import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketWithHotel,
  createTicketRemote,
  createHotel,
  createRoom,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);
describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign(
      { userId: userWithoutSession.id },
      process.env.JWT_SECRET
    );
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {

    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketRemote();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and a list of hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketWithHotel();
      const ticket = await createTicket(
        enrollment.id,
        ticketType.id,
        TicketStatus.PAID
      );
      const payment = await createPayment(ticket.id, ticketType.price);
      const Hotel = await createHotel();
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual([
        {
          id: Hotel.id,
          name: Hotel.name,
          image: Hotel.image,
          createdAt: Hotel.createdAt.toISOString(),
          updatedAt: Hotel.updatedAt.toISOString(),
        },
      ]);
    });

    it("should respond with status 200 and an empty array", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketWithHotel();
      const ticket = await createTicket(
        enrollment.id,
        ticketType.id,
        TicketStatus.PAID
      );
      const payment = await createPayment(ticket.id, ticketType.price);
      const response = await server
        .get("/hotels")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([]);
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server
      .get("/hotels/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign(
      { userId: userWithoutSession.id },
      process.env.JWT_SECRET
    );
    const response = await server
      .get("/hotels/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {

    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketRemote();
      const response = await server
        .get("/hotels/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 for invalid hotel id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketWithHotel();
      const ticket = await createTicket(
        enrollment.id,
        ticketType.id,
        TicketStatus.PAID
      );
      const payment = await createPayment(ticket.id, ticketType.price);

      const Hotel = await createHotel();

      const response = await server
        .get("/hotels/100")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and hotel with rooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketWithHotel();
      const ticket = await createTicket(
        enrollment.id,
        ticketType.id,
        TicketStatus.PAID
      );
      const payment = await createPayment(ticket.id, ticketType.price);
      const Hotel = await createHotel();
      const Room = await createRoom(Hotel.id);

      const response = await server
        .get(`/hotels/${Hotel.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual({
        id: Hotel.id,
        name: Hotel.name,
        image: Hotel.image,
        createdAt: Hotel.createdAt.toISOString(),
        updatedAt: Hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: Room.id,
            name: Room.name,
            capacity: Room.capacity,
            hotelId: Hotel.id,
            createdAt: Room.createdAt.toISOString(),
            updatedAt: Room.updatedAt.toISOString(),
          },
        ],
      });
    });

    it("should respond with status 200 and hotel with no rooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketWithHotel();
      const ticket = await createTicket(
        enrollment.id,
        ticketType.id,
        TicketStatus.PAID
      );
      const payment = await createPayment(ticket.id, ticketType.price);
      const Hotel = await createHotel();
      const response = await server
        .get(`/hotels/${Hotel.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: Hotel.id,
        name: Hotel.name,
        image: expect.any(String),
        createdAt: Hotel.createdAt.toISOString(),
        updatedAt: Hotel.updatedAt.toISOString(),
        Rooms: [],
      });
    });
  });
});
