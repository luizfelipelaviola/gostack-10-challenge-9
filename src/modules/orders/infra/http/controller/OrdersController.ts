import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const findOrderService = container.resolve(FindOrderService);
    const order = await findOrderService.execute({
      id: request.params.id,
    });
    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createOrderService = container.resolve(CreateOrderService);
    const order = await createOrderService.execute({
      customer_id: request.body.customer_id,
      products: request.body.products,
    });
    return response.json(order);
  }
}
