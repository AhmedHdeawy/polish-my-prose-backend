import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";

import type { Groq } from "@/api/groq/groqModel";
import { GroqRepository } from "@/api/groq/groqRepository";
import { GroqService } from "@/api/groq/groqService";

vi.mock("@/api/groq/groqRepository");

describe("groqService", () => {
  let groqServiceInstance: GroqService;
  let groqRepositoryInstance: GroqRepository;

  const mockGroqs: Groq[] = [
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      age: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      age: 21,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    groqRepositoryInstance = new GroqRepository();
    groqServiceInstance = new GroqService(groqRepositoryInstance);
  });

  describe("findAll", () => {
    it("return all groqs", async () => {
      // Arrange
      (groqRepositoryInstance.findAllAsync as Mock).mockReturnValue(mockGroqs);

      // Act
      const result = await groqServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Groqs found");
      expect(result.responseObject).toEqual(mockGroqs);
    });

    it("returns a not found error for no groqs found", async () => {
      // Arrange
      (groqRepositoryInstance.findAllAsync as Mock).mockReturnValue(null);

      // Act
      const result = await groqServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("No Groqs found");
      expect(result.responseObject).toBeNull();
    });

    it("handles errors for findAllAsync", async () => {
      // Arrange
      (groqRepositoryInstance.findAllAsync as Mock).mockRejectedValue(new Error("Database error"));

      // Act
      const result = await groqServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("An error occurred while retrieving groqs.");
      expect(result.responseObject).toBeNull();
    });
  });

  describe("findById", () => {
    it("returns a groq for a valid ID", async () => {
      // Arrange
      const testId = 1;
      const mockGroq = mockGroqs.find((groq) => groq.id === testId);
      (groqRepositoryInstance.findByIdAsync as Mock).mockReturnValue(mockGroq);

      // Act
      const result = await groqServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).equals("Groq found");
      expect(result.responseObject).toEqual(mockGroq);
    });

    it("handles errors for findByIdAsync", async () => {
      // Arrange
      const testId = 1;
      (groqRepositoryInstance.findByIdAsync as Mock).mockRejectedValue(new Error("Database error"));

      // Act
      const result = await groqServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("An error occurred while finding groq.");
      expect(result.responseObject).toBeNull();
    });

    it("returns a not found error for non-existent ID", async () => {
      // Arrange
      const testId = 1;
      (groqRepositoryInstance.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await groqServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).equals("Groq not found");
      expect(result.responseObject).toBeNull();
    });
  });
});
