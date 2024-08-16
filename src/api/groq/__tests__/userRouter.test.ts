import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { Groq } from "@/api/groq/groqModel";
import { groqs } from "@/api/groq/groqRepository";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("Groq API Endpoints", () => {
  describe("GET /groqs", () => {
    it("should return a list of groqs", async () => {
      // Act
      const response = await request(app).get("/groqs");
      const responseBody: ServiceResponse<Groq[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("Groqs found");
      expect(responseBody.responseObject.length).toEqual(groqs.length);
      responseBody.responseObject.forEach((groq, index) => compareGroqs(groqs[index] as Groq, groq));
    });
  });

  describe("GET /groqs/:id", () => {
    it("should return a groq for a valid ID", async () => {
      // Arrange
      const testId = 1;
      const expectedGroq = groqs.find((groq) => groq.id === testId) as Groq;

      // Act
      const response = await request(app).get(`/groqs/${testId}`);
      const responseBody: ServiceResponse<Groq> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("Groq found");
      if (!expectedGroq) throw new Error("Invalid test data: expectedGroq is undefined");
      compareGroqs(expectedGroq, responseBody.responseObject);
    });

    it("should return a not found error for non-existent ID", async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER;

      // Act
      const response = await request(app).get(`/groqs/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain("Groq not found");
      expect(responseBody.responseObject).toBeNull();
    });

    it("should return a bad request for invalid ID format", async () => {
      // Act
      const invalidInput = "abc";
      const response = await request(app).get(`/groqs/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain("Invalid input");
      expect(responseBody.responseObject).toBeNull();
    });
  });
});

function compareGroqs(mockGroq: Groq, responseGroq: Groq) {
  if (!mockGroq || !responseGroq) {
    throw new Error("Invalid test data: mockGroq or responseGroq is undefined");
  }

  expect(responseGroq.id).toEqual(mockGroq.id);
  expect(responseGroq.name).toEqual(mockGroq.name);
  expect(responseGroq.email).toEqual(mockGroq.email);
  expect(responseGroq.age).toEqual(mockGroq.age);
  expect(new Date(responseGroq.createdAt)).toEqual(mockGroq.createdAt);
  expect(new Date(responseGroq.updatedAt)).toEqual(mockGroq.updatedAt);
}
