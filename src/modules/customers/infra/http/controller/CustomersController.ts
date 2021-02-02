import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const createCustomerService = container.resolve(CreateCustomerService);
    const customer = await createCustomerService.execute({
      name: request.body.name,
      email: request.body.email,
    });
    return response.json(customer);
  }
}
