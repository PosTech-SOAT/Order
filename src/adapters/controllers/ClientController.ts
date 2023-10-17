import { Request, Response } from "express";
import { container } from "tsyringe";
import ClientCreateUseCase from "../../application/use-cases/ClientCreateUseCase";
import ClientListUseCase from "../../application/use-cases/ClientListUseCase";

export default class ClientController {

  async create(request: Request, response: Response) {
    const { name, email, cpf } = request.body;

    if (!name || !email || !cpf) {
      return response.status(400).json({ message: "Missing required data" });
    }

    const createClientUseCase = container.resolve(ClientCreateUseCase);

    try {
      await createClientUseCase.execute({ name, email, cpf });

      return response.status(201).json({ message: "Client created successfully" });
    } catch (error: any) {
      return response.status(400).json({ message: error.message });
    }
  } 

  async list(request: Request, response: Response) {
    const clientListUseCase = container.resolve(ClientListUseCase);

    try {
      const clients = await clientListUseCase.execute();

      return response.status(200).json(clients);
    } catch (error: any) {
      return response.status(400).json({ message: error.message });
    }
  }
}